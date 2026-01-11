"use client";

import { useState, useEffect } from 'react';
import { getVisaLabel } from '@/lib/visa';

// 1. 화면에 보여줄(가공된) 데이터 인터페이스
interface Worker {
  visa_status: string;
  owner_name: string;
  owner_phone: string;
  policy_number: string;
  name: string;
  passport_id: string;
  country: string;
  gender: string;
  birth_date: string;
  insurance_period: string;
  account_status: string;
}

// 2. [추가] API에서 넘어오는 Raw 데이터 인터페이스 (모든 필드를 Optional로 처리하여 안전성 확보)
interface RawWorkerData {
  visa_status?: string;
  owner_name?: string;
  owner_phone?: string;
  policy_number?: string;
  name?: string;
  passport_id?: string;
  country?: string;
  gender?: string;
  birth_date?: string;
  insurance_period?: string;
  account_status?: string;
  [key: string]: unknown; // 그 외 알 수 없는 필드가 있을 경우를 대비 (any 대신 unknown 사용)
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

export default function WorkersView({ auth }: Props) {
  const [seasonWorkers, setSeasonWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const cookieInfo = auth;

  // 헬퍼 함수: 컴포넌트 내부 혹은 외부에 정의
  function formatBirthDate(dateStr: string) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yy}.${mm}.${dd}`;
  }

  const fetchWorkers = async () => {
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
        // 3. Record<string, any> 대신 RawWorkerData 인터페이스 사용
        const workers: Worker[] = Array.isArray(data.data) 
          ? data.data.map((w: RawWorkerData) => ({
              visa_status: w.visa_status || '',
              owner_name: w.owner_name || '',
              owner_phone: w.owner_phone || '',
              policy_number: w.policy_number || '',
              name: w.name || '',
              passport_id: w.passport_id || '',
              country: w.country || '',
              gender: w.gender === 'M' ? '남' : w.gender === 'F' ? '여' : '',
              birth_date: w.birth_date ? formatBirthDate(w.birth_date) : '',
              insurance_period: w.insurance_period || '',
              account_status: w.account_status || '',
            })) 
          : [];
        setSeasonWorkers(workers);
      } else {
        setSeasonWorkers([]);
        alert("데이터 조회 실패: " + (data.error || "알 수 없는 오류"));
      }
    } catch (e) {
      console.error(e);
      alert("네트워크 오류");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);

  return (
    <div>
      <h1>계절근로자 현황 조회</h1>
      {loading && <p>로딩 중...</p>}
      {!loading && seasonWorkers.length === 0 && <p>등록된 계절근로자가 없습니다.</p>}
      {!loading && seasonWorkers.filter(w => w.account_status === '가입자' || w.account_status === '가입 예정자').length > 0 && (
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
              </tr>
            </thead>
            <tbody>
              {seasonWorkers.filter(w => w.account_status === '가입자' || w.account_status === '가입예정자').map((worker, idx) => (
                <tr key={idx}>
                  <td>{getVisaLabel(worker.visa_status)}</td>
                  <td>{worker.owner_name}</td>
                  <td>{worker.owner_phone}</td>
                  <td>{worker.policy_number}</td>
                  <td>{worker.name}</td>
                  <td>{worker.passport_id}</td>
                  <td>{worker.country}</td>
                  <td>{worker.gender}</td>
                  <td>{worker.birth_date}</td>
                  <td>{worker.insurance_period}</td>
                  <td>{worker.account_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}