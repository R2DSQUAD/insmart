"use client";

import { useState, useEffect } from 'react';

interface WorkerInfo {
  이름?: string;
  name?: string;
  생년월일?: string;
  birth_date?: string;
  성별?: string;
  gender?: string;
  국가?: string;
  country_code?: string;
  여권번호?: string;
  passport_id?: string;
  가입상태?: string;
  account_status?: string;
}

export default function SeasonWorkerInfoView() {
  const [workerInfo, setWorkerInfo] = useState<WorkerInfo | null>(null);
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
