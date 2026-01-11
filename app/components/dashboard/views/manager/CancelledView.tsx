"use client";

import { useState, useEffect } from 'react';
import { getVisaLabel } from '@/lib/visa';

interface Worker {
  worker_id?: string;
  password?: string;
  country_code?: string;
  passport_id: string;
  passport_expired?: string;
  name: string;
  birth_date?: string;
  country?: string;
  gender?: string;
  register_status?: string;
  resident_id?: string;
  account_status: string;
  created_at?: string;
  updated_at?: string;
  manager_public_id?: string;
  employer_id?: string;
  bank_account_no?: string;
  bank_name?: string;
  visa_status?: string;
  id?: number | string;
  owner_name?: string;
  owner_phone?: string;
  policy_number?: string;
  insurance_period?: string;
  cancellation_request_date?: string;
  cancellation_date?: string;
}

interface AuthState {
  type: string;
  pinCode: string;
  region: string;
  local_government: string;
}

interface Props {
  auth: AuthState;
}

export default function SeasonWorkerCancelledView({ auth }: Props) {
  const [seasonWorkers, setSeasonWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  // 부모에서 받은 auth 사용
  const cookieInfo = auth;

  const fetchCancelled = async () => {
    setLoading(true);
    try {
      const { type, pinCode, region, local_government } = cookieInfo;
      if (!type || !pinCode || !region || !local_government) {
        setLoading(false);
        return;
      }
      
      const params = new URLSearchParams({ 
        type: type || "", 
        pinCode: pinCode || "", 
        region: region || "", 
        local_government: local_government || "" 
      });

      const res = await fetch(`/api/seasonWorker?${params.toString()}`, { credentials: 'include' });
      const data = await res.json();

      if (data.success) {
        // API에서 넘어온 Raw 데이터를 화면용으로 가공하고 '해지자'만 필터링
        const mapped: Worker[] = Array.isArray(data.data)
          ? (data.data as Record<string, unknown>[]).map((w) => ({
              id: (w['id'] as number) || (w['id'] as string) || undefined,
              visa_status: (w['visa_status'] as string) || '',
              owner_name: (w['owner_name'] as string) || '',
              owner_phone: (w['owner_phone'] as string) || '',
              policy_number: (w['policy_number'] as string) || '',
              name: (w['name'] as string) || '',
              passport_id: (w['passport_id'] as string) || '',
              country: (w['country'] as string) || '',
              gender: (w['gender'] as string) || '',
              birth_date: (w['birth_date'] as string) || '',
              insurance_period: (w['insurance_period'] as string) || '',
              account_status: (w['account_status'] as string) || '',
              cancellation_request_date: (w['cancellation_request_date'] as string) || '',
              cancellation_date: (w['cancellation_date'] as string) || ''
            }))
          : [];
        const targets = mapped.filter((w: Worker) => w.account_status === '해지자');
        setSeasonWorkers(targets as Worker[]);
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
    fetchCancelled();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);

  return (
    <div>
      <h1>계절근로자 해지자 현황 조회</h1>
      {loading && <p>로딩 중...</p>}
      {!loading && (
        <>
          {seasonWorkers.length === 0 ? (
            <p>해지자가 없습니다.</p>
          ) : (
            <div style={{overflowX: 'auto', maxWidth: '100%'}}>
              <table border={1} cellPadding={10} style={{ width: "100%", borderCollapse: "collapse", tableLayout: "auto", wordBreak: "break-all", whiteSpace: "pre-line", borderColor: "black" }}>
                <thead>
                  <tr>
                    <th>비자종류</th>
                    <th>사업주명</th>
                    <th>사업주 연락처</th>
                    <th>증권번호</th>
                    <th>이름(여권상의 영문명)</th>
                    <th>여권번호</th>
                    <th>국가</th>
                    <th>성별</th>
                    <th>생년월일</th>
                    <th>보험기간</th>
                    <th>가입상태</th>
                    <th>해지신청일</th>
                    <th>해지일</th>
                    <th>파일 다운로드</th>
                  </tr>
                </thead>
                <tbody>
                  {seasonWorkers.map((worker, idx) => (
                    <tr key={worker.id || worker.worker_id || worker.passport_id || `cancel-${idx}`}>
                      <td>{getVisaLabel(worker.visa_status)}</td>
                      <td>{worker.owner_name}</td>
                      <td>{worker.owner_phone}</td>
                      <td>{worker.policy_number}</td>
                      <td>{worker.name}</td>
                      <td>{worker.passport_id}</td>
                      <td>{worker.country}</td>
                      <td>{worker.gender === 'M' ? '남' : worker.gender === 'F' ? '여' : worker.gender}</td>
                      <td>{worker.birth_date}</td>
                      <td>{worker.insurance_period}</td>
                      <td>{worker.account_status}</td>
                      <td>{worker.cancellation_request_date}</td>
                      <td>{worker.cancellation_date}</td>
                      <td>
                        <button onClick={() => { alert('파일 다운로드 기능은 아직 구현되지 않았습니다'); }}>다운로드</button>
                      </td>
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