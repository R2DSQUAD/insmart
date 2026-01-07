# ✅ API 구조 재정리 완료

## 📋 변경 사항

### 1. **[id] 폴더 완전 제거**
- ❌ 삭제: `/api/admin/[id]/route.ts`
- ❌ 삭제: `/api/worker/[id]/route.ts`
- ✅ 모든 기능이 하나의 파일로 통합됨

### 2. **새로운 API 구조**

```
app/api/
├── admin/route.ts          ✅ GET, POST, PUT, DELETE 통합
├── worker/route.ts         ✅ GET, POST, PUT, DELETE 통합
├── employer/route.ts       ✅ GET, POST, PUT, DELETE 통합
├── manager/
│   └── public/route.ts     ✅ GET, POST, PUT, DELETE 통합
├── stats/route.ts          ✅ GET (통계)
├── seed/route.ts           ✅ POST (생성), DELETE (삭제)
└── reset-db/route.ts       ✅ POST (DB 초기화)
```

## 🎯 주요 기능

### **쿼리 파라미터 방식 사용**

모든 API가 쿼리 파라미터로 작동합니다:

#### 1. GET - 조회
```bash
# 전체 목록
GET /api/admin

# 특정 ID 조회
GET /api/admin?id=1

# 페이지네이션 (worker, employer)
GET /api/worker?page=1&limit=10

# 검색 (worker)
GET /api/worker?search=홍길동
```

#### 2. POST - 생성
```bash
POST /api/admin
Content-Type: application/json

{
  "password": "1234",
  "name": "관리자"
}
```

#### 3. PUT - 수정
```bash
# ID 파라미터 필수
PUT /api/admin?id=1
Content-Type: application/json

{
  "name": "새이름"
}
```

#### 4. DELETE - 삭제

**⭐ 특정 삭제:**
```bash
DELETE /api/admin?id=1
```

**⭐ 전체 삭제 (새로 추가됨!):**
```bash
# confirm=true 파라미터 필수
DELETE /api/admin?confirm=true

# confirm 없으면 경고 메시지 반환
DELETE /api/admin
→ {
  "success": false,
  "error": "전체 삭제하려면 confirm=true 파라미터가 필요합니다",
  "warning": "이 작업은 모든 관리자 데이터를 삭제합니다!"
}
```

## 📊 전체 삭제 기능

모든 리소스에 전체 삭제 기능이 추가되었습니다:

```bash
# 모든 관리자 삭제
DELETE /api/admin?confirm=true

# 모든 노동자 삭제  
DELETE /api/worker?confirm=true

# 모든 사업자 삭제
DELETE /api/employer?confirm=true

# 모든 공공형 관리자 삭제
DELETE /api/manager/public?confirm=true
```

## 🔄 API 응답 형식

### 성공 응답
```json
{
  "success": true,
  "data": {...},
  "message": "작업이 완료되었습니다"
}
```

### 목록 응답 (페이지네이션)
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### 에러 응답
```json
{
  "success": false,
  "error": "에러 메시지"
}
```

## 🎨 Swagger 문서 업데이트

새로운 Swagger UI에서 모든 API 확인 가능:

```
http://localhost:3000/api-doc
```

주요 태그:
- **Admin**: 관리자 API
- **Worker**: 노동자 API
- **Employer**: 사업자 API
- **Manager**: 지자체 관리자 API
- **Stats**: 통계 API
- **Utility**: 유틸리티 API (seed, reset-db)

## 📝 사용 예시

### 1. 관리자 관리
```bash
# 전체 목록
curl http://localhost:3000/api/admin

# 특정 관리자
curl http://localhost:3000/api/admin?id=1

# 생성
curl -X POST http://localhost:3000/api/admin \
  -H "Content-Type: application/json" \
  -d '{"password":"1234","name":"홍길동"}'

# 수정
curl -X PUT "http://localhost:3000/api/admin?id=1" \
  -H "Content-Type: application/json" \
  -d '{"name":"김철수"}'

# 특정 삭제
curl -X DELETE "http://localhost:3000/api/admin?id=1"

# ⚠️ 전체 삭제
curl -X DELETE "http://localhost:3000/api/admin?confirm=true"
```

### 2. 노동자 관리
```bash
# 페이지네이션
curl "http://localhost:3000/api/worker?page=1&limit=20"

# 검색
curl "http://localhost:3000/api/worker?search=홍길동"

# 특정 조회
curl "http://localhost:3000/api/worker?id=5"

# ⚠️ 전체 삭제
curl -X DELETE "http://localhost:3000/api/worker?confirm=true"
```

### 3. 유틸리티
```bash
# 더미 데이터 생성
curl -X POST http://localhost:3000/api/seed

# 더미 데이터 삭제
curl -X DELETE http://localhost:3000/api/seed

# DB 초기화 (⚠️ 위험)
curl -X POST http://localhost:3000/api/reset-db

# 통계
curl http://localhost:3000/api/stats
```

## ✨ 개선 요약

1. ✅ [id] 폴더 제거 - 하나의 파일로 통합
2. ✅ 쿼리 파라미터 방식 사용 (REST 표준)
3. ✅ 전체 삭제 기능 추가 (confirm=true 보호)
4. ✅ 일관된 에러 처리
5. ✅ 페이지네이션 지원
6. ✅ 검색 기능 (worker)
7. ✅ Swagger 문서 업데이트
8. ✅ 코드 중복 제거

## 🚀 서버 시작

```bash
npm run dev
```

API 문서: http://localhost:3000/api-doc
