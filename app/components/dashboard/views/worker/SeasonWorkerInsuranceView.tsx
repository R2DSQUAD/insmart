"use client";

import { useState, useEffect } from 'react';

// 1. 인터페이스는 잘 정의되어 있습니다.
interface Insurance {
  insurance_id: string;
  policy_number: string;
  insurance_start_date: string;
  insurance_end_date: string;
  insurance_fee?: number;
  cancellation_date?: string | null; // DB에서 null로 올 수 있으므로 타입을 조금 유연하게 잡습니다.
}

export default function SeasonWorkerInsuranceView() {
  const [insurances, setInsurances] = useState<Insurance[]>([]);
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
          // API 응답 구조가 맞는지 확인 필요하지만, 일단 data.data를 신뢰하고 넣습니다.
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
            {/* 2. 여기서 :any 를 제거했습니다. */}
            {insurances.map((insurance) => (
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