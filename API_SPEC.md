# 인스마트 API 명세서

## 인증/로그인

### POST /api/auth
- **설명:** 통합 로그인 (공공형/일반형 관리자, 사업주, 근로자)
- **Request Body**
  - type: "public" | "general" | "employer" | "seasonWorker"
  - region, local_government, pinCode, (name, phone, passportNo, birth 등)
- **Response**
  - 200: { success: true, user, group }
  - 401: { success: false, error }

---

## 더미데이터

### POST /api/seed
- **설명:** 더미데이터 생성
- **Response:** 생성된 데이터 요약

### DELETE /api/seed
- **설명:** 더미데이터 전체 삭제

---

## 관리자/매니저

### POST /api/admin/login
- **설명:** 최고관리자 로그인

---

## 사업주(Employer)

### GET /api/employer
- **설명:** 사업주 목록 조회

### GET /api/employer/[id]
- **설명:** 사업주 상세 조회

### POST /api/employer
- **설명:** 사업주 등록

### PUT /api/employer/[id]
- **설명:** 사업주 정보 수정

### DELETE /api/employer/[id]
- **설명:** 사업주 삭제

---

## 근로자(SeasonWorker)

### GET /api/seasonWorker
- **설명:** 근로자 목록 조회

### GET /api/seasonWorker/[worker_id]
- **설명:** 근로자 상세 조회

### GET /api/seasonWorker/[worker_id]/insurance
- **설명:** 근로자 보험 내역 조회

### POST /api/seasonWorker/[worker_id]/cancel
- **설명:** 근로자 해지 신청

### POST /api/seasonWorker/[worker_id]/insurance/[insurance_id]/cancel
- **설명:** 보험 해지 신청

---

## 보험(Insurance)

### GET /api/insurance/[insurance_id]/cancel-approve
- **설명:** 보험 해지 승인

### GET /api/insurance/[insurance_id]/cancel-reject
- **설명:** 보험 해지 반려

---

## 관리자 대시보드/통계

### GET /api/stats
- **설명:** 통계 데이터 조회

---

## 지역/지자체/매니저

### GET /api/region-localgov
- **설명:** 지역/지자체 목록 조회

### GET /api/manager/public
- **설명:** 공공형 관리자 목록

### GET /api/manager/general
- **설명:** 일반형 관리자 목록

---

## 기타

### GET /api-doc
- **설명:** Swagger/OpenAPI 문서 반환

### GET /api-doc
- **설명:** API 문서 페이지(프론트)

