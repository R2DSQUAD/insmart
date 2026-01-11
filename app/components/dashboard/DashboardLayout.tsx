"use client";

import { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';
import { CookieContext } from './contexts/CookieContext';

// 뷰 컴포넌트 import
import WorkersView from './views/manager/WorkersView';
import EmployerView from './views/manager/EmployerView';
import CancelledView from './views/manager/CancelledView';
import UploadView from './views/manager/UploadView';
import CancelPendingListView from './views/manager/CancelPendingListView';

import PaymentAutoView from './views/payment/PaymentAutoView';
import PaymentSystemView from './views/payment/PaymentSystemView';

import EmployerPaymentsView from './views/employer/EmployerPaymentsView';

import SeasonWorkerInquiryView from './views/worker/SeasonWorkerInquiryView';
import SeasonWorkerCancellationView from './views/worker/SeasonWorkerCancellationView';

interface DashboardLayoutProps {
  userType: "public" | "general" | "employer" | "seasonWorker";
  children?: ReactNode;
}

export default function DashboardLayout({ userType, children }: DashboardLayoutProps) {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState("home");
  const [cookieInfo, setCookieInfo] = useState({
    type: '',
    pinCode: '',
    region: '',
    local_government: ''
  });

  // 쿠키에서 인증 정보 읽기 함수
  const readCookieInfo = () => {
    const getDecoded = (key: string) => {
      const raw = document.cookie.split('; ').find(row => row.startsWith(key + '='))?.split('=')[1];
      return raw ? decodeURIComponent(raw) : '';
    };
    return {
      type: getDecoded('type'),
      pinCode: getDecoded('pinCode'),
      region: getDecoded('region'),
      local_government: getDecoded('local_government')
    };
  };

  useEffect(() => {
    const newCookieInfo = readCookieInfo();
    if (JSON.stringify(cookieInfo) !== JSON.stringify(newCookieInfo)) {
      setCookieInfo(newCookieInfo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    // 쿠키 삭제
    document.cookie = "type=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "pinCode=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "region=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "local_government=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
    // localStorage 삭제
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authData');
    }
    
    // 로그인 페이지로 리다이렉트
    if (userType === "employer" || userType === "seasonWorker") {
      router.push("/userLogin");
    } else {
      router.push("/adminLogin");
    }
  };

  // 사이드바 타이틀 결정
  const getSidebarTitle = () => {
    switch (userType) {
      case "public":
        return "공공형 관리자";
      case "general":
        return "일반형 관리자";
      case "employer":
        return "사업주";
      case "seasonWorker":
        return "계절근로자";
      default:
        return "대시보드";
    }
  };

  return (
    <CookieContext.Provider value={cookieInfo}>
      <div className={styles.dashboardLayout}>
        {/* 왼쪽 사이드바 */}
        <aside className={styles.sidebar}>
          <h2>{getSidebarTitle()}</h2>
          
          {/* 관리자용 메뉴 */}
          {(userType === "public" || userType === "general") && (
            <ul className={styles.menuList}>
              <li className={styles.menuGroupTitle}>계절근로자</li>
              <ul className={styles.subMenuList}>
                <li
                  className={`${styles.menuItem} ${activeMenu === "workers" ? styles.active : ""}`}
                  onClick={() => setActiveMenu("workers")}
                >
                  현황 조회
                </li>
                <li
                  className={`${styles.menuItem} ${activeMenu === "cancelled" ? styles.active : ""}`}
                  onClick={() => setActiveMenu("cancelled")}
                >
                  해지자 현황
                </li>
                <li
                  className={`${styles.menuItem} ${activeMenu === "upload" ? styles.active : ""}`}
                  onClick={() => setActiveMenu("upload")}
                >
                  가입 및 수정 신청
                </li>
              </ul>
              <li className={styles.menuGroupTitle}>사업주</li>
              <ul className={styles.subMenuList}>
                <li
                  className={`${styles.menuItem} ${activeMenu === "employers" ? styles.active : ""}`}
                  onClick={() => setActiveMenu("employers")}
                >
                  사업주 현황 조회
                </li>
              </ul>
              <li className={styles.menuGroupTitle}>결제 현황</li>
              <ul className={styles.subMenuList}>
                <li
                  className={`${styles.menuItem} ${activeMenu === "payment-auto" ? styles.active : ""}`}
                  onClick={() => setActiveMenu("payment-auto")}
                >
                  자동이체 신청 지자체
                </li>
                <li
                  className={`${styles.menuItem} ${activeMenu === "payment-system" ? styles.active : ""}`}
                  onClick={() => setActiveMenu("payment-system")}
                >
                  시스템 결제 신청 지자체
                </li>
              </ul>
            </ul>
          )}

          {/* 사업주용 메뉴 */}
          {userType === "employer" && (
            <ul className={styles.menuList}>
              <li
                className={`${styles.menuItem} ${activeMenu === "payments" ? styles.active : ""}`}
                onClick={() => setActiveMenu("payments")}
              >
                결제현황조회
              </li>
            </ul>
          )}

          {/* 계절근로자용 메뉴 */}
          {userType === "seasonWorker" && (
            <ul className={styles.menuList}>
              <li
                className={`${styles.menuItem} ${activeMenu === "inquiry" ? styles.active : ""}`}
                onClick={() => setActiveMenu("inquiry")}
              >
                조회
              </li>
              <li
                className={`${styles.menuItem} ${activeMenu === "cancellation" ? styles.active : ""}`}
                onClick={() => setActiveMenu("cancellation")}
              >
                해지
              </li>
            </ul>
          )}
          
          <button className={styles.logoutBtn} onClick={handleLogout}>
            로그아웃
          </button>
        </aside>

        {/* 오른쪽 컨텐츠 */}
        <main className={styles.content}>
          {children ? children : <DefaultContent activeMenu={activeMenu} userType={userType} cookieInfo={cookieInfo} />}
        </main>
      </div>
    </CookieContext.Provider>
  );
}

interface CookieInfoType {
  type: string;
  pinCode: string;
  region: string;
  local_government: string;
}

// 기본 컨텐츠 (activeMenu에 따라 분기)
function DefaultContent({ activeMenu, userType, cookieInfo }: { activeMenu: string; userType: string; cookieInfo: CookieInfoType }) {
  const { region, local_government, type } = cookieInfo;

  if (activeMenu === "home") {
    return (
      <div>
        <h1>정보 요약</h1>
        <p><strong>유형:</strong> {type === "public" ? "공공형" : "일반형"}</p>
        <p><strong>행정지역:</strong> {region || "미지정"}</p>
        <p><strong>자치단체:</strong> {local_government || "미지정"}</p>
      </div>
    );
  }

  // 지자체관리자 메뉴
  if (activeMenu === "workers") {
    return <WorkersView auth={cookieInfo} />;
  }
  if (activeMenu === "employers") {
    return <EmployerView auth={cookieInfo} />;
  }
  if (activeMenu === "cancelled") {
    return <CancelledView auth={cookieInfo} />;
  }
  if (activeMenu === "cancelPending") {
    return <CancelPendingListView />;
  }
  if (activeMenu === "upload") {
    return <UploadView />;
  }
  if (activeMenu === "payment-auto") {
    return <PaymentAutoView />;
  }
  if (activeMenu === "payment-system") {
    return <PaymentSystemView />;
  }

  // 사업주 메뉴
  if (userType === "employer") {
    if (activeMenu === "payments") {
      return <EmployerPaymentsView />;
    }
  }

  // 계절근로자 메뉴
  if (userType === "seasonWorker") {
    if (activeMenu === "inquiry") {
      return <SeasonWorkerInquiryView />;
    }
    if (activeMenu === "cancellation") {
      return <SeasonWorkerCancellationView />;
    }
  }

  return <div>메뉴를 선택하세요.</div>;
}
