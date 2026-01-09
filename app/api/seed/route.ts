import { NextResponse } from 'next/server';
import { LocalGovernment } from '@/lib/entity/LocalGovernment';
import { initializeDataSource } from '@/lib/data-source';
import { Admin } from '@/lib/entity/Admin';
import { LocalManagerPublic } from '@/lib/entity/LocalManagerPublic';
import { LocalManagerGeneral } from '@/lib/entity/LocalManagerGeneral';
import { Employer } from '@/lib/entity/Employer';
import { SeasonWorker, Gender, RegisterStatus } from '@/lib/entity/SeasonWorker';
import { AccountStatus } from '@/lib/entity/LocalManagerPublic';
import { Region } from '@/lib/entity/Region';
import { Country } from '@/lib/entity/Country';
import { Payment, PaymentType, PaymentMethod, PaymentStatus } from '@/lib/entity/Payment';

import { Insurance } from '@/lib/entity/Insurance';
import { BankAccount } from '@/lib/entity/BankAccount';
import { CreditCard } from '@/lib/entity/CreditCard';

export function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
/**
 * @swagger
 * tags:
 *   - name: DummyData
 *     description: 더미데이터 관리 API
 */

/**
 * @swagger
 * /api/seed:
 *   post:
 *     tags:
 *       - DummyData
 *     summary: 더미 데이터 생성
 *     description: 테스트용 더미 데이터를 생성합니다 (관리자/매니저/사업주/근로자 등)
 *     responses:
 *       '201':
 *         description: 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SeedCreateResponse'
 *   delete:
 *     tags:
 *       - DummyData
 *     summary: 더미 데이터 삭제
 *     description: 모든 더미 데이터를 삭제합니다 (개발용)
 *     responses:
 *       '200':
 *         description: 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SeedDeleteResponse'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SeedCreateResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             regions:
 *               type: integer
 *             countries:
 *               type: integer
 *             admins:
 *               type: integer
 *             localGovernments:
 *               type: integer
 *             publicManagers:
 *               type: integer
 *             generalManagers:
 *               type: integer
 *             employers:
 *               type: integer
 *             workers:
 *               type: integer
 *             insurances:
 *               type: integer
 *             payments:
 *               type: integer
 *         detail:
 *           type: object
 *           properties:
 *             workersByType:
 *               type: object
 *               properties:
 *                 public:
 *                   type: integer
 *                 general:
 *                   type: integer
 *             insurances:
 *               type: object
 *               properties:
 *                 active:
 *                   type: integer
 *                 cancelled:
 *                   type: integer
 *     SeedDeleteResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 */

export async function POST() {
  try {
    const dataSource = await initializeDataSource();

    // 1. Region 데이터 생성 (서울특별시, 경기도만)
    const regionRepo = dataSource.getRepository(Region);
    const regions = await regionRepo.save([
      { region_name: '서울특별시' },
      { region_name: '경기도' }
    ]);

    // 2. Country 데이터 생성 (중복 방지: 테이블 비우기)
    const countryRepo = dataSource.getRepository(Country);
    await countryRepo.clear();
    const countries = await countryRepo.save([
      { country_code: 'VNM', country_name: '베트남' },
      { country_code: 'THA', country_name: '태국' },
      { country_code: 'KHM', country_name: '캄보디아' },
      { country_code: 'LAO', country_name: '라오스' },
      { country_code: 'MMR', country_name: '미얀마' },
      { country_code: 'PHL', country_name: '필리핀' },
      { country_code: 'IDN', country_name: '인도네시아' },
      { country_code: 'NPL', country_name: '네팔' },
      { country_code: 'UZB', country_name: '우즈베키스탄' },
      { country_code: 'MNG', country_name: '몽골' }
    ]);

    // 3. Admin 데이터 생성
    const adminRepo = dataSource.getRepository(Admin);
    const admins = await adminRepo.save([
      { password: 'admin1234', name: '김관리' },
      { password: 'admin1234', name: '이관리' },
      { password: 'admin1234', name: '박관리' }
    ]);

    // 4. LocalManagerPublic 데이터 생성 (공공형 관리자 10명)
    const publicManagerRepo = dataSource.getRepository(LocalManagerPublic);
    const publicManagersData = [];
    for (let i = 0; i < 10; i++) {
        publicManagersData.push({
            admin_id: admins[i % 3].admin_id,
            password: `public${String(i).repeat(4)}`, // public0000, public1111...
            account_status: AccountStatus.ACTIVE
        });
    }
    const publicManagers = await publicManagerRepo.save(publicManagersData);

    // 5. LocalManagerGeneral 데이터 생성 (일반형 관리자 10명)
    const generalManagerRepo = dataSource.getRepository(LocalManagerGeneral);
    const generalManagersData = [];
    for (let i = 0; i < 10; i++) {
        generalManagersData.push({
            admin_id: admins[i % 3].admin_id,
            password: `general${String(i).repeat(4)}`,
            account_status: AccountStatus.ACTIVE
        });
    }
    const generalManagers = await generalManagerRepo.save(generalManagersData);

    // 6. LocalGovernment 데이터 생성 (서울특별시 노원구, 서울특별시 용산구, 경기도 의정부, 경기도 남양주)
    const localGovernmentRepo = dataSource.getRepository('local_government');
    const localGovernments = await localGovernmentRepo.save([
      { region_id: regions[0].region_id, manager_public_id: publicManagers[0].manager_public_id, manager_general_id: generalManagers[0].manager_general_id, region_name: '서울특별시', local_government_name: '서울특별시 노원구' },
      { region_id: regions[0].region_id, manager_public_id: publicManagers[1].manager_public_id, manager_general_id: generalManagers[1].manager_general_id, region_name: '서울특별시', local_government_name: '서울특별시 용산구' },
      { region_id: regions[1].region_id, manager_public_id: publicManagers[2].manager_public_id, manager_general_id: generalManagers[2].manager_general_id, region_name: '경기도', local_government_name: '경기도 의정부시' },
      { region_id: regions[1].region_id, manager_public_id: publicManagers[3].manager_public_id, manager_general_id: generalManagers[3].manager_general_id, region_name: '경기도', local_government_name: '경기도 남양주시' }
    ]);

    // 7. Employer 데이터 생성 (지자체별 50명씩)
    const employerRepo = dataSource.getRepository(Employer);
    const employersList = [];
    const localGovNames = [
      '서울특별시 노원구',
      '서울특별시 용산구',
      '경기도 의정부시',
      '경기도 남양주시'
    ];
    for (let govIdx = 0; govIdx < localGovernments.length; govIdx++) {
      const isPublic = govIdx < 2; // 0,1: 공공형 / 2,3: 일반형
      const typeLabel = isPublic ? '공공형' : '일반형';
      for (let i = 0; i < 50; i++) {
        employersList.push({
          password: 'emp' + (govIdx + 1) + '234',
          owner_name: `${typeLabel}사업주${i + 1}`,
          business_name: `${typeLabel}농업회사${i + 1}`,
          business_reg_no: `${100 + govIdx}-0${govIdx + 1}-${String(i).padStart(5, '0')}`,
          address: `${localGovNames[govIdx]} ${i + 1}번지`,
          phone: `010-${govIdx + 1}000-${String(i).padStart(4, '0')}`,
          account_status: AccountStatus.ACTIVE,
          manager_general_id: localGovernments[govIdx].manager_general_id,
          manager_public_id: localGovernments[govIdx].manager_public_id,
          local_government_id: localGovernments[govIdx].local_government_id
        });
      }
    }
    const employers = await employerRepo.save(employersList);


    // 8. VisaStatus 더미 데이터 생성


    // 9. SeasonWorker 데이터 생성 (지자체별 50명씩)
    const workerRepo = dataSource.getRepository(SeasonWorker);
    const workers = [];
    // visa_status ENUM 값 목록
    const visaStatusEnum = ['IMMIGRATION', 'MOU', 'MARRIAGE', 'PUBLIC', 'OTHER', 'NONE'];
    const bankNames = ['신한은행', '우리은행', '국민은행', '하나은행', '농협은행'];
    for (let govIdx = 0; govIdx < localGovernments.length; govIdx++) {
      const isPublic = govIdx < 2;
      const typeLabel = isPublic ? '공공형' : '일반형';
      // 고정 영어 이름 배열
      const englishNames = [
        'James','John','Robert','Michael','William','David','Richard','Joseph','Thomas','Charles',
        'Christopher','Daniel','Matthew','Anthony','Mark','Donald','Steven','Paul','Andrew','Joshua',
        'Mary','Patricia','Jennifer','Linda','Elizabeth','Barbara','Susan','Jessica','Sarah','Karen',
        'Nancy','Lisa','Margaret','Betty','Sandra','Ashley','Kimberly','Emily','Donna','Michelle'
      ];
      for (let i = 0; i < 50; i++) {
        let status = AccountStatus.ACTIVE;
        if (i >= 20 && i < 35) status = AccountStatus.CANCEL;
        if (i >= 35) status = AccountStatus.CANCEL_PENDING;
        const employerIndex = govIdx * 50 + i;
        // 고정 영어 이름 선택 (배열 인덱스 고정)
        const fixedName = englishNames[i % englishNames.length] + (i+1);
        workers.push({
          password: 'worker' + (govIdx + 1) + '234',
          country_code: isPublic ? 'VNM' : 'PHL',
          passport_id: `PW${govIdx + 1}${String(i + 1).padStart(6, '0')}`,
          passport_expired: '2027-12-31',
          name: fixedName,
          birth_date: `199${govIdx + 1}-0${(i % 9) + 1}-${String((i % 28) + 1).padStart(2, '0')}`,
          gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE,
          register_status: isPublic ? RegisterStatus.PUBLIC : RegisterStatus.IMMIGRATION,
          resident_id: `9${govIdx + 1}0101-${i % 2 === 0 ? '1' : '2'}${String(i).padStart(6, '0')}`,
          account_status: status,
          manager_public_id: localGovernments[govIdx].manager_public_id,
          employer_id: employers[employerIndex].employer_id,
          bank_account_no: `${govIdx + 1}10-200-${String(i).padStart(6, '0')}`,
          bank_name: bankNames[(govIdx * 50 + i) % bankNames.length],
          visa_status: visaStatusEnum[(govIdx * 50 + i) % visaStatusEnum.length],
          local_government_id: localGovernments[govIdx].local_government_id
        });
      }
    }
    const savedWorkers = await workerRepo.save(workers);

    // 10. Insurance 데이터 생성 (저장된 모든 근로자에 대해)
    const insuranceRepo = dataSource.getRepository(Insurance);
    const insurances = [];
    const nowYear = new Date().getFullYear();
    const policyNumberBase = `${nowYear}-`;
    
    for (let i = 0; i < savedWorkers.length; i++) {
      const worker = savedWorkers[i];
      // 보험 시작/종료일은 기존 로직 유지
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - (i % 12));
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 12);

      const isCancelled = worker.account_status === AccountStatus.CANCEL;
      const isCancelPending = worker.account_status === AccountStatus.CANCEL_PENDING;

      // 오늘 기준으로 해지자라면 해지신청일은 오늘-10일~오늘-1일 사이, 해지일은 오늘-1일~오늘 사이로 랜덤 생성
      let cancellationRequestDate = null;
      let cancellationDate = null;
      if (isCancelled) {
        const today = new Date();
        // 신청일: 오늘-10일~오늘-1일
        const reqOffset = Math.floor(Math.random() * 10) + 1;
        cancellationRequestDate = new Date(today.getTime() - reqOffset * 24 * 60 * 60 * 1000);
        // 해지일: 신청일~오늘 (최대 10일 차이)
        const cancelOffset = Math.floor(Math.random() * (11 - reqOffset));
        cancellationDate = new Date(cancellationRequestDate.getTime() + cancelOffset * 24 * 60 * 60 * 1000);
      } else if (isCancelPending) {
        // 해지예정자는 신청일만 오늘-7일~오늘-1일 사이로 랜덤
        const today = new Date();
        const reqOffset = Math.floor(Math.random() * 7) + 1;
        cancellationRequestDate = new Date(today.getTime() - reqOffset * 24 * 60 * 60 * 1000);
      }
      
      const insurance = insuranceRepo.create({
        policy_number: policyNumberBase + String(i + 1).padStart(5, '0'),
        insurance_start_date: startDate,
        insurance_end_date: endDate,
        cancellation_request_date: cancellationRequestDate,
        cancellation_date: cancellationDate,
        worker_id: worker.worker_id
      });
      insurances.push(await insuranceRepo.save(insurance));
    }

    // 11. Payment 더미 데이터 생성 (모든 사업주에 대해)
    const paymentRepo = dataSource.getRepository(Payment);
    const payments = [];
    for (let i = 0; i < employers.length; i++) {
      const workerCount = Math.floor(Math.random() * 5) + 1;
      const residenceMonths = Math.floor(Math.random() * 12) + 1;
      const baseAmount = 100000;
      const finalAmount = baseAmount * workerCount * residenceMonths;
      
      const payment = paymentRepo.create({
        payment_type: i % 2 === 0 ? PaymentType.AUTO_TRANSFER : PaymentType.SYSTEM_PAYMENT,
        payment_method: i % 3 === 0 ? PaymentMethod.CARD : PaymentMethod.ACCOUNT,
        employer_id: employers[i].employer_id,
        payment_amount: finalAmount,
        payment_status: PaymentStatus.COMPLETE,
        payment_date: new Date(),
        worker_count: workerCount,
        residence_months: residenceMonths,
        final_amount: finalAmount
      });
      payments.push(await paymentRepo.save(payment));
    }

    // 11-1. CreditCard 더미 데이터 생성
    const creditCardRepo = dataSource.getRepository(CreditCard);
    const cardCompanies = ['신한카드', '삼성카드', '현대카드', 'KB국민카드', '하나카드'];
    for (let i = 0; i < payments.length; i++) {
      if (payments[i].payment_method === PaymentMethod.CARD) {
        const cardNumber = `${4000 + (i % 1000)}-${1000 + (i % 1000)}-${2000 + (i % 1000)}-${3000 + (i % 1000)}`;
        await creditCardRepo.save({
          payment_id: payments[i].payment_id,
          name: cardCompanies[i % cardCompanies.length],
          card_no: cardNumber
        });
      }
    }

    // 11-2. BankAccount 더미 데이터 생성 (은행명 직접 저장)
    const bankAccountRepo = dataSource.getRepository(BankAccount);
    for (let i = 0; i < payments.length; i++) {
      if (payments[i].payment_method === PaymentMethod.ACCOUNT) {
        const accountNumber = `${110 + (i % 100)}-${200 + (i % 100)}-${300000 + (i % 100)}`;
        // 은행명은 위에서 정의한 bankNames 재사용
        const bankName = bankNames[i % bankNames.length];
        await bankAccountRepo.save({
          payment_id: payments[i].payment_id,
          name: employers[i].owner_name,
          account_no: accountNumber,
          bank_name: bankName
        });
      }
    }


    // 결과 요약
    const summary = {
      regions: regions.length,
      countries: countries.length,
      admins: admins.length,
      localGovernments: localGovernments.length,
      publicManagers: publicManagers.length,
      generalManagers: generalManagers.length,
      employers: employers.length,
      workers: savedWorkers.length,
      insurances: insurances.length,
      payments: payments.length,
      message: '더미 데이터 생성 완료 (사업주 100명, 계절근로자 100명 등)'
    };

    return NextResponse.json({
      success: true,
      message: '더미 데이터가 성공적으로 생성되었습니다',
      data: summary,
      detail: {
        workersByType: {
          public: 50,
          general: 50
        },
        insurances: {
          active: insurances.filter((ins: any) => !ins.cancellation_date).length,
          cancelled: insurances.filter((ins: any) => ins.cancellation_date).length
        }
      }
    }, { status: 201 });

  } catch (error) {
    console.error('더미 데이터 생성 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: '더미 데이터 생성 중 오류가 발생했습니다'
    }, { status: 500 });
  }
}

// 더미 데이터 삭제 (개발용)
export async function DELETE() {
  try {
    const dataSource = await initializeDataSource();

    // 외래키 관계에 따라 local_government를 가장 먼저 삭제해야 하는 경우 등 고려
    await dataSource.getRepository(LocalGovernment).createQueryBuilder().delete().execute();
    await dataSource.getRepository(Insurance).createQueryBuilder().delete().execute();
    await dataSource.getRepository(BankAccount).createQueryBuilder().delete().execute();
    await dataSource.getRepository(CreditCard).createQueryBuilder().delete().execute();
    await dataSource.getRepository(SeasonWorker).createQueryBuilder().delete().execute();
    await dataSource.getRepository(Payment).createQueryBuilder().delete().execute();
    await dataSource.getRepository(Employer).createQueryBuilder().delete().execute();
    await dataSource.getRepository(LocalManagerGeneral).createQueryBuilder().delete().execute();
    await dataSource.getRepository(LocalManagerPublic).createQueryBuilder().delete().execute();
    await dataSource.getRepository(Admin).createQueryBuilder().delete().execute();
    await dataSource.getRepository(Country).createQueryBuilder().delete().execute();
    await dataSource.getRepository(Region).createQueryBuilder().delete().execute();

    return NextResponse.json({
      success: true,
      message: '모든 더미 데이터가 삭제되었습니다'
    });

  } catch (error) {
    console.error('더미 데이터 삭제 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}