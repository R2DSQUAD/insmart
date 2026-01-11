"use client";

import { useState, useEffect } from 'react';
import { useCookieInfo } from '../../contexts/CookieContext';

interface Employer {
  employer_id: string;
  year: string;
  name: string;
  payment_type: string;
  card_company?: string;
  bank_name?: string;
  card_number?: string;
  account_number?: string;
  total_amount?: number;
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

export default function EmployerView({ auth }: Props) {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);
  // 부모에서 받은 auth 사용
  const cookieInfo = auth;

  const fetchEmployers = async () => {
    setLoading(true);
    try {
      const { type, pinCode, region, local_government } = cookieInfo;
      if (!type || !pinCode || !region || !local_government) {
        setLoading(false);
        return;
      }
      const params = new URLSearchParams({ type, pinCode, region, local_government });
      const res = await fetch(`/api/employer?${params.toString()}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setEmployers(data.data || []);
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
    fetchEmployers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);

  function getPaymentLabel(type: string) {
    if (!type) return '';
    if (type === 'AUTO_TRANSFER' || type === 'auto' || type === 'auto_transfer') return '자동이체';
    if (type === 'SYSTEM_PAYMENT' || type === 'direct' || type === 'system_payment') return '직접납입';
    return type;
  }

  function maskMiddle(value?: string | number, head = 3, tail = 3) {
    if (value === undefined || value === null) return '정보가 없습니다.';
    const s = String(value).replace(/\s+/g, '');
    const len = s.length;
    if (len <= head + tail) {
      if (len <= 2) return s.replace(/./g, '*');
      const h = Math.max(1, Math.floor(len / 3));
      const t = h;
      const midLen = Math.max(0, len - h - t);
      return s.slice(0, h) + '*'.repeat(midLen) + s.slice(len - t);
    }
    return s.slice(0, head) + '*'.repeat(len - head - tail) + s.slice(len - tail);
  }

  return (
    <div>
      <h1>사업주 현황 조회</h1>
      {loading && <p>로딩 중...</p>}
      {!loading && employers.length === 0 && <p>등록된 사업주가 없습니다.</p>}
      {!loading && employers.length > 0 && (
        <div style={{overflowX: 'auto', maxWidth: '100%'}}>
          <table border={1} cellPadding={10} style={{ width: "100%", borderCollapse: "collapse", tableLayout: "auto", wordBreak: "break-all", whiteSpace: "pre-line", borderColor: "black" }}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>신청연도</th>
                    <th>이름</th>
                    <th>결제방식</th>
                    <th>카드회사</th>
                    <th>은행이름</th>
                    <th>카드번호</th>
                    <th>계좌번호</th>
                    <th>총금액</th>
                  </tr>
                </thead>
                <tbody>
                  {employers.map((employerRaw) => {
                    const e = employerRaw as unknown as Record<string, unknown>;
                    const id = (e['employer_id'] as string) ?? (e['employer_id'] as number) ?? '';
                    const year = (e['year'] as string) ?? (e['신청연도'] as string) ?? '';
                    const name = (e['name'] as string) ?? (e['이름'] as string) ?? (e['owner_name'] as string) ?? '';
                    const paymentType = getPaymentLabel((e['payment_type'] as string) ?? (e['결제방식'] as string) ?? (e['payment_method'] as string) ?? '');
                    const cardCompany = (e['card_company'] as string) ?? (e['카드회사'] as string) ?? '';
                    const bankName = (e['bank_name'] as string) ?? (e['은행이름'] as string) ?? '';
                    const cardNumber = (e['card_number'] as string) ?? (e['카드번호'] as string) ?? (e['card_no'] as string) ?? '';
                    const accountNumber = (e['account_number'] as string) ?? (e['계좌번호'] as string) ?? (e['account_no'] as string) ?? '';
                    const totalAmount = (e['total_amount'] as number) ?? (e['총금액'] as number) ?? null;
                    return (
                      <tr key={id}>
                        <td>{id}</td>
                        <td>{year}</td>
                        <td>{name}</td>
                        <td>{paymentType}</td>
                        <td>{cardCompany || '정보가 없습니다.'}</td>
                        <td>{bankName || '정보가 없습니다.'}</td>
                        <td>{cardNumber ? maskMiddle(cardNumber, 3, 3) : '정보가 없습니다.'}</td>
                        <td>{accountNumber ? maskMiddle(accountNumber, 3, 3) : '정보가 없습니다.'}</td>
                        <td>{totalAmount !== undefined && totalAmount !== null ? `${Number(totalAmount).toLocaleString()}원` : '정보가 없습니다.'}</td>
                      </tr>
                    );
                  })}
                </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
