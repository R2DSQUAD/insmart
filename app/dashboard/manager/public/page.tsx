"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// 쿠키에서 값 읽기 함수
function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop()!.split(';').shift()!);
  return "";
}

export default function PublicManagerDashboard() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 쿠키에서 인증정보 사용
    const type = getCookie("type") || "public";
    const pinCode = getCookie("pinCode") || "";
    const region = getCookie("region") || "";
    const local_government = getCookie("local_government") || "";
    // 필수값 없으면 요청하지 않음
    if (!type || !pinCode || !region || !local_government) {
      setLoading(false);
      return;
    }
    fetchWorkers(type, pinCode, region, local_government);
  }, []);

  const fetchWorkers = async (type: string, pinCode: string, region: string, local_government: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ type, pinCode, region, local_government });
      const res = await fetch(`/api/seasonWorker?${params.toString()}`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setWorkers(data.workers || []);
      } else {
        alert("데이터 조회 실패: " + (data.error || "알 수 없는 오류"));
      }
    } catch (e) {
      alert("네트워크 오류");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    router.push("/adminLogin");
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>계절근로자 목록</h1>
      <button onClick={handleLogout} style={{ marginBottom: 20 }}>
        로그아웃
      </button>
      {workers.length === 0 ? (
        <p>등록된 계절근로자가 없습니다.</p>
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
              <th>연락처</th>
            </tr>
          </thead>
          <tbody>
            {workers.map((worker) => (
              <tr key={worker.worker_id}>
                <td>{worker.worker_id}</td>
                <td>{worker.name}</td>
                <td>{worker.passport_id}</td>
                <td>{worker.birth_date}</td>
                <td>{worker.country_code}</td>
                <td>{worker.visa_code}</td>
                <td>{worker.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
