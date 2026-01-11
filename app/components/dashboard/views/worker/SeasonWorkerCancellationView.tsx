"use client";

import { useState, useEffect } from 'react';

// 1. Worker 데이터 타입 정의
interface WorkerInfo {
  account_status: string;
  bank_account?: string;
  bank_name?: string;
  // 필요한 다른 필드들이 있다면 추가
}

export default function SeasonWorkerCancellationView() {
  // 2. any 대신 명확한 타입 사용
  const [workerInfo, setWorkerInfo] = useState<WorkerInfo | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [departureDate, setDepartureDate] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankName, setBankName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 3. 날짜 계산 로직을 렌더링 외부로 분리 (가독성 및 성능 개선)
  // 오늘 날짜 기준 내일(min)과 10일 후(max) 계산
  const today = new Date();
  
  const minDateObj = new Date(today);
  minDateObj.setDate(today.getDate() + 1);
  const minDate = minDateObj.toISOString().split('T')[0];

  const maxDateObj = new Date(today);
  maxDateObj.setDate(today.getDate() + 10);
  const maxDate = maxDateObj.toISOString().split('T')[0];

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
          // 기존 정보가 있다면 미리 채워넣기
          if (data.data.bank_account) setBankAccount(data.data.bank_account);
          if (data.data.bank_name) setBankName(data.data.bank_name);
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
          <p>1. 해지 신청 시 계정 상태가 해지예정자로 변경됩니다.</p>
          <p>2. 환급금은 출국 후 입력하신 계좌로 지급됩니다.</p>
          <p>3. 해지 신청은 출국 1~10일 전에 가능합니다.</p>
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
                  // 4. 미리 계산해둔 변수 사용
                  min={minDate}
                  max={maxDate}
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