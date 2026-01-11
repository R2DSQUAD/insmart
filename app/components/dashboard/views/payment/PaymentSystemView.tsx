"use client";


import { useState, useEffect } from 'react';

interface PaymentData {
  id: number;
  지자체: string;
  결제방식: string;
  은행?: string;
  계좌번호?: string;
  카드사?: string;
  카드번호?: string;
  사업주명: string;
  입금현황: string;
  인원: number;
  거주개월: number;
  최종금액: number;
}

export default function PaymentSystemView() {
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<PaymentData[]>([]);

  useEffect(() => {
    // TODO: API 연동 (시스템 결제 신청한 지자체 데이터 조회)
    // 임시 더미 데이터
    const dummyData: PaymentData[] = [
      {
        id: 1,
        지자체: '부산시 해운대구',
        결제방식: '계좌',
        은행: '우리은행',
        계좌번호: '220-300-000000',
        사업주명: '(주)농업법인C',
        입금현황: '완료',
        인원: 8,
        거주개월: 4,
        최종금액: 4000000
      },
      {
        id: 2,
        지자체: '대구시 수성구',
        결제방식: '카드',
        카드사: '하나카드',
        카드번호: '9876-****-****-4321',
        사업주명: '(주)농업법인D',
        입금현황: '완료',
        인원: 12,
        거주개월: 7,
        최종금액: 6000000
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
      <h1>시스템 결제 신청 지자체 결제 현황 (구현안됨)</h1>
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
              {paymentData.map((item: PaymentData) => (
                <tr key={item.id}>
                  <td>{item.지자체}</td>
                  <td>{item.결제방식}</td>
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
