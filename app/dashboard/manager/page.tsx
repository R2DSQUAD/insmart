"use client";


// 탭 타입 정의
type TabType = "workers" | "cancelled" | "upload" | "employers";

import { useEffect, useState } from "react";
// 컴포넌트 경로가 정확한지 확인해주세요
import WorkersView from "@/app/components/dashboard/views/employer/EmployerWorkersView";
import CancelledView from "@/app/components/dashboard/views/manager/CancelledView";
import UploadView from "@/app/components/dashboard/views/manager/UploadView";
import EmployerView from "@/app/components/dashboard/views/manager/EmployerView";


// Auth 타입 정의 (자식에게 넘겨줄 때 타입 일치를 위해 필요)
export interface AuthState {
  type: string;
  pinCode: string;
  region: string;
  local_government: string;
}

export default function ManagerDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>("workers");
  const [auth, setAuth] = useState<AuthState>({ type: "", pinCode: "", region: "", local_government: "" });

  useEffect(() => {
    if (typeof window !== "undefined") {
      // setTimeout을 사용하여 비동기로 상태 업데이트 (렌더링 충돌 방지)
      const timer = setTimeout(() => {
        setAuth({
          type: localStorage.getItem("type") || "",
          pinCode: localStorage.getItem("pinCode") || "",
          region: localStorage.getItem("region") || "",
          local_government: localStorage.getItem("local_government") || ""
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>지자체 관리자 대시보드</h1>
      <div style={{ marginBottom: 24 }}>
        <button 
          onClick={() => setActiveTab("workers")} 
          style={{ marginRight: 8, fontWeight: activeTab === "workers" ? "bold" : undefined }}
        >
          계절근로자 현황
        </button>
        <button 
          onClick={() => setActiveTab("cancelled")} 
          style={{ marginRight: 8, fontWeight: activeTab === "cancelled" ? "bold" : undefined }}
        >
          해지자 현황
        </button>
        <button 
          onClick={() => setActiveTab("upload")} 
          style={{ marginRight: 8, fontWeight: activeTab === "upload" ? "bold" : undefined }}
        >
          가입/수정신청
        </button>
        <button 
          onClick={() => setActiveTab("employers")} 
          style={{ fontWeight: activeTab === "employers" ? "bold" : undefined }}
        >
          사업주 현황
        </button>
      </div>

      {/* 탭에 따른 컴포넌트 렌더링 */}
      {/* 각 View 컴포넌트가 auth prop을 필요로 한다면 전달해야 합니다. */}
      {activeTab === "workers" && <WorkersView auth={auth} />}
      {activeTab === "cancelled" && <CancelledView auth={auth} />}
      {activeTab === "upload" && <UploadView />}
      {/* EmployerView에도 데이터를 조회하려면 auth 정보가 필요할 것으로 예상되어 추가했습니다. */}
      {activeTab === "employers" && <EmployerView auth={auth} />}
    </div>
  );
}