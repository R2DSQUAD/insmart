
"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "../../styles/auth/login.module.css";
import CustomSelect from "../common/CustomSelect";
import FormInput from "../common/FormInput";

export default function Login() {
  const router = useRouter();
  const [regions, setRegions] = useState<any[]>([]);
  const [localGovernments, setLocalGovernments] = useState<any[]>([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedLocalGov, setSelectedLocalGov] = useState("");
  const [userType, setUserType] = useState("");
  const [pin, setPin] = useState("");
  // 2단계용
  const [passportName, setPassportName] = useState("");
  const [passportNo, setPassportNo] = useState("");
  const [birth, setBirth] = useState("");
  const [employerName, setEmployerName] = useState("");
  const [phone, setPhone] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // userLogin만 2단계
  const pathname = usePathname();
  // userType 옵션 결정
  let userTypeOptions: { value: string; label: string }[] = [];
  if (pathname === "/adminLogin") {
    userTypeOptions = [
      { value: "public", label: "공공형" },
      { value: "general", label: "일반형" }
    ];
  } else if (pathname === "/userLogin") {
    userTypeOptions = [
      { value: "employer", label: "사업자" },
      { value: "seasonWorker", label: "계절노동자" }
    ];
  }

  // 최초 진입 시 userType 자동 설정
  // 기본값을 ''로 두고, 사용자가 명시적으로 선택하도록 함

  useEffect(() => {
    fetch("/api/region-localgov")
      .then((res) => res.json())
      .then((data) => {
        setRegions(data.regions);
        setLocalGovernments(data.localGovernments);
      });
  }, []);

  // 자치단체가 하나도 없는 region은 행정구역 select에서 제외
  const regionIdsWithLocalGov = new Set(localGovernments.map(lg => String(lg.region_id)));
  const filteredRegions = regions.filter(r => regionIdsWithLocalGov.has(String(r.region_id)));
  // 선택된 행정구역에 속한 자치단체만 필터링 (행정구역 선택 시만)
  const filteredLocalGovs = selectedRegion
    ? localGovernments.filter((lg) => String(lg.region_id) === selectedRegion)
    : localGovernments;

  // region_name, local_government_name 추출
  const regionName = regions.find(r => String(r.region_id) === selectedRegion)?.region_name || "";
  const localGovName = localGovernments.find(lg => String(lg.local_government_id) === selectedLocalGov)?.local_government_name || "";

  // 2단계 인증 핸들러 (2차 인증)
  const handleAuth = async () => {
    setLoading(true);
    let body: any = {
      type: userType,
      region: regionName,
      local_government: localGovName,
      pinCode: pin,
      step: 2  // 2차 인증임을 명시
    };
    if (userType === "seasonWorker") {
      body.name = passportName;
      body.passportNo = passportNo;
      body.birth = birth;
    } else if (userType === "employer") {
      body.name = employerName;
      body.phone = phone;
      // 문자 인증코드는 실제로 전송하지 않음 (뷰만 표시)
    }
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        alert("로그인 성공");

        // localStorage에 인증 정보 저장 (대시보드에서 사용)
        const authData = {
          type: userType,
          id: data.id || data.user?.id || '', // API에서 반환된 사용자 ID
          pinCode: pin,
          region: regionName,
          local_government: localGovName
        };

        console.log("💾 localStorage 저장:", authData);
        localStorage.setItem('authData', JSON.stringify(authData));

        // 쿠키에도 저장 (만료 1일)
        const expires = new Date(Date.now() + 86400 * 1000).toUTCString();
        document.cookie = `type=${encodeURIComponent(userType)}; expires=${expires}; path=/`;
        document.cookie = `pinCode=${encodeURIComponent(pin)}; expires=${expires}; path=/`;
        document.cookie = `region=${encodeURIComponent(regionName)}; expires=${expires}; path=/`;
        document.cookie = `local_government=${encodeURIComponent(localGovName)}; expires=${expires}; path=/`;

        // userType별로 정확히 분기
        if (userType === "seasonWorker") {
          router.push("/dashboard/seasonWorker");
        } else if (userType === "employer") {
          router.push("/dashboard/employer");
        } else if (userType === "public") {
          router.push("/dashboard/manager/public");
        } else if (userType === "general") {
          router.push("/dashboard/manager/general");
        } else {
          // fallback: 홈으로 이동
          router.push("/");
        }
      } else {
        alert(`로그인 실패: ${data.error || data.error_context || data.message || "알 수 없는 오류"}`);
      }
    } catch (e) {
      alert("네트워크 오류");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className={styles.login}>
      <div className={styles.loginContainer}>
        <div className={styles.titleContainer}>
          <h1 className={styles.title}>기관 선택</h1>
          <h4 className={styles.subtitle}>계절근로자 운영기관 선택</h4>
        </div>
        {step === 1 && (
          <form className={styles.loginForm} onSubmit={async (e) => {
            e.preventDefault();
            // 필수 값 검증
            if (!selectedRegion || !selectedLocalGov) {
              alert("행정지역과 자치단체를 선택해주세요.");
              return;
            }
            if (!pin.trim()) {
              alert("핀코드를 입력해주세요.");
              return;
            }
            setLoading(true);
            const body: any = {
              type: userType,
              region: regionName,
              local_government: localGovName,
              pinCode: pin
            };
            // userLogin일 경우 1차 인증임을 명시
            if (pathname === "/userLogin") {
              body.step = 1;
            }
            try {
              const res = await fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
              });
              const data = await res.json();
              if (data.success) {
                if (pathname === "/adminLogin") {
                  alert("로그인 성공");
                  // 인증정보를 쿠키에 저장 (만료 1일)
                  const expires = new Date(Date.now() + 86400 * 1000).toUTCString();
                  document.cookie = `type=${encodeURIComponent(userType)}; expires=${expires}; path=/`;
                  document.cookie = `pinCode=${encodeURIComponent(pin)}; expires=${expires}; path=/`;
                  document.cookie = `region=${encodeURIComponent(regionName)}; expires=${expires}; path=/`;
                  document.cookie = `local_government=${encodeURIComponent(localGovName)}; expires=${expires}; path=/`;
                  // 관리자 로그인 성공 시 관리자 페이지로 이동
                  if (userType === "public") {
                    router.push("/dashboard/manager/public");
                  } else if (userType === "general") {
                    router.push("/dashboard/manager/general");
                  }
                } else if (pathname === "/userLogin") {
                  alert("로그인 성공");
                  setStep(2);
                }
              } else {
                alert(`인증 실패: ${data.error || data.error_context || data.message || "알 수 없는 오류"}`);
              }
            } catch (e) {
              alert("네트워크 오류");
            } finally {
              setLoading(false);
            }
          }}>
            <div className={styles.loginFormGroup}>
              <label className={styles.label} htmlFor="userType">유형 선택 (계절근로자 / 사업주)</label>
              <CustomSelect
                options={[{ value: '', label: '선택하기' }, ...userTypeOptions]}
                value={userType}
                onChange={setUserType}
                placeholder="선택하기"
                className={styles.select}
              />
            </div>
            <div className={styles.loginFormGroup}>
              <label className={styles.label} htmlFor="region">행정구역</label>
              <CustomSelect
                options={[
                  { value: '', label: '선택하기' },
                  ...filteredRegions.map(region => ({
                    value: String(region.region_id),
                    label: region.region_name
                  }))
                ]}
                value={selectedRegion}
                onChange={val => {
                  setSelectedRegion(val);
                  setSelectedLocalGov("");
                }}
                placeholder="선택하기"
                className={styles.select}
              />
            </div>
            <div className={styles.loginFormGroup}>
              <label className={styles.label} htmlFor="localGov">자치단체 선택</label>
              <CustomSelect
                options={[
                  { value: '', label: '선택하기' },
                  ...filteredLocalGovs.map(lg => ({
                    value: String(lg.local_government_id),
                    label: lg.local_government_name
                  }))
                ]}
                value={selectedLocalGov}
                onChange={val => {
                  setSelectedLocalGov(val);
                  const lg = localGovernments.find(lg => String(lg.local_government_id) === val);
                  if (lg) setSelectedRegion(String(lg.region_id));
                }}
                placeholder="선택하기"
                className={styles.select}
              />
            </div>
            <div className={styles.loginFormGroup}>
              <label className={styles.label} htmlFor="pin">핀번호 입력</label>
              <FormInput
                id="pin"
                type="text"
                placeholder="입력하기"
                value={pin}
                onChange={e => setPin(e.target.value)}
              />
            </div>
            <div className={styles.buttonContainer}>
              <button
              className={styles.submitButton}
              type="submit"
              disabled={
                !userType || !selectedRegion || !selectedLocalGov || !pin || loading
              }
            >
              핀번호 인증
            </button>
                        <button
              className={styles.homeButton}
              type="button"
              onClick={() => router.push('/')}
            >
              Home
            </button>
            </div>
          </form>
        )}
        {/* userLogin만 2차 인증 */}
        {step === 2 && pathname === "/userLogin" && (
          <form className={styles.loginForm} onSubmit={e => e.preventDefault()}>
            {userType === "seasonWorker" && (
              <>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="이름"
                  value={passportName}
                  onChange={e => setPassportName(e.target.value)}
                />
                <input
                  className={styles.input}
                  type="text"
                  placeholder="여권번호"
                  value={passportNo}
                  onChange={e => setPassportNo(e.target.value)}
                />
                <input
                  className={styles.input}
                  type="text"
                  placeholder="생년월일(YYMMDD)"
                  value={birth}
                  onChange={e => setBirth(e.target.value)}
                />
              </>
            )}
            {userType === "employer" && (
              <>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="사업주 이름"
                  value={employerName}
                  onChange={e => setEmployerName(e.target.value)}
                />
                <input
                  className={styles.input}
                  type="text"
                  placeholder="전화번호"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
                <input
                  className={styles.input}
                  type="text"
                  placeholder="문자인증코드"
                  value={smsCode}
                  onChange={e => setSmsCode(e.target.value)}
                />
              </>
            )}
            <button
              className={styles.button}
              type="button"
              onClick={handleAuth}
              disabled={
                loading ||
                (userType === "seasonWorker" && (!passportName || !passportNo || !birth)) ||
                (userType === "employer" && (!employerName || !phone))
              }
            >
              Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
