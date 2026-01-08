"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Login() {
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
  const [step, setStep] = useState(1); // 1: 기본, 2: 추가정보
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
  useEffect(() => {
    if (userTypeOptions.length > 0 && !userType) {
      setUserType(userTypeOptions[0].value);
    }
  }, [pathname]);

  useEffect(() => {
    fetch("/api/region-localgov")
      .then((res) => res.json())
      .then((data) => {
        setRegions(data.regions);
        setLocalGovernments(data.localGovernments);
      });
  }, []);

  const filteredLocalGovs = selectedRegion
    ? localGovernments.filter((lg) => String(lg.region_id) === selectedRegion)
    : [];

  // region_name, local_government_name 추출
  const regionName = regions.find(r => String(r.region_id) === selectedRegion)?.region_name || "";
  const localGovName = localGovernments.find(lg => String(lg.local_government_id) === selectedLocalGov)?.local_government_name || "";

  // 2단계 인증 핸들러
  const handleAuth = async () => {
    setLoading(true);
    let body: any = {
      type: userType,
      region: regionName,
      local_government: localGovName,
      pinCode: pin
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
      } else {
        alert(`로그인 실패: ${data.error || data.error_context || data.message || "알 수 없는 오류"}`);
      }
    } catch (e) {
      alert("네트워크 오류");
    } finally {
      setLoading(false);
    }
  };

  // 1단계 → 2단계로
  const handleNext = () => {
    setStep(2);
  };

  return (
    <>
      <h1>통합 로그인 테스트</h1>
      {step === 1 && (
        <>
          <div>
            <select value={userType} onChange={e => setUserType(e.target.value)}>
              {userTypeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <span style={{ marginLeft: 8 }}>
              (type: {userType})
            </span>
          </div>
          <select
            value={selectedRegion}
            onChange={(e) => {
              setSelectedRegion(e.target.value);
              setSelectedLocalGov("");
            }}
          >
            <option value="">행정구역 선택</option>
            {regions.map((region) => (
              <option key={region.region_id} value={region.region_id}>
                {region.region_name}
              </option>
            ))}
          </select>
          <select
            value={selectedLocalGov}
            onChange={e => setSelectedLocalGov(e.target.value)}
            disabled={!selectedRegion}
          >
            <option value="">자치단체 선택</option>
            {filteredLocalGovs.map((lg) => (
              <option key={lg.local_government_id} value={lg.local_government_id}>
                {lg.local_government_name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="핀코드 입력"
            value={pin}
            onChange={e => setPin(e.target.value)}
            style={{ marginLeft: 8 }}
          />
          <button
            onClick={handleNext}
            disabled={
              !selectedRegion || !selectedLocalGov || !pin || loading
            }
            style={{ marginLeft: 8 }}
          >
            다음
          </button>
        </>
      )}
      {step === 2 && (
        <>
          {/* 추가 정보 입력: seasonWorker, employer만 */}
          {userType === "seasonWorker" && (
            <>
              <input
                type="text"
                placeholder="이름"
                value={passportName}
                onChange={e => setPassportName(e.target.value)}
              />
              <input
                type="text"
                placeholder="여권번호"
                value={passportNo}
                onChange={e => setPassportNo(e.target.value)}
                style={{ marginLeft: 8 }}
              />
              <input
                type="text"
                placeholder="생년월일(YYYY-MM-DD)"
                value={birth}
                onChange={e => setBirth(e.target.value)}
                style={{ marginLeft: 8 }}
              />
            </>
          )}
          {userType === "employer" && (
            <>
              <input
                type="text"
                placeholder="사업주 이름"
                value={employerName}
                onChange={e => setEmployerName(e.target.value)}
              />
              <input
                type="text"
                placeholder="전화번호"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                style={{ marginLeft: 8 }}
              />
              <input
                type="text"
                placeholder="문자인증코드"
                value={smsCode}
                onChange={e => setSmsCode(e.target.value)}
                style={{ marginLeft: 8 }}
              />
            </>
          )}
          <button
            onClick={handleAuth}
            disabled={
              loading ||
              (userType === "seasonWorker" && (!passportName || !passportNo || !birth)) ||
              (userType === "employer" && (!employerName || !phone))
            }
            style={{ marginLeft: 8 }}
          >
            인증
          </button>
        </>
      )}
    </>
  );
}
