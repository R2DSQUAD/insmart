"use client";

import { useState, useEffect } from 'react';

interface Worker {
  worker_id: string;
  name: string;
  country_code: string;
  passport_id: string;
  birth_date: string;
  gender: string;
  account_status: string;
}

// 부모에서 정의한 AuthState 타입을 가져오거나, 여기서 새로 정의합니다.
interface AuthState {
  type: string;
  pinCode: string;
  region: string;
  local_government: string;
}

interface Props {
  auth: AuthState;
}

export default function EmployerWorkersView({ auth }: Props) {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWorkers = async () => {
      try {
        // auth에서 필요한 값 사용
        const { type, pinCode, region, local_government } = auth;
        if (!type || !pinCode || !region || !local_government) {
          setLoading(false);
          return;
        }
        const params = new URLSearchParams({ type, pinCode, region, local_government });
        const res = await fetch(`/api/seasonWorker?${params.toString()}`);
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
  }, [auth]);

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
            {workers.map((worker) => (
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
