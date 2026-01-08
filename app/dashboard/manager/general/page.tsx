"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function GeneralManagerDashboard() {
  const [managers, setManagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/manager/general");
      const data = await res.json();
      if (data.success) {
        setManagers(data.managers || []);
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
      <h1>일반형 관리자 목록</h1>
      <button onClick={handleLogout} style={{ marginBottom: 20 }}>
        로그아웃
      </button>
      
      {managers.length === 0 ? (
        <p>등록된 일반형 관리자가 없습니다.</p>
      ) : (
        <table border={1} cellPadding={10} style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>관리자명</th>
              <th>연락처</th>
              <th>이메일</th>
            </tr>
          </thead>
          <tbody>
            {managers.map((manager) => (
              <tr key={manager.manager_general_id}>
                <td>{manager.manager_general_id}</td>
                <td>{manager.name || "-"}</td>
                <td>{manager.phone || "-"}</td>
                <td>{manager.email || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
