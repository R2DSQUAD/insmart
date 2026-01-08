-- ============================================
-- 외국인 계절근로자 관리 시스템 데이터베이스 스키마
-- TypeORM Entity 기반 SQL DDL
-- ============================================

-- 1. admin (관리자)
CREATE TABLE `admin` (
  `admin_id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '관리자 PK',
  `password` VARCHAR(255) NOT NULL COMMENT 'PIN코드',
  `name` VARCHAR(255) NOT NULL DEFAULT '전체관리자' COMMENT '관리자이름',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='관리자';

-- 2. local_manager_public (공공형 관리자)
CREATE TABLE `local_manager_public` (
  `manager_public_id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '공공형 관리자 PK',
  `admin_id` BIGINT NOT NULL COMMENT '관리자 FK',
  `password` VARCHAR(255) NOT NULL COMMENT 'PIN코드',
  `account_status` ENUM('Active', 'ActivePending', 'Cancel', 'CancelPending') NOT NULL COMMENT '가입 상태',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
  FOREIGN KEY (`admin_id`) REFERENCES `admin`(`admin_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='공공형 관리자';

-- 3. local_manager_general (일반형 관리자)
CREATE TABLE `local_manager_general` (
  `manager_general_id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '일반형 관리자 PK',
  `admin_id` BIGINT NOT NULL COMMENT '관리자 FK',
  `password` VARCHAR(255) NOT NULL COMMENT 'PIN코드',
  `account_status` ENUM('Active', 'ActivePending', 'Cancel', 'CancelPending') NOT NULL COMMENT '가입 상태',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
  FOREIGN KEY (`admin_id`) REFERENCES `admin`(`admin_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='일반형 관리자';

-- 4. region (행정구역)
CREATE TABLE `region` (
  `region_id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '행정구역 PK',
  `region_name` VARCHAR(255) NOT NULL COMMENT '행정구역 이름'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='행정구역';

-- 5. local_government (자치단체)
CREATE TABLE `local_government` (
  `local_government_id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '자치단체 PK',
  `region_id` INT NOT NULL COMMENT '행정구역 FK',
  `manager_public_id` BIGINT NOT NULL COMMENT '공공형 관리자 FK',
  `manager_general_id` BIGINT NOT NULL COMMENT '일반형 관리자 FK',
  `region_name` VARCHAR(255) NOT NULL COMMENT '행정구역 이름',
  `local_government_name` VARCHAR(255) NOT NULL COMMENT '자치단체 이름',
  FOREIGN KEY (`region_id`) REFERENCES `region`(`region_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`manager_public_id`) REFERENCES `local_manager_public`(`manager_public_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`manager_general_id`) REFERENCES `local_manager_general`(`manager_general_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='자치단체';

-- 6. employer (사업자)
CREATE TABLE `employer` (
  `employer_id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '사업자 PK',
  `password` VARCHAR(255) NOT NULL COMMENT 'PIN코드',
  `owner_name` VARCHAR(255) NOT NULL COMMENT '사업자 이름',
  `business_name` VARCHAR(255) NOT NULL COMMENT '상호명',
  `business_reg_no` VARCHAR(255) NULL COMMENT '사업자등록번호',
  `address` VARCHAR(500) NULL COMMENT '주소',
  `phone` VARCHAR(20) NOT NULL COMMENT '전화번호',
  `account_status` ENUM('Active', 'ActivePending', 'Cancel', 'CancelPending') NOT NULL COMMENT '가입 상태',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
  `manager_general_id` BIGINT NOT NULL COMMENT '일반형 관리자 FK',
  `manager_public_id` BIGINT NOT NULL COMMENT '공공형 관리자 FK',
  FOREIGN KEY (`manager_general_id`) REFERENCES `local_manager_general`(`manager_general_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`manager_public_id`) REFERENCES `local_manager_public`(`manager_public_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='사업자';

-- 7. season_worker (계절 노동자)
CREATE TABLE `season_worker` (
  `worker_id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '노동자 PK',
  `password` VARCHAR(255) NOT NULL COMMENT 'PIN코드',
  `country_code` VARCHAR(3) NOT NULL COMMENT '출신국가코드',
  `passport_id` VARCHAR(255) NOT NULL COMMENT '여권번호',
  `passport_expired` VARCHAR(50) NULL COMMENT '여권만료날짜',
  `name` VARCHAR(255) NOT NULL COMMENT '여권상 이름',
  `birth_date` DATE NOT NULL COMMENT '생년월일',
  `gender` ENUM('M', 'F') NOT NULL COMMENT '성별',
  `register_status` ENUM('IMMIGRATION', 'MOU', 'MARRIAGE', 'PUBLIC', 'OTHER', 'NONE') NOT NULL DEFAULT 'NONE' COMMENT '가입유형',
  `resident_id` VARCHAR(255) NULL COMMENT '외국인등록번호',
  `account_status` ENUM('Active', 'ActivePending', 'Cancel', 'CancelPending') NOT NULL COMMENT '가입 상태',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
  `manager_public_id` BIGINT NOT NULL COMMENT '공공형 관리자 FK',
  `employer_id` BIGINT NOT NULL COMMENT '사업자 FK',
  `bank_account` VARCHAR(255) NULL COMMENT '계좌번호',
  FOREIGN KEY (`manager_public_id`) REFERENCES `local_manager_public`(`manager_public_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`employer_id`) REFERENCES `employer`(`employer_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='계절 노동자';

-- 8. country (국가)
CREATE TABLE `country` (
  `country_id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '국가 PK',
  `country_code` VARCHAR(3) NOT NULL UNIQUE COMMENT 'ISO 3166-1 alpha-3 국가코드',
  `country_name` VARCHAR(100) NOT NULL COMMENT '국가명'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='국가';

-- 9. visa_status (비자 상태)
CREATE TABLE `visa_status` (
  `visa_status_id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '비자유형 PK',
  `worker_id` BIGINT NOT NULL COMMENT '노동자 FK',
  `visa_code` CHAR(10) NULL COMMENT '비자유형 코드',
  `visa_description` VARCHAR(500) NULL COMMENT '비자 상세 내용',
  FOREIGN KEY (`worker_id`) REFERENCES `season_worker`(`worker_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='비자 상태';

-- 10. insurance (보험)
CREATE TABLE `insurance` (
  `insurance_id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '보험 PK',
  `insurance_start_date` DATE NOT NULL COMMENT '보험시작일',
  `insurance_end_date` DATE NOT NULL COMMENT '보험종료일',
  `cancellation_request_date` DATE NULL COMMENT '보험해지신청일',
  `cancellation_date` DATE NULL COMMENT '보험해지일(출국일)',
  `worker_id` BIGINT NOT NULL COMMENT '노동자 FK',
  FOREIGN KEY (`worker_id`) REFERENCES `season_worker`(`worker_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='보험';

-- 11. payment (결제)
CREATE TABLE `payment` (
  `payment_id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '결제방식 PK',
  `payment_type` ENUM('자동이체', '시스템 결제') NOT NULL COMMENT '자동이체/시스템결제',
  `payment_method` ENUM('카드', '계좌', '기타') NOT NULL COMMENT '카드/계좌',
  `employer_id` BIGINT NOT NULL COMMENT '사업자 FK',
  `payment_amount` BIGINT NULL COMMENT '총 결제 금액',
  `payment_status` ENUM('완료', '대기', '환불', '오류') NULL COMMENT '결제 상태',
  `error_code` VARBINARY(255) NULL COMMENT '오류일 경우 에러코드',
  `payment_date` DATETIME NULL COMMENT '결제 시간',
  FOREIGN KEY (`employer_id`) REFERENCES `employer`(`employer_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='결제';

-- 12. bank_account (계좌정보)
CREATE TABLE `bank_account` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '계좌정보 PK',
  `payment_id` BIGINT NOT NULL COMMENT '결제방식 FK',
  `name` VARCHAR(255) NULL COMMENT '예금주 소유자 이름',
  `account_no` VARCHAR(255) NULL COMMENT '계좌 번호',
  `bank_name` VARCHAR(255) NULL COMMENT '은행 이름',
  FOREIGN KEY (`payment_id`) REFERENCES `payment`(`payment_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='계좌정보';

-- 13. credit_card (카드정보)
CREATE TABLE `credit_card` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '카드정보 PK',
  `payment_id` BIGINT NOT NULL COMMENT '결제방식 FK',
  `name` VARCHAR(255) NULL COMMENT '카드 소유자 이름',
  `card_no` VARCHAR(255) NULL COMMENT '카드 번호',
  FOREIGN KEY (`payment_id`) REFERENCES `payment`(`payment_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='카드정보';

-- 14. error_code (에러코드)
CREATE TABLE `error_code` (
  `error_id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '에러코드 PK',
  `error_context` VARCHAR(500) NULL COMMENT '에러 설명',
  `payment_id` BIGINT NOT NULL COMMENT '결제방식 FK',
  FOREIGN KEY (`payment_id`) REFERENCES `payment`(`payment_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='에러코드';

-- ============================================
-- 인덱스 추가 (성능 최적화)
-- ============================================

-- admin
CREATE INDEX idx_admin_name ON `admin`(`name`);

-- local_manager_public
CREATE INDEX idx_local_manager_public_admin ON `local_manager_public`(`admin_id`);
CREATE INDEX idx_local_manager_public_status ON `local_manager_public`(`account_status`);

-- local_manager_general
CREATE INDEX idx_local_manager_general_admin ON `local_manager_general`(`admin_id`);
CREATE INDEX idx_local_manager_general_status ON `local_manager_general`(`account_status`);

-- employer
CREATE INDEX idx_employer_general ON `employer`(`manager_general_id`);
CREATE INDEX idx_employer_public ON `employer`(`manager_public_id`);
CREATE INDEX idx_employer_status ON `employer`(`account_status`);
CREATE INDEX idx_employer_business_reg ON `employer`(`business_reg_no`);

-- season_worker
CREATE INDEX idx_worker_manager_public ON `season_worker`(`manager_public_id`);
CREATE INDEX idx_worker_employer ON `season_worker`(`employer_id`);
CREATE INDEX idx_worker_passport ON `season_worker`(`passport_id`);
CREATE INDEX idx_worker_name ON `season_worker`(`name`);
CREATE INDEX idx_worker_status ON `season_worker`(`account_status`);

-- visa_status
CREATE INDEX idx_visa_worker ON `visa_status`(`worker_id`);

-- insurance
CREATE INDEX idx_insurance_worker ON `insurance`(`worker_id`);
CREATE INDEX idx_insurance_dates ON `insurance`(`insurance_start_date`, `insurance_end_date`);

-- payment
CREATE INDEX idx_payment_employer ON `payment`(`employer_id`);
CREATE INDEX idx_payment_status ON `payment`(`payment_status`);
CREATE INDEX idx_payment_date ON `payment`(`payment_date`);

-- bank_account
CREATE INDEX idx_bank_account_payment ON `bank_account`(`payment_id`);

-- credit_card
CREATE INDEX idx_credit_card_payment ON `credit_card`(`payment_id`);

-- error_code
CREATE INDEX idx_error_code_payment ON `error_code`(`payment_id`);
