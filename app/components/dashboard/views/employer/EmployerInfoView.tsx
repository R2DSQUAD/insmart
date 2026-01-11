"use client";

import { useState, useEffect } from 'react';

interface EmployerInfo {
  business_name: string;
  owner_name: string;
  business_reg_no: string;
  phone: string;
  address: string;
  account_status: string;
}

export default function EmployerInfoView() {
  const [employerInfo, setEmployerInfo] = useState<EmployerInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEmployerData = async () => {
      try {
        const authData = localStorage.getItem('authData');
        if (!authData) return;
        
        const parsed = JSON.parse(authData);
        const employerId = parsed.id;
        
        const res = await fetch(`/api/employer/${employerId}`);
        if (res.ok) {
          const data = await res.json();
          setEmployerInfo(data.data);
        }
      } catch (error) {
        console.error('사업주 정보 로딩 오류:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadEmployerData();
  }, []);

  if (loading) return <p>로딩 중...</p>;
  if (!employerInfo) return <p>사업장 정보를 불러올 수 없습니다.</p>;

  return (
    <div>
      <h1>사업장 정보</h1>
      <table border={1} cellPadding={10} style={{ width: "100%", borderCollapse: "collapse", borderColor: "black" }}>
        <tbody>
          <tr>
            <th style={{ width: "30%", background: "#f5f5f5" }}>사업장명</th>
            <td>{employerInfo.business_name}</td>
          </tr>
          <tr>
            <th style={{ background: "#f5f5f5" }}>대표자명</th>
            <td>{employerInfo.owner_name}</td>
          </tr>
          <tr>
            <th style={{ background: "#f5f5f5" }}>사업자등록번호</th>
            <td>{employerInfo.business_reg_no}</td>
          </tr>
          <tr>
            <th style={{ background: "#f5f5f5" }}>연락처</th>
            <td>{employerInfo.phone}</td>
          </tr>
          <tr>
            <th style={{ background: "#f5f5f5" }}>주소</th>
            <td>{employerInfo.address}</td>
          </tr>
          <tr>
            <th style={{ background: "#f5f5f5" }}>계정 상태</th>
            <td>{employerInfo.account_status}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
