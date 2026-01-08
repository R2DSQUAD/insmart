CREATE TABLE admin (
  admin_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '관리자 PK',
  password VARCHAR(255) NOT NULL COMMENT 'PIN코드',
  name VARCHAR(255) NOT NULL COMMENT '관리자 이름',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일'
) COMMENT='관리자 테이블';

CREATE TABLE local_manager_public (
  manager_public_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '공공형 관리자 PK',
  admin_id BIGINT NOT NULL COMMENT '관리자 FK',
  password VARCHAR(255) NOT NULL COMMENT 'PIN코드',
  account_status ENUM('Active', 'ActivePending', 'Cancel', 'CancelPending') NOT NULL COMMENT '가입 상태',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
  FOREIGN KEY (admin_id) REFERENCES admin(admin_id)
) COMMENT='공공형 관리자 테이블';

CREATE TABLE local_manager_general (
  manager_general_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '일반형 관리자 PK',
  admin_id BIGINT NOT NULL COMMENT '관리자 FK',
  password VARCHAR(255) NOT NULL COMMENT 'PIN코드',
  account_status ENUM('Active', 'ActivePending', 'Cancel', 'CancelPending') NOT NULL COMMENT '가입 상태',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
  FOREIGN KEY (admin_id) REFERENCES admin(admin_id)
) COMMENT='일반형 관리자 테이블';

CREATE TABLE region (
  region_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '행정구역 PK',
  region_name VARCHAR(255) NOT NULL COMMENT '행정구역 이름'
) COMMENT='행정구역 테이블';

CREATE TABLE local_government (
  local_government_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '자치단체 PK',
  region_id INT NOT NULL COMMENT '행정구역 FK',
  manager_public_id BIGINT NOT NULL COMMENT '공공형 관리자 FK',
  manager_general_id BIGINT NOT NULL COMMENT '일반형 관리자 FK',
  region_name VARCHAR(255) NOT NULL COMMENT '행정구역 이름',
  local_government_name VARCHAR(255) NOT NULL COMMENT '자치단체 이름',
  FOREIGN KEY (region_id) REFERENCES region(region_id),
  FOREIGN KEY (manager_public_id) REFERENCES local_manager_public(manager_public_id),
  FOREIGN KEY (manager_general_id) REFERENCES local_manager_general(manager_general_id)
) COMMENT='자치단체 테이블';

CREATE TABLE employer (
  employer_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '사업자 PK',
  password VARCHAR(255) NOT NULL COMMENT 'PIN코드',
  owner_name VARCHAR(255) NOT NULL COMMENT '사업자 이름',
  business_name VARCHAR(255) NOT NULL COMMENT '상호명',
  business_reg_no VARCHAR(255) COMMENT '사업자등록번호',
  address VARCHAR(500) COMMENT '주소',
  phone VARCHAR(20) NOT NULL COMMENT '전화번호',
  account_status ENUM('Active', 'ActivePending', 'Cancel', 'CancelPending') NOT NULL COMMENT '가입 상태',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
  manager_general_id BIGINT NOT NULL COMMENT '일반형 관리자 FK',
  manager_public_id BIGINT NOT NULL COMMENT '공공형 관리자 FK',
  FOREIGN KEY (manager_general_id) REFERENCES local_manager_general(manager_general_id),
  FOREIGN KEY (manager_public_id) REFERENCES local_manager_public(manager_public_id)
) COMMENT='사업자 테이블';

CREATE TABLE season_worker (
  worker_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '노동자 PK',
  password VARCHAR(255) NOT NULL COMMENT 'PIN코드',
  country_code VARCHAR(3) NOT NULL COMMENT '출신국가코드',
  passport_id VARCHAR(255) NOT NULL COMMENT '여권번호',
  passport_expired VARCHAR(50) COMMENT '여권만료날짜',
  name VARCHAR(255) NOT NULL COMMENT '여권상 이름',
  birth_date DATE NOT NULL COMMENT '생년월일',
  gender ENUM('M', 'F') NOT NULL COMMENT '성별',
  register_status ENUM('IMMIGRATION', 'MOU', 'MARRIAGE', 'PUBLIC', 'OTHER', 'NONE') NOT NULL DEFAULT 'NONE' COMMENT '가입유형',
  resident_id VARCHAR(255) COMMENT '외국인등록번호',
  account_status ENUM('Active', 'ActivePending', 'Cancel', 'CancelPending') NOT NULL COMMENT '가입 상태',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
  manager_public_id BIGINT NOT NULL COMMENT '공공형 관리자 FK',
  employer_id BIGINT NOT NULL COMMENT '사업자 FK',
  bank_account VARCHAR(255) COMMENT '계좌번호',
  visa_code VARCHAR(20) COMMENT '비자유형 코드',
  FOREIGN KEY (manager_public_id) REFERENCES local_manager_public(manager_public_id),
  FOREIGN KEY (employer_id) REFERENCES employer(employer_id),
  FOREIGN KEY (visa_code) REFERENCES visa_status(visa_code)
) COMMENT='계절 노동자 테이블';

CREATE TABLE country (
  country_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '국가 PK',
  country_code VARCHAR(3) NOT NULL UNIQUE COMMENT 'ISO 3166-1 alpha-3 국가코드',
  country_name VARCHAR(100) NOT NULL COMMENT '국가명'
) COMMENT='국가 테이블';

CREATE TABLE visa_status (
  visa_status_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '비자유형 PK',
  visa_code VARCHAR(20) NOT NULL UNIQUE COMMENT '비자유형 코드',
  visa_description VARCHAR(255) COMMENT '비자 상세 내용'
) COMMENT='비자유형 테이블';

-- 보험 테이블
CREATE TABLE insurance (
  insurance_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '보험 PK',
  insurance_start_date DATE NOT NULL COMMENT '보험시작일',
  insurance_end_date DATE NOT NULL COMMENT '보험종료일',
  cancellation_request_date DATE COMMENT '보험해지신청일',
  cancellation_date DATE COMMENT '보험해지일(출국일)',
  worker_id BIGINT NOT NULL COMMENT '노동자 FK',
  FOREIGN KEY (worker_id) REFERENCES season_worker(worker_id)
) COMMENT='보험 테이블';

-- 결제방식 테이블
CREATE TABLE payment (
  payment_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '결제방식 PK',
  payment_type ENUM('자동이체', '시스템 결제') NOT NULL COMMENT '자동이체/시스템결제',
  payment_method ENUM('카드', '계좌', '기타') NOT NULL COMMENT '카드/계좌/기타',
  employer_id BIGINT NOT NULL COMMENT '사업자 FK',
  payment_amount BIGINT COMMENT '총 결제 금액',
  payment_status ENUM('완료', '대기', '환불', '오류') COMMENT '결제 상태',
  error_code VARBINARY(255) COMMENT '오류일 경우 에러코드',
  payment_date DATETIME COMMENT '결제 시간',
  FOREIGN KEY (employer_id) REFERENCES employer(employer_id)
) COMMENT='결제방식 테이블';

-- 계좌정보 테이블
CREATE TABLE bank_account (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '계좌정보 PK',
  payment_id BIGINT NOT NULL COMMENT '결제방식 FK',
  name VARCHAR(255) COMMENT '예금주 소유자 이름',
  account_no VARCHAR(255) COMMENT '계좌 번호',
  bank_name VARCHAR(255) COMMENT '은행 이름',
  FOREIGN KEY (payment_id) REFERENCES payment(payment_id)
) COMMENT='계좌정보 테이블';

-- 카드정보 테이블
CREATE TABLE credit_card (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '카드정보 PK',
  payment_id BIGINT NOT NULL COMMENT '결제방식 FK',
  name VARCHAR(255) COMMENT '카드 소유자 이름',
  card_no VARCHAR(255) COMMENT '카드 번호',
  FOREIGN KEY (payment_id) REFERENCES payment(payment_id)
) COMMENT='카드정보 테이블';

-- 에러코드 테이블
CREATE TABLE error_code (
  error_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '에러코드 PK',
  error_context VARCHAR(255) COMMENT '에러 설명',
  payment_id BIGINT NOT NULL COMMENT '결제방식 FK',
  FOREIGN KEY (payment_id) REFERENCES payment(payment_id)
) COMMENT='에러코드 테이블';