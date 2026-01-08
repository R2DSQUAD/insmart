"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EmployerDashboard() {
  const [employers, setEmployers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchEmployers();
  }, []);

  const fetchEmployers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/employer");
      const data = await res.json();
      if (data.success) {
        setEmployers(data.employers || []);
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
    router.push("/userLogin");
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>사업자 목록</h1>
      <button onClick={handleLogout} style={{ marginBottom: 20 }}>
        로그아웃
      </button>
      
      {employers.length === 0 ? (
        <p>등록된 사업자가 없습니다.</p>
      ) : (
        <table border={1} cellPadding={10} style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>사업자명</th>
              <th>대표자명</th>
              <th>사업자번호</th>
              <th>연락처</th>
              <th>주소</th>
            </tr>
          </thead>
          <tbody>
            {employers.map((employer) => (
              <tr key={employer.employer_id}>
                <td>{employer.employer_id}</td>
                <td>{employer.business_name}</td>
                <td>{employer.owner_name}</td>
                <td>{employer.business_registration_no}</td>
                <td>{employer.phone}</td>
                <td>{employer.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
