"use client";


import { useEffect, useState } from "react";
import { getAccountStatusLabel } from "@/app/components/dashboard/accountStatusUtil";

type TabType = "workers" | "cancelled" | "upload" | "employers";

export default function ManagerDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>("workers");
  // 인증정보 localStorage에서 읽기
  const [auth, setAuth] = useState({ type: "", pinCode: "", region: "", local_government: "" });
  useEffect(() => {
    setAuth({
      type: localStorage.getItem("type") || "",
      pinCode: localStorage.getItem("pinCode") || "",
      region: localStorage.getItem("region") || "",
      local_government: localStorage.getItem("local_government") || ""
    });
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>지자체 관리자 대시보드</h1>
      <div style={{ marginBottom: 24 }}>
        <button onClick={() => setActiveTab("workers")} style={{ marginRight: 8, fontWeight: activeTab === "workers" ? "bold" : undefined }}>계절근로자 현황</button>
        <button onClick={() => setActiveTab("cancelled")} style={{ marginRight: 8, fontWeight: activeTab === "cancelled" ? "bold" : undefined }}>해지자 현황</button>
        <button onClick={() => setActiveTab("upload")} style={{ marginRight: 8, fontWeight: activeTab === "upload" ? "bold" : undefined }}>가입/수정신청</button>
        <button onClick={() => setActiveTab("employers")} style={{ fontWeight: activeTab === "employers" ? "bold" : undefined }}>사업주 현황</button>
      </div>
      {activeTab === "workers" && <WorkersView auth={auth} />}
      {activeTab === "cancelled" && <CancelledView auth={auth} />}
      {activeTab === "upload" && <UploadView />}
      {activeTab === "employers" && <EmployersView auth={auth} />}
    </div>
  );
}

function WorkersView({ auth }: { auth: any }) {
  const [seasonWorkers, setSeasonWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchWorkers = async () => {
      setLoading(true);
      try {
        const { type, pinCode, region, local_government } = auth;
        if (!type || !pinCode || !region || !local_government) {
          setLoading(false);
          return;
        }
        const params = new URLSearchParams({ type, pinCode, region, local_government });
        const res = await fetch(`/api/seasonWorker?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          // 가입자, 가입예정자만 (한글 기준)
          const filtered = (data.data || []).filter((w: any) => w.가입상태 === "가입자" || w.가입상태 === "가입예정자");
          setSeasonWorkers(filtered);
        } else {
          alert("데이터 조회 실패: " + (data.error || "알 수 없는 오류"));
        }
      } catch (e) {
        alert("네트워크 오류");
      } finally {
        setLoading(false);
      }
    };
    fetchWorkers();
  }, [auth]);
  return (
    <div>
      <h2>계절근로자 현황 조회</h2>
      {loading && <p>로딩 중...</p>}
      {!loading && seasonWorkers.length === 0 && <p>등록된 계절근로자가 없습니다.</p>}
      {!loading && seasonWorkers.length > 0 && (
        <table border={1} cellPadding={10} style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>이름</th>
              <th>여권번호</th>
              <th>생년월일</th>
              <th>국적</th>
              <th>비자코드</th>
              <th>사업주명</th>
              <th>사업주연락처</th>
              <th>증권번호</th>
              <th>가입상태</th>
            </tr>
          </thead>
          <tbody>
            {seasonWorkers.map((seasonWorker) => (
              <tr key={seasonWorker.id}>
                <td>{seasonWorker.id}</td>
                <td>{seasonWorker.이름}</td>
                <td>{seasonWorker.여권번호}</td>
                <td>{seasonWorker.생년월일}</td>
                <td>{seasonWorker.국가}</td>
                <td>{seasonWorker.visa_status}</td>
                <td>{seasonWorker.사업주명}</td>
                <td>{seasonWorker.사업주연락처}</td>
                <td>{seasonWorker.증권번호}</td>
                <td>{getAccountStatusLabel(seasonWorker.가입상태)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function CancelledView({ auth }: { auth: any }) {
  const [seasonWorkers, setSeasonWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchCancelled = async () => {
      setLoading(true);
      try {
        const { type, pinCode, region, local_government } = auth;
        if (!type || !pinCode || !region || !local_government) {
          setLoading(false);
          return;
        }
        const params = new URLSearchParams({ type, pinCode, region, local_government });
        const res = await fetch(`/api/seasonWorker?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setSeasonWorkers(data.data || []);
        } else {
          alert("데이터 조회 실패: " + (data.error || "알 수 없는 오류"));
        }
      } catch (e) {
        alert("네트워크 오류");
      } finally {
        setLoading(false);
      }
    };
    fetchCancelled();
  }, [auth]);

  // 해지자/해지신청자 분리
  const cancelledList = seasonWorkers.filter((w: any) => w.가입상태 === "해지자");
  const cancelPendingList = seasonWorkers.filter((w: any) => w.가입상태 === "해지예정자");

  return (
    <div>
      <h2>계절근로자 해지자 현황 조회</h2>
      {loading && <p>로딩 중...</p>}
      {/* 해지자 리스트 */}
      {!loading && (
        <>
          <h3 style={{marginTop:0}}>해지자 리스트</h3>
          {cancelledList.length === 0 ? (
            <p>해지자가 없습니다.</p>
          ) : (
            <table border={1} cellPadding={10} style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>이름</th>
                  <th>여권번호</th>
                  <th>생년월일</th>
                  <th>국적</th>
                  <th>비자코드</th>
                  <th>사업주명</th>
                  <th>사업주연락처</th>
                  <th>증권번호</th>
                  <th>가입상태</th>
                  <th>해지신청일</th>
                  <th>해지일</th>
                  <th>파일 다운로드</th>
                </tr>
              </thead>
              <tbody>
                {cancelledList.map((seasonWorker: any) => (
                  <tr key={seasonWorker.id}>
                    <td>{seasonWorker.id}</td>
                    <td>{seasonWorker.이름}</td>
                    <td>{seasonWorker.여권번호}</td>
                    <td>{seasonWorker.생년월일}</td>
                    <td>{seasonWorker.국가}</td>
                    <td>{seasonWorker.visa_status}</td>
                    <td>{seasonWorker.사업주명}</td>
                    <td>{seasonWorker.사업주연락처}</td>
                    <td>{seasonWorker.증권번호}</td>
                    <td>{getAccountStatusLabel(seasonWorker.가입상태)}</td>
                    <td>{seasonWorker.해지신청일 || ""}</td>
                    <td>{seasonWorker.해지일 || ""}</td>
                    <td><button disabled>다운로드</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* 해지신청자 리스트 */}
          <h3 style={{marginTop:40}}>해지신청자 리스트</h3>
          {cancelPendingList.length === 0 ? (
            <p>해지신청자가 없습니다.</p>
          ) : (
            <table border={1} cellPadding={10} style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>이름</th>
                  <th>여권번호</th>
                  <th>생년월일</th>
                  <th>국적</th>
                  <th>비자코드</th>
                  <th>사업주명</th>
                  <th>사업주연락처</th>
                  <th>증권번호</th>
                  <th>가입상태</th>
                  <th>해지신청일</th>
                  <th>파일 다운로드</th>
                </tr>
              </thead>
              <tbody>
                {cancelPendingList.map((seasonWorker: any) => (
                  <tr key={seasonWorker.id}>
                    <td>{seasonWorker.id}</td>
                    <td>{seasonWorker.이름}</td>
                    <td>{seasonWorker.여권번호}</td>
                    <td>{seasonWorker.생년월일}</td>
                    <td>{seasonWorker.국가}</td>
                    <td>{seasonWorker.visa_status}</td>
                    <td>{seasonWorker.사업주명}</td>
                    <td>{seasonWorker.사업주연락처}</td>
                    <td>{seasonWorker.증권번호}</td>
                    <td>{getAccountStatusLabel(seasonWorker.가입상태)}</td>
                    <td>{seasonWorker.해지신청일 || ""}</td>
                    <td><button disabled>다운로드</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}

function UploadView() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };
  const handleUpload = () => {
    if (!file) {
      alert("파일을 선택하세요.");
      return;
    }
    alert(`파일 업로드 준비됨: ${file.name}\n(엑셀 파싱 및 DB 저장은 추후 구현)`);
    setPreview([
      { name: "홍길동", passport: "M12345678", birth: "1990-01-01" },
      { name: "김철수", passport: "M87654321", birth: "1985-05-15" }
    ]);
  };
  return (
    <div>
      <h2>가입 및 수정 신청 (엑셀 업로드)</h2>
      <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} style={{ marginBottom: 20, fontSize: "1rem" }} />
      <button onClick={handleUpload} style={{ padding: "0.7rem 1.5rem", fontSize: "1rem" }}>
        업로드
      </button>
      {preview.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <h3>미리보기 (예시)</h3>
          <table border={1} cellPadding={10} style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>이름</th>
                <th>여권번호</th>
                <th>생년월일</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.name}</td>
                  <td>{row.passport}</td>
                  <td>{row.birth}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function EmployersView({ auth }: { auth: any }) {
  const [employers, setEmployers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchEmployers = async () => {
      setLoading(true);
      try {
        const { type, pinCode, region, local_government } = auth;
        if (!type || !pinCode || !region || !local_government) {
          setLoading(false);
          return;
        }
        const params = new URLSearchParams({ type, pinCode, region, local_government });
        const res = await fetch(`/api/employer?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setEmployers(data.data || []);
        } else {
          alert("데이터 조회 실패: " + (data.error || "알 수 없는 오류"));
        }
      } catch (e) {
        alert("네트워크 오류");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployers();
  }, [auth]);
  return (
    <div>
      <h2>사업주 현황 조회</h2>
      {loading && <p>로딩 중...</p>}
      {!loading && employers.length === 0 && <p>등록된 사업주가 없습니다.</p>}
      {!loading && employers.length > 0 && (
        <table border={1} cellPadding={10} style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>신청연도</th>
              <th>이름</th>
              <th>결제방식</th>
              <th>카드회사</th>
              <th>은행이름</th>
              <th>카드번호</th>
              <th>계좌번호</th>
              <th>총금액</th>
            </tr>
          </thead>
          <tbody>
            {employers.map((employer) => (
              <tr key={employer.employer_id}>
                <td>{employer.employer_id}</td>
                <td>{employer.신청연도}</td>
                <td>{employer.이름}</td>
                <td>{employer.결제방식}</td>
                <td>{employer.카드회사}</td>
                <td>{employer.은행이름}</td>
                <td>{employer.카드번호}</td>
                <td>{employer.계좌번호}</td>
                <td>{employer.총금액?.toLocaleString() || 0}원</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
