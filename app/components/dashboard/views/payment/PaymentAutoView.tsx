"use client";

import { useState, useEffect } from 'react';

// 1. 데이터 형태에 맞는 인터페이스 정의
// 은행, 계좌번호, 카드사, 카드번호는 상황에 따라 없을 수 있으므로 ?(Optional) 처리
interface PaymentData {
  id: number;
  지자체: string;
  결제방식: string;
  은행?: string;       // 선택적
  계좌번호?: string;   // 선택적
  카드사?: string;     // 선택적
  카드번호?: string;   // 선택적
  사업주명: string;
  입금현황: string;
  인원: number;
  거주개월: number;
  최종금액: number;
}

export default function PaymentAutoView() {
  const [loading, setLoading] = useState(true);
  
  // 2. any[] 대신 PaymentData[] 사용
  const [paymentData, setPaymentData] = useState<PaymentData[]>([]);

  useEffect(() => {
    // TODO: API 연동 (자동이체 신청한 지자체 데이터 조회)
    // 임시 더미 데이터
    const dummyData: PaymentData[] = [
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
    ];
    setTimeout(() => {
      setPaymentData(dummyData);
      setLoading(false);
    }, 0);
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
                  {/* 선택적 속성이므로 값이 없을 경우를 대비해 OR 연산자 사용 (이미 잘 작성하셨습니다) */}
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