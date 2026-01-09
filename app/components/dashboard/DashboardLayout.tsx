"use client";

// 사업주 현황 조회 컴포넌트
function EmployerView() {
  const [employers, setEmployers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const cookieInfo = useCookieInfo();

  const fetchEmployers = async () => {
    setLoading(true);
    try {
      const { type, pinCode, region, local_government } = cookieInfo;
      if (!type || !pinCode || !region || !local_government) {
        setLoading(false);
        return;
      }
      const params = new URLSearchParams({ type, pinCode, region, local_government });
      const res = await fetch(`/api/employer?${params.toString()}`, { credentials: 'include' });
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

  useEffect(() => {
    fetchEmployers();
  }, []);

  return (
    <div>
      <h1>사업주 현황 조회</h1>
      {loading && <p>로딩 중...</p>}
      {!loading && employers.length === 0 && <p>등록된 사업주가 없습니다.</p>}
      {!loading && employers.length > 0 && (
        <div style={{overflowX: 'auto', maxWidth: '100%'}}>
          <table border={1} cellPadding={10} style={{ width: "100%", borderCollapse: "collapse", tableLayout: "auto", wordBreak: "break-all", whiteSpace: "pre-line", borderColor: "black" }}>
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
        </div>
      )}
    </div>
  );
}

// 가입상태 영문 → 한글 변환 함수
function getAccountStatusLabel(status: string) {
  switch (status) {
    case "active":
      return "가입자";
    case "activePending":
      return "가입예정자";
    case "cancel":
      return "해지자";
    case "cancelPending":
      return "해지예정자";
    default:
      return status;
  }
}

import { useState, useEffect, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import styles from "../../styles/dashboard/layout.module.css";

// 쿠키에서 값 읽기 함수
function getCookie(name: string) {
  if (typeof document === 'undefined') return "";
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop()!.split(';').shift()!);
  return "";
}

// 쿠키 정보를 전역으로 공유하기 위한 Context
interface CookieContextType {
  type: string;
  pinCode: string;
  region: string;
  local_government: string;
}

const CookieContext = createContext<CookieContextType>({
  type: "",
  pinCode: "",
  region: "",
  local_government: ""
});

// 쿠키 정보를 사용하는 훅
export function useCookieInfo() {
  return useContext(CookieContext);
}

interface DashboardLayoutProps {
  userType: "public" | "general" | "employer" | "seasonWorker";
  children?: React.ReactNode;
}

export default function DashboardLayout({ userType, children }: DashboardLayoutProps) {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState("home");
  const [cookieInfo, setCookieInfo] = useState<CookieContextType>({
    type: "",
    pinCode: "",
    region: "",
    local_government: ""
  });

  // 컴포넌트 마운트 시 쿠키 정보 로드
  useEffect(() => {
    const typeVal = getCookie("type");
    const pinCodeVal = getCookie("pinCode");
    const regionVal = getCookie("region");
    const localGovVal = getCookie("local_government");
    
    setCookieInfo({
      type: typeVal,
      pinCode: pinCodeVal,
      region: regionVal,
      local_government: localGovVal
    });
  }, []);

  const handleLogout = () => {
    // 쿠키 삭제
    document.cookie = "type=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "pinCode=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "region=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "local_government=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // localStorage 삭제
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authData');
    }
    // 로그인 페이지로 리다이렉트
    if (userType === "employer" || userType === "seasonWorker") {
      router.push("/userLogin");
    } else {
      router.push("/adminLogin");
    }
  };

  // 사이드바 타이틀 결정
  const getSidebarTitle = () => {
    switch (userType) {
      case "public":
        return "공공형 관리자";
      case "general":
        return "일반형 관리자";
      case "employer":
        return "사업주";
      case "seasonWorker":
        return "계절근로자";
      default:
        return "대시보드";
    }
  };

  return (
    <CookieContext.Provider value={cookieInfo}>
      <div className={styles.dashboardLayout}>
      {/* 왼쪽 사이드바 */}
      <aside className={styles.sidebar}>
        <h2>{getSidebarTitle()}</h2>
        
        {/* 관리자용 메뉴 */}
        {(userType === "public" || userType === "general") && (
          <ul className={styles.menuList}>
            <li className={styles.menuGroupTitle}>계절근로자</li>
            <ul className={styles.subMenuList}>
              <li
                className={`${styles.menuItem} ${activeMenu === "workers" ? styles.active : ""}`}
                onClick={() => setActiveMenu("workers")}
              >
                현황 조회
              </li>
              <li
                className={`${styles.menuItem} ${activeMenu === "cancelled" ? styles.active : ""}`}
                onClick={() => setActiveMenu("cancelled")}
              >
                해지자 현황
              </li>
              <li
                className={`${styles.menuItem} ${activeMenu === "upload" ? styles.active : ""}`}
                onClick={() => setActiveMenu("upload")}
              >
                가입 및 수정 신청
              </li>
            </ul>
            <li className={styles.menuGroupTitle}>사업주</li>
            <ul className={styles.subMenuList}>
              <li
                className={`${styles.menuItem} ${activeMenu === "employers" ? styles.active : ""}`}
                onClick={() => setActiveMenu("employers")}
              >
                사업주 현황 조회
              </li>
            </ul>
            <li className={styles.menuGroupTitle}>결제 현황</li>
            <ul className={styles.subMenuList}>
              <li
                className={`${styles.menuItem} ${activeMenu === "payment-auto" ? styles.active : ""}`}
                onClick={() => setActiveMenu("payment-auto")}
              >
                자동이체 신청 지자체
              </li>
              <li
                className={`${styles.menuItem} ${activeMenu === "payment-system" ? styles.active : ""}`}
                onClick={() => setActiveMenu("payment-system")}
              >
                시스템 결제 신청 지자체
              </li>
            </ul>
          </ul>
        )}

        {/* 사업주용 메뉴 */}
        {userType === "employer" && (
          <ul className={styles.menuList}>
            <li
              className={`${styles.menuItem} ${activeMenu === "payments" ? styles.active : ""}`}
              onClick={() => setActiveMenu("payments")}
            >
              결제현황조회
            </li>
          </ul>
        )}

        {/* 계절근로자용 메뉴 */}
        {userType === "seasonWorker" && (
          <ul className={styles.menuList}>
            <li
              className={`${styles.menuItem} ${activeMenu === "inquiry" ? styles.active : ""}`}
              onClick={() => setActiveMenu("inquiry")}
            >
              조회
            </li>
            <li
              className={`${styles.menuItem} ${activeMenu === "cancellation" ? styles.active : ""}`}
              onClick={() => setActiveMenu("cancellation")}
            >
              해지
            </li>
          </ul>
        )}
        
        <button className={styles.logoutBtn} onClick={handleLogout}>
          로그아웃
        </button>
      </aside>

      {/* 오른쪽 컨텐츠 */}
      <main className={styles.content}>
        {children ? children : <DefaultContent activeMenu={activeMenu} />}
      </main>
    </div>
    </CookieContext.Provider>
  );
}

// 기본 컨텐츠 (activeMenu에 따라 분기)
function DefaultContent({ activeMenu }: { activeMenu: string }) {
  const cookieInfo = useCookieInfo();
  const { region, local_government, type } = cookieInfo;

  if (activeMenu === "home") {
    return (
      <div>
        <h1>정보 요약</h1>
        <p><strong>유형:</strong> {type === "public" ? "공공형" : "일반형"}</p>
        <p><strong>행정지역:</strong> {region || "미지정"}</p>
        <p><strong>자치단체:</strong> {local_government || "미지정"}</p>
      </div>
    );
  }

  // 관리자 메뉴
  if (activeMenu === "workers") {
    return <WorkersView />;
  }
  if (activeMenu === "employers") {
    return <EmployerView />;
  }
  if (activeMenu === "cancelled") {
    return <CancelledView />;
  }
  if (activeMenu === "upload") {
    return <UploadView />;
  }
  if (activeMenu === "payment-auto") {
    return <PaymentAutoView />;
  }
  if (activeMenu === "payment-system") {
    return <PaymentSystemView />;
  }

  // 사업주 메뉴
  if (type === "employer") {
    if (activeMenu === "payments") {
      return <EmployerPaymentsView />;
    }
  }

  // 계절근로자 메뉴
  if (type === "seasonWorker") {
    if (activeMenu === "inquiry") {
      return <SeasonWorkerInquiryView />;
    }
    if (activeMenu === "cancellation") {
      return <SeasonWorkerCancellationView />;
    }
  }

  return <div>메뉴를 선택하세요.</div>;
}

// 계절근로자 현황 조회
function WorkersView() {
  const [seasonWorkers, setSeasonWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const cookieInfo = useCookieInfo();

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const { type, pinCode, region, local_government } = cookieInfo;

      if (!type || !pinCode || !region || !local_government) {
        setLoading(false);
        return;
      }

      const params = new URLSearchParams({ type, pinCode, region, local_government });
      const res = await fetch(`/api/seasonWorker?${params.toString()}`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
  // 가입자, 가입예정자만 보이게 (한글 기준)
  const filtered = (data.data || []).filter((w: any) =>
    w.가입상태 === "가입자" ||
    w.가입상태 === "가입예정자"
  );
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

  // 컴포넌트 마운트 시 자동 조회
  useEffect(() => {
    fetchWorkers();
  }, []);

  return (
    <div>
      <h1>계절근로자 현황 조회</h1>
      {loading && <p>로딩 중...</p>}
  {!loading && seasonWorkers.length === 0 && <p>등록된 계절근로자가 없습니다.</p>}
  {!loading && seasonWorkers.length > 0 && (
        <div style={{overflowX: 'auto', maxWidth: '100%'}}>
          <table border={1} cellPadding={10} style={{ width: "100%", borderCollapse: "collapse", tableLayout: "auto", wordBreak: "break-all", whiteSpace: "pre-line", borderColor: "black" }}>
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
        </div>
      )}
    </div>
  );
}

// 계절근로자 해지자 현황 (임시: 동일 API 사용, 추후 필터 추가 가능)
function CancelledView() {
  const [seasonWorkers, setSeasonWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const cookieInfo = useCookieInfo();

  const fetchCancelled = async () => {
    setLoading(true);
    try {
      const { type, pinCode, region, local_government } = cookieInfo;

      if (!type || !pinCode || !region || !local_government) {
        setLoading(false);
        return;
      }

      // TODO: API에서 account_status=Cancel 등 필터링 추가 필요
      const params = new URLSearchParams({ type, pinCode, region, local_government });
      const res = await fetch(`/api/seasonWorker?${params.toString()}`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
  // 해지자만 보이게 (한글 기준)
  const cancelled = (data.data || []).filter((w: any) => w.가입상태 === "해지자");
  setSeasonWorkers(cancelled);
      } else {
        alert("데이터 조회 실패: " + (data.error || "알 수 없는 오류"));
      }
    } catch (e) {
      alert("네트워크 오류");
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 자동 조회
  useEffect(() => {
    fetchCancelled();
  }, []);

  // 해지자와 해지신청자 분리
  const cancelledList = seasonWorkers.filter((w: any) => w.가입상태 === "해지자");
  const cancelPendingList = seasonWorkers.filter((w: any) => w.가입상태 === "해지예정자");

  return (
    <div>
      <h1>계절근로자 해지자 현황 조회</h1>
      {loading && <p>로딩 중...</p>}
      {!loading && (
        <>
          {/* 해지자 리스트 */}
          <h2 style={{marginTop: 0}}>해지자 리스트</h2>
          {cancelledList.length === 0 ? (
            <p>해지자가 없습니다.</p>
          ) : (
            <div style={{overflowX: 'auto', maxWidth: '100%'}}>
              <table border={1} cellPadding={10} style={{ width: "100%", borderCollapse: "collapse", tableLayout: "auto", wordBreak: "break-all", whiteSpace: "pre-line", borderColor: "black" }}>
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
                      <td>{seasonWorker.보험?.cancellation_request_date ? new Date(seasonWorker.보험.cancellation_request_date).toLocaleDateString('ko-KR') : seasonWorker.해지신청일 || ""}</td>
                      <td>{seasonWorker.보험?.cancellation_date ? new Date(seasonWorker.보험.cancellation_date).toLocaleDateString('ko-KR') : seasonWorker.해지일 || ""}</td>
                      <td><button disabled>다운로드</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 해지신청자 리스트 */}
          <h2 style={{marginTop: 40}}>해지신청자 리스트</h2>
          {cancelPendingList.length === 0 ? (
            <p>해지신청자가 없습니다.</p>
          ) : (
            <div style={{overflowX: 'auto', maxWidth: '100%'}}>
              <table border={1} cellPadding={10} style={{ width: "100%", borderCollapse: "collapse", tableLayout: "auto", wordBreak: "break-all", whiteSpace: "pre-line", borderColor: "black" }}>
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
                      <td>{seasonWorker.보험?.cancellation_request_date ? new Date(seasonWorker.보험.cancellation_request_date).toLocaleDateString('ko-KR') : seasonWorker.해지신청일 || ""}</td>
                      <td><button disabled>다운로드</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// 가입 및 수정 신청 (엑셀 업로드)
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
    // TODO: 엑셀 파싱 및 DB 저장 (현재는 프론트만)
    alert(`파일 업로드 준비됨: ${file.name}\n(엑셀 파싱 및 DB 저장은 추후 구현)`);
    // 임시 미리보기 데이터
    setPreview([
      { name: "홍길동", passport: "M12345678", birth: "1990-01-01" },
      { name: "김철수", passport: "M87654321", birth: "1985-05-15" }
    ]);
  };

  return (
    <div>
      <h1>가입 및 수정 신청 (엑셀 업로드)</h1>
      <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} style={{ marginBottom: 20, fontSize: "1rem" }} />
      <button onClick={handleUpload} style={{ padding: "0.7rem 1.5rem", fontSize: "1rem" }}>
        업로드
      </button>
      {preview.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <h2>미리보기 (예시)</h2>
          <table border={1} cellPadding={10} style={{ width: "100%", borderCollapse: "collapse", borderColor: "black" }}>
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

// 사업주 - 결제현황조회
function EmployerPaymentsView() {
  const [payments, setPayments] = useState<any[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const authData = localStorage.getItem('authData');
        if (!authData) return;
        
        const parsed = JSON.parse(authData);
        const employerId = parsed.id;
        
        const res = await fetch(`/api/employer/${employerId}`);
        if (res.ok) {
          const data = await res.json();
          const employerData = data.data;
          
          // payments 배열에서 결제 정보 추출
          if (employerData.payments && employerData.payments.length > 0) {
            setPayments(employerData.payments);
          }
        }
      } catch (error) {
        console.error('결제 정보 로딩 오류:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadPayments();
  }, []);

  // 결제일 클릭 핸들러
  const handlePaymentClick = (payment: any) => {
    setSelectedPayment(payment);
  };

  // 목록으로 돌아가기
  const handleBackToList = () => {
    setSelectedPayment(null);
  };

  if (loading) return <p>로딩 중...</p>;

  // 결제 상세 화면
  if (selectedPayment) {
    return (
      <div>
        <button onClick={handleBackToList} style={{ marginBottom: "20px", padding: "10px 20px", cursor: "pointer" }}>
          ← 목록으로
        </button>
        <h1>결제 상세 정보</h1>
  <table border={1} cellPadding={10} style={{ width: "100%", borderCollapse: "collapse", marginBottom: "30px", borderColor: "black" }}>
          <tbody>
            <tr>
              <th style={{ width: "30%", background: "#f5f5f5" }}>결제일</th>
              <td>{new Date(selectedPayment.payment_date).toLocaleDateString('ko-KR')}</td>
            </tr>
            <tr>
              <th style={{ background: "#f5f5f5" }}>입금현황</th>
              <td>{selectedPayment.payment_status || '완료'}</td>
            </tr>
            <tr>
              <th style={{ background: "#f5f5f5" }}>인원현황</th>
              <td>{selectedPayment.worker_count || 0}명</td>
            </tr>
            <tr>
              <th style={{ background: "#f5f5f5" }}>외국인근로자 거주 개월</th>
              <td>{selectedPayment.residence_months || 0}개월</td>
            </tr>
            <tr>
              <th style={{ background: "#f5f5f5" }}>보험료 최종금액</th>
              <td>{selectedPayment.final_amount?.toLocaleString() || '0'}원</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  // 결제 목록 화면
  return (
    <div>
      <h1>결제현황조회</h1>
      {payments.length === 0 ? (
        <p>결제 내역이 없습니다.</p>
      ) : (
  <table border={1} cellPadding={10} style={{ width: "100%", borderCollapse: "collapse", borderColor: "black" }}>
          <thead>
            <tr>
              <th>결제일</th>
              <th>인원</th>
              <th>최종금액</th>
              <th>상세보기</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment: any) => (
              <tr key={payment.payment_id}>
                <td>{new Date(payment.payment_date).toLocaleDateString('ko-KR')}</td>
                <td>{payment.worker_count || 0}명</td>
                <td>{payment.final_amount?.toLocaleString() || '0'}원</td>
                <td>
                  <button 
                    onClick={() => handlePaymentClick(payment)}
                    style={{ padding: "5px 15px", cursor: "pointer" }}
                  >
                    보기
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// 사업주 - 사업장 정보 뷰 (미사용)
function EmployerInfoView() {
  const [employerInfo, setEmployerInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEmployerData = async () => {
      try {
        const authData = localStorage.getItem('authData');
        if (!authData) return;
        
        const parsed = JSON.parse(authData);
        const employerId = parsed.id;
        
        const res = await fetch(`/api/employer/${employerId}`);
        if (res.ok) {
          const data = await res.json();
          setEmployerInfo(data.data);
        }
      } catch (error) {
        console.error('사업주 정보 로딩 오류:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadEmployerData();
  }, []);

  if (loading) return <p>로딩 중...</p>;
  if (!employerInfo) return <p>사업장 정보를 불러올 수 없습니다.</p>;

  return (
    <div>
      <h1>사업장 정보</h1>
  <table border={1} cellPadding={10} style={{ width: "100%", borderCollapse: "collapse", borderColor: "black" }}>
        <tbody>
          <tr>
            <th style={{ width: "30%", background: "#f5f5f5" }}>사업장명</th>
            <td>{employerInfo.business_name}</td>
          </tr>
          <tr>
            <th style={{ background: "#f5f5f5" }}>대표자명</th>
            <td>{employerInfo.owner_name}</td>
          </tr>
          <tr>
            <th style={{ background: "#f5f5f5" }}>사업자등록번호</th>
            <td>{employerInfo.business_reg_no}</td>
          </tr>
          <tr>
            <th style={{ background: "#f5f5f5" }}>연락처</th>
            <td>{employerInfo.phone}</td>
          </tr>
          <tr>
            <th style={{ background: "#f5f5f5" }}>주소</th>
            <td>{employerInfo.address}</td>
          </tr>
          <tr>
            <th style={{ background: "#f5f5f5" }}>계정 상태</th>
            <td>{employerInfo.account_status}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// 사업주 - 계절근로자 현황 뷰 (사업주 소속 근로자만)
function EmployerWorkersView() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWorkers = async () => {
      try {
        const authData = localStorage.getItem('authData');
        if (!authData) return;
        
        const parsed = JSON.parse(authData);
        const employerId = parsed.id;
        
        const res = await fetch(`/api/seasonWorker?employer_id=${employerId}`);
        if (res.ok) {
          const data = await res.json();
          setWorkers(data.data || []);
        }
      } catch (error) {
        console.error('근로자 정보 로딩 오류:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadWorkers();
  }, []);

  if (loading) return <p>로딩 중...</p>;

  return (
    <div>
      <h1>계절근로자 현황 ({workers.length}명)</h1>
      {workers.length === 0 ? (
        <p>등록된 계절근로자가 없습니다.</p>
      ) : (
  <table border={1} cellPadding={10} style={{ width: "100%", borderCollapse: "collapse", borderColor: "black" }}>
          <thead>
            <tr>
              <th>이름</th>
              <th>국가</th>
              <th>여권번호</th>
              <th>생년월일</th>
              <th>성별</th>
              <th>계정상태</th>
            </tr>
          </thead>
          <tbody>
            {workers.map((worker: any) => (
              <tr key={worker.worker_id}>
                <td>{worker.name}</td>
                <td>{worker.country_code}</td>
                <td>{worker.passport_id}</td>
                <td>{worker.birth_date}</td>
                <td>{worker.gender === 'M' ? '남성' : '여성'}</td>
                <td>{worker.account_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// 계절근로자 - 조회 (보험료 조회, 보험료 납부현황)
function SeasonWorkerInquiryView() {
  const [workerInfo, setWorkerInfo] = useState<any>(null);
  const [insurances, setInsurances] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const authData = localStorage.getItem('authData');
        if (!authData) return;
        
        const parsed = JSON.parse(authData);
        const workerId = parsed.id;
        
        // 근로자 정보 조회
        const workerRes = await fetch(`/api/seasonWorker/${workerId}`);
        if (workerRes.ok) {
          const workerData = await workerRes.json();
          setWorkerInfo(workerData.data);
          
          // 사업주 ID로 결제 정보 조회
          if (workerData.data.employer_id) {
            const employerRes = await fetch(`/api/employer/${workerData.data.employer_id}`);
            if (employerRes.ok) {
              const employerData = await employerRes.json();
              setPayments(employerData.data?.payments || []);
            }
          }
        }
        
        // 보험 내역 조회
        const insuranceRes = await fetch(`/api/seasonWorker/${workerId}/insurance`);
        if (insuranceRes.ok) {
          const insuranceData = await insuranceRes.json();
          setInsurances(insuranceData.data || []);
        }
      } catch (error) {
        console.error('정보 로딩 오류:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  if (loading) return <p>로딩 중...</p>;
  if (!workerInfo) return <p>정보를 불러올 수 없습니다.</p>;

  return (
    <div>
      <h1>조회</h1>
      
      {/* 보험료 조회 */}
      <section style={{ marginBottom: "40px" }}>
        <h2>보험료 조회</h2>
        {insurances.length === 0 ? (
          <p>등록된 보험 내역이 없습니다.</p>
        ) : (
          <table border={1} cellPadding={10} style={{ width: "100%", borderCollapse: "collapse", borderColor: "black" }}>
            <thead>
              <tr>
                <th>증권번호</th>
                <th>보험시작일</th>
                <th>보험종료일</th>
                <th>보험료</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {insurances.map((insurance: any) => (
                <tr key={insurance.insurance_id}>
                  <td>{insurance.policy_number}</td>
                  <td>{new Date(insurance.insurance_start_date).toLocaleDateString('ko-KR')}</td>
                  <td>{new Date(insurance.insurance_end_date).toLocaleDateString('ko-KR')}</td>
                  <td>{insurance.insurance_fee?.toLocaleString() || '-'}원</td>
                  <td>{insurance.cancellation_date ? '해지' : '유효'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* 보험료 납부현황 (사업자가 결제를 했는지 안했는지) */}
      <section>
        <h2>보험료 납부현황</h2>
        {payments.length === 0 ? (
          <p style={{ color: "#d9534f", fontWeight: "bold" }}>사업주가 아직 결제하지 않았습니다.</p>
        ) : (
          <div>
            <p style={{ color: "#5cb85c", fontWeight: "bold", marginBottom: "20px" }}>
              사업주가 결제를 완료했습니다.
            </p>
            <table border={1} cellPadding={10} style={{ width: "100%", borderCollapse: "collapse", borderColor: "black" }}>
              <thead>
                <tr>
                  <th>결제일</th>
                  <th>결제금액</th>
                  <th>결제상태</th>
                  <th>인원</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment: any) => (
                  <tr key={payment.payment_id}>
                    <td>{new Date(payment.payment_date).toLocaleDateString('ko-KR')}</td>
                    <td>{payment.final_amount?.toLocaleString() || payment.payment_amount?.toLocaleString() || '0'}원</td>
                    <td>{payment.payment_status}</td>
                    <td>{payment.worker_count || '-'}명</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

// 계절근로자 - 해지 (약관 체크, 출국날짜, 계좌번호 입력)
function SeasonWorkerCancellationView() {
  const [workerInfo, setWorkerInfo] = useState<any>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [departureDate, setDepartureDate] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankName, setBankName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadWorkerData = async () => {
      try {
        const authData = localStorage.getItem('authData');
        if (!authData) return;
        
        const parsed = JSON.parse(authData);
        const workerId = parsed.id;
        
        const res = await fetch(`/api/seasonWorker/${workerId}`);
        if (res.ok) {
          const data = await res.json();
          setWorkerInfo(data.data);
          setBankAccount(data.data.bank_account || '');
        }
      } catch (error) {
        console.error('개인 정보 로딩 오류:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadWorkerData();
  }, []);

  const handleSubmit = async () => {
    if (!agreedToTerms) {
      alert('약관에 동의해주세요.');
      return;
    }
    if (!departureDate) {
      alert('출국날짜를 입력해주세요.');
      return;
    }
    if (!bankAccount) {
      alert('계좌번호를 입력해주세요.');
      return;
    }
    if (!bankName) {
      alert('은행명을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const authData = localStorage.getItem('authData');
      if (!authData) return;
      
      const parsed = JSON.parse(authData);
      const workerId = parsed.id;

      const res = await fetch(`/api/seasonWorker/${workerId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departure_date: departureDate,
          bank_account: bankAccount,
          bank_name: bankName
        })
      });

      if (res.ok) {
        alert('해지 신청이 완료되었습니다. 계정 상태가 "해지예정자"로 변경되었습니다.');
        // 페이지 새로고침하여 상태 업데이트
        window.location.reload();
      } else {
        const data = await res.json();
        alert('해지 신청 실패: ' + (data.error || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('해지 신청 오류:', error);
      alert('네트워크 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>로딩 중...</p>;
  if (!workerInfo) return <p>정보를 불러올 수 없습니다.</p>;

  // 이미 해지 상태인 경우
  if (workerInfo.account_status === '해지예정자' || workerInfo.account_status === '해지자') {
    return (
      <div>
        <h1>해지</h1>
        <p style={{ fontSize: "18px", color: "#d9534f", fontWeight: "bold" }}>
          현재 계정 상태: {workerInfo.account_status}
        </p>
        <p>이미 해지 신청이 완료되었거나 해지된 계정입니다.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>해지 신청</h1>
      
      <div style={{ marginBottom: "30px", padding: "20px", border: "1px solid #ddd", borderRadius: "5px" }}>
        <h3>약관</h3>
        <div style={{ 
          maxHeight: "200px", 
          overflowY: "scroll", 
          padding: "10px", 
          background: "#f9f9f9", 
          border: "1px solid #ccc",
          marginBottom: "15px"
        }}>
          <p><strong>보험 해지 약관</strong></p>
          <p>1. 해지 신청 시 계정 상태가 "해지예정자"로 변경됩니다.</p>
        </div>
        
        <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
          <input 
            type="checkbox" 
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            style={{ marginRight: "10px", width: "20px", height: "20px" }}
          />
          <span style={{ fontSize: "16px" }}>위 약관에 동의합니다.</span>
        </label>
      </div>

      <div style={{overflowX: 'auto', maxWidth: '100%'}}>
  <table border={1} cellPadding={10} style={{ width: "100%", borderCollapse: "collapse", marginBottom: "30px", tableLayout: "auto", wordBreak: "break-all", whiteSpace: "pre-line", borderColor: "black" }}>
        <tbody>
          <tr>
            <th style={{ width: "30%", background: "#f5f5f5" }}>출국날짜</th>
            <td>
              <input 
                type="date" 
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                style={{ width: "100%", padding: "8px", fontSize: "14px" }}
                min={(() => {
                  const d = new Date();
                  d.setDate(d.getDate() + 1);
                  return d.toISOString().split('T')[0];
                })()}
                max={(() => {
                  const d = new Date();
                  d.setDate(d.getDate() + 10);
                  return d.toISOString().split('T')[0];
                })()}
              />
            </td>
          </tr>
          <tr>
            <th style={{ background: "#f5f5f5" }}>은행명</th>
            <td>
              <select
                value={bankName}
                onChange={e => setBankName(e.target.value)}
                style={{ width: "100%", padding: "8px", fontSize: "14px" }}
              >
                <option value="">은행 선택</option>
                <option value="국민은행">국민은행</option>
                <option value="신한은행">신한은행</option>
                <option value="우리은행">우리은행</option>
                <option value="하나은행">하나은행</option>
                <option value="농협은행">농협은행</option>
                <option value="기업은행">기업은행</option>
                <option value="SC제일은행">SC제일은행</option>
                <option value="카카오뱅크">카카오뱅크</option>
                <option value="케이뱅크">케이뱅크</option>
                <option value="토스뱅크">토스뱅크</option>
                <option value="부산은행">부산은행</option>
                <option value="대구은행">대구은행</option>
                <option value="경남은행">경남은행</option>
                <option value="광주은행">광주은행</option>
                <option value="수협은행">수협은행</option>
                <option value="우체국">우체국</option>
                <option value="새마을금고">새마을금고</option>
                <option value="신협">신협</option>
                <option value="기타">기타</option>
              </select>
            </td>
          </tr>
          <tr>
            <th style={{ background: "#f5f5f5" }}>계좌번호 (본인계좌)</th>
            <td>
              <input 
                type="text" 
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                placeholder="예: 110-200-000000"
                style={{ width: "100%", padding: "8px", fontSize: "14px" }}
              />
            </td>
          </tr>
        </tbody>
        </table>
      </div>

      <button 
        onClick={handleSubmit}
        disabled={submitting || !agreedToTerms}
        style={{ 
          width: "100%", 
          padding: "15px", 
          fontSize: "18px", 
          backgroundColor: agreedToTerms ? "#d9534f" : "#ccc",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: agreedToTerms ? "pointer" : "not-allowed",
          fontWeight: "bold"
        }}
      >
        {submitting ? '처리 중...' : '해지 신청하기'}
      </button>
    </div>
  );
}

// 계절근로자 - 개인 정보 뷰 (미사용)
function SeasonWorkerInfoView() {
  const [workerInfo, setWorkerInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWorkerData = async () => {
      try {
        const authData = localStorage.getItem('authData');
        if (!authData) return;
        
        const parsed = JSON.parse(authData);
        const workerId = parsed.id;
        
        const res = await fetch(`/api/seasonWorker/${workerId}`);
        if (res.ok) {
          const data = await res.json();
          setWorkerInfo(data.data);
        }
      } catch (error) {
        console.error('개인 정보 로딩 오류:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadWorkerData();
  }, []);

  if (loading) return <p>로딩 중...</p>;
  if (!workerInfo) return <p>개인 정보를 불러올 수 없습니다.</p>;

  return (
    <div>
      <h1>개인 정보</h1>
  <table border={1} cellPadding={10} style={{ width: "100%", borderCollapse: "collapse", borderColor: "black" }}>
        <tbody>
          <tr>
            <th style={{ width: "30%", background: "#f5f5f5" }}>이름</th>
            <td>{workerInfo.이름 || workerInfo.name}</td>
          </tr>
          <tr>
            <th style={{ background: "#f5f5f5" }}>생년월일</th>
            <td>{workerInfo.생년월일 || workerInfo.birth_date}</td>
          </tr>
          <tr>
            <th style={{ background: "#f5f5f5" }}>성별</th>
            <td>{workerInfo.성별 === 'M' || workerInfo.gender === 'M' ? '남성' : '여성'}</td>
          </tr>
          <tr>
            <th style={{ background: "#f5f5f5" }}>국적</th>
            <td>{workerInfo.국가 || workerInfo.country_code}</td>
          </tr>
          <tr>
            <th style={{ background: "#f5f5f5" }}>여권번호</th>
            <td>{workerInfo.여권번호 || workerInfo.passport_id}</td>
          </tr>
          <tr>
            <th style={{ background: "#f5f5f5" }}>계정상태</th>
            <td>{workerInfo.가입상태 || workerInfo.account_status}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// 계절근로자 - 보험 내역 뷰
function SeasonWorkerInsuranceView() {
  const [insurances, setInsurances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInsurances = async () => {
      try {
        const authData = localStorage.getItem('authData');
        if (!authData) return;
        
        const parsed = JSON.parse(authData);
        const workerId = parsed.id;
        
        const res = await fetch(`/api/seasonWorker/${workerId}/insurance`);
        if (res.ok) {
          const data = await res.json();
          setInsurances(data.data || []);
        }
      } catch (error) {
        console.error('보험 내역 로딩 오류:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadInsurances();
  }, []);

  if (loading) return <p>로딩 중...</p>;

  return (
    <div>
      <h1>보험 내역</h1>
      {insurances.length === 0 ? (
        <p>등록된 보험 내역이 없습니다.</p>
      ) : (
  <table border={1} cellPadding={10} style={{ width: "100%", borderCollapse: "collapse", borderColor: "black" }}>
          <thead>
            <tr>
              <th>증권번호</th>
              <th>보험시작일</th>
              <th>보험종료일</th>
              <th>보험료</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {insurances.map((insurance: any) => (
              <tr key={insurance.insurance_id}>
                <td>{insurance.policy_number}</td>
                <td>{new Date(insurance.insurance_start_date).toLocaleDateString('ko-KR')}</td>
                <td>{new Date(insurance.insurance_end_date).toLocaleDateString('ko-KR')}</td>
                <td>{insurance.insurance_fee?.toLocaleString() || '-'}원</td>
                <td>{insurance.cancellation_date ? '해지' : '유효'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// 자동이체 신청 지자체 결제 현황
function PaymentAutoView() {
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<any[]>([]);

  useEffect(() => {
    // TODO: API 연동 (자동이체 신청한 지자체 데이터 조회)
    setLoading(false);
    // 임시 더미 데이터
    setPaymentData([
      {
        id: 1,
        지자체: '서울시 강남구',
        결제방식: '계좌',
        은행: '국민은행',
        계좌번호: '110-200-000000',
        사업주명: '(주)농업법인A',
        입금현황: '완료',
        인원: 10,
        거주개월: 6,
        최종금액: 5000000
      },
      {
        id: 2,
        지자체: '경기도 수원시',
        결제방식: '카드',
        카드사: '신한카드',
        카드번호: '1234-****-****-5678',
        사업주명: '(주)농업법인B',
        입금현황: '대기',
        인원: 5,
        거주개월: 3,
        최종금액: 2500000
      }
    ]);
  }, []);

  if (loading) return <p>로딩 중...</p>;

  return (
    <div>
      <h1>자동이체 신청 지자체 결제 현황 (구현안됨)</h1>
      {paymentData.length === 0 ? (
        <p>등록된 결제 현황이 없습니다.</p>
      ) : (
        <>
          <table border={1} cellPadding={10} style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px", borderColor: "black" }}>
            <thead>
              <tr>
                <th>지자체</th>
                <th>결제방식</th>
                <th>은행/카드사</th>
                <th>계좌번호/카드번호</th>
                <th>사업주명</th>
                <th>입금현황</th>
                <th>인원</th>
                <th>거주개월</th>
                <th>최종금액</th>
              </tr>
            </thead>
            <tbody>
              {paymentData.map((item) => (
                <tr key={item.id}>
                  <td>{item.지자체}</td>
                  <td>{item.결제방식}</td>
                  <td>{item.은행 || item.카드사}</td>
                  <td>{item.계좌번호 || item.카드번호}</td>
                  <td>{item.사업주명}</td>
                  <td>{item.입금현황}</td>
                  <td>{item.인원}명</td>
                  <td>{item.거주개월}개월</td>
                  <td>{item.최종금액.toLocaleString()}원</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              style={{
                padding: '10px 20px',
                fontSize: '16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
              onClick={() => alert('서류 다운로드 기능 (구현 예정)')}
            >
              서류 다운로드
            </button>
            <button
              style={{
                padding: '10px 20px',
                fontSize: '16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
              onClick={() => alert('서류 업로드 기능 (구현 예정)')}
            >
              서류 업로드
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// 시스템 결제 신청 지자체 결제 현황
function PaymentSystemView() {
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<any[]>([]);

  useEffect(() => {
    // TODO: API 연동 (시스템 결제 신청한 지자체 데이터 조회)
    setLoading(false);
    // 임시 더미 데이터
    setPaymentData([
      {
        id: 1,
        지자체: '부산시 해운대구',
        결제방식: '계좌',
        은행: '우리은행',
        계좌번호: '220-300-000000',
        사업주명: '(주)농업법인C',
        입금현황: '완료',
        인원: 8,
        거주개월: 4,
        최종금액: 4000000
      },
      {
        id: 2,
        지자체: '대구시 수성구',
        결제방식: '카드',
        카드사: '하나카드',
        카드번호: '9876-****-****-4321',
        사업주명: '(주)농업법인D',
        입금현황: '완료',
        인원: 12,
        거주개월: 7,
        최종금액: 6000000
      }
    ]);
  }, []);

  if (loading) return <p>로딩 중...</p>;

  return (
    <div>
      <h1>시스템 결제 신청 지자체 결제 현황 (구현안됨)</h1>
      {paymentData.length === 0 ? (
        <p>등록된 결제 현황이 없습니다.</p>
      ) : (
        <>
          <table border={1} cellPadding={10} style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px", borderColor: "black" }}>
            <thead>
              <tr>
                <th>지자체</th>
                <th>결제방식</th>
                <th>은행/카드사</th>
                <th>계좌번호/카드번호</th>
                <th>사업주명</th>
                <th>입금현황</th>
                <th>인원</th>
                <th>거주개월</th>
                <th>최종금액</th>
              </tr>
            </thead>
            <tbody>
              {paymentData.map((item) => (
                <tr key={item.id}>
                  <td>{item.지자체}</td>
                  <td>{item.결제방식}</td>
                  <td>{item.은행 || item.카드사}</td>
                  <td>{item.계좌번호 || item.카드번호}</td>
                  <td>{item.사업주명}</td>
                  <td>{item.입금현황}</td>
                  <td>{item.인원}명</td>
                  <td>{item.거주개월}개월</td>
                  <td>{item.최종금액.toLocaleString()}원</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              style={{
                padding: '10px 20px',
                fontSize: '16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
              onClick={() => alert('서류 다운로드 기능 (구현 예정)')}
            >
              서류 다운로드
            </button>
            <button
              style={{
                padding: '10px 20px',
                fontSize: '16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
              onClick={() => alert('서류 업로드 기능 (구현 예정)')}
            >
              서류 업로드
            </button>
          </div>
        </>
      )}
    </div>
  );
}
