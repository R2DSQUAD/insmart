import { NextResponse } from 'next/server';
import { initializeDataSource } from '@/lib/data-source';
import { Admin } from '@/lib/entity/Admin';
import { LocalManagerPublic } from '@/lib/entity/LocalManagerPublic';
import { LocalManagerGeneral } from '@/lib/entity/LocalManagerGeneral';
import { Employer } from '@/lib/entity/Employer';
import { SeasonWorker, Gender, RegisterStatus } from '@/lib/entity/SeasonWorker';
import { AccountStatus } from '@/lib/entity/LocalManagerPublic';
import { Region } from '@/lib/entity/Region';
import { Country } from '@/lib/entity/Country';
import { Payment } from '@/lib/entity/Payment';
import { VisaStatus } from '@/lib/entity/VisaStatus';
import { Insurance } from '@/lib/entity/Insurance';
import { BankAccount } from '@/lib/entity/BankAccount';
import { CreditCard } from '@/lib/entity/CreditCard';
import { ErrorCode } from '@/lib/entity/ErrorCode';

export function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}

/**
 * @swagger
 * tags:
 *   - name: DummyData
 *     description: 더미데이터 관리 API
 * /api/seed:
 *   post:
 *     tags:
 *       - DummyData
 *     summary: 더미 데이터 생성
 *     description: 테스트용 더미 데이터를 생성합니다 (관리자 3명, 매니저 10명, 사업자 5개, 노동자 35명, 보험 35개, 비자상태 35개)
 *     responses:
 *       201:
 *         description: 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     workers:
 *                       type: integer
 *                     insurances:
 *                       type: integer
 *                     visaStatuses:
 *                       type: integer
 *   delete:
 *     tags:
 *       - DummyData
 *     summary: 더미 데이터 삭제
 *     description: 모든 더미 데이터를 삭제합니다 (개발용)
 *     responses:
 *       200:
 *         description: 삭제 성공
 */

export async function POST() {
  try {
    const dataSource = await initializeDataSource();

    // 1. Region 데이터 생성
    const regionRepo = dataSource.getRepository(Region);
    const regions = await regionRepo.save([
      { region_name: '서울특별시' },
      { region_name: '경기도' },
      { region_name: '강원도' },
      { region_name: '충청북도' },
      { region_name: '충청남도' },
      { region_name: '전라북도' },
      { region_name: '전라남도' },
      { region_name: '경상북도' },
      { region_name: '경상남도' },
      { region_name: '제주특별자치도' }
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

    // 4. LocalManagerPublic 데이터 생성 (테스트용: region/local_government/pinCode 조합)
    const publicManagerRepo = dataSource.getRepository(LocalManagerPublic);
    const publicManagers = await publicManagerRepo.save([
      { admin_id: admins[0].admin_id, password: 'public1234', account_status: AccountStatus.ACTIVE },
      { admin_id: admins[1].admin_id, password: 'public5678', account_status: AccountStatus.ACTIVE },
      { admin_id: admins[2].admin_id, password: 'public9999', account_status: AccountStatus.ACTIVE },
      { admin_id: admins[0].admin_id, password: 'public0000', account_status: AccountStatus.ACTIVE },
      { admin_id: admins[1].admin_id, password: 'public5555', account_status: AccountStatus.ACTIVE }
    ]);

    // 5. LocalManagerGeneral 데이터 생성 (테스트용: region/local_government/pinCode 조합)
    const generalManagerRepo = dataSource.getRepository(LocalManagerGeneral);
    const generalManagers = await generalManagerRepo.save([
      { admin_id: admins[0].admin_id, password: 'general1234', account_status: AccountStatus.ACTIVE },
      { admin_id: admins[1].admin_id, password: 'general5678', account_status: AccountStatus.ACTIVE },
      { admin_id: admins[2].admin_id, password: 'general9999', account_status: AccountStatus.ACTIVE },
      { admin_id: admins[0].admin_id, password: 'general0000', account_status: AccountStatus.ACTIVE },
      { admin_id: admins[2].admin_id, password: 'general5555', account_status: AccountStatus.ACTIVE }
    ]);

    // 6. LocalGovernment 데이터 생성 (region/local_government 조합)
    const localGovernmentRepo = dataSource.getRepository('local_government');
    await localGovernmentRepo.save([
      {
        region_id: regions[0].region_id, // 서울특별시
        manager_public_id: publicManagers[0].manager_public_id,
        manager_general_id: generalManagers[1].manager_general_id, // 일반 관리자 1 (general5678)
        region_name: '서울특별시',
        local_government_name: '서울특별시 노원구'
      },
      {
        region_id: regions[1].region_id, // 경기도
        manager_public_id: publicManagers[1].manager_public_id,
        manager_general_id: generalManagers[0].manager_general_id, // 일반 관리자 0 (general1234)
        region_name: '경기도',
        local_government_name: '경기도 양평시'
      }
    ]);

    // 6. Employer 데이터 생성
    const employerRepo = dataSource.getRepository(Employer);
    const employerDummyData = [
      {
        password: 'emp1234',
        owner_name: '김사장',
        business_name: '행복농장',
        business_reg_no: '123-45-67890',
        address: '경기도 양평군 양평읍',
        phone: '031-1234-5678',
        account_status: AccountStatus.ACTIVE
      },
      {
        password: 'emp1234',
        owner_name: '이대표',
        business_name: '풍요농업법인',
        business_reg_no: '234-56-78901',
        address: '강원도 춘천시 남면',
        phone: '033-2345-6789',
        account_status: AccountStatus.ACTIVE
      },
      {
        password: 'emp1234',
        owner_name: '박농부',
        business_name: '황금들녘농장',
        business_reg_no: '345-67-89012',
        address: '충청남도 당진시 송악읍',
        phone: '041-3456-7890',
        account_status: AccountStatus.ACTIVE
      },
      {
        password: 'emp1234',
        owner_name: '최농장주',
        business_name: '신선과일농장',
        business_reg_no: '456-78-90123',
        address: '전라남도 나주시 봉황면',
        phone: '061-4567-8901',
        account_status: AccountStatus.ACTIVE
      },
      {
        password: 'emp1234',
        owner_name: '정농장',
        business_name: '청정채소농장',
        business_reg_no: '567-89-01234',
        address: '경상남도 창원시 의창구',
        phone: '055-5678-9012',
        account_status: AccountStatus.ACTIVE
      }
    ];

    const employers = await employerRepo.save(
      employerDummyData.map((data, i) => ({
        ...data,
        manager_general_id: generalManagers[i % generalManagers.length].manager_general_id,
        manager_public_id: publicManagers[i % publicManagers.length].manager_public_id
      }))
    );

    // 7. SeasonWorker 데이터 생성
    const workerRepo = dataSource.getRepository(SeasonWorker);
    
    const vietnameseNames = ['Nguyen Van A', 'Tran Thi B', 'Le Van C', 'Pham Thi D', 'Hoang Van E'];
    const thaiNames = ['Somchai Wong', 'Siriwan Phan', 'Niran Chan', 'Achara Tan', 'Kamon Lee'];
    const cambodianNames = ['Sok Dara', 'Chea Srey', 'Kosal Rith', 'Sophea Chan', 'Veasna Kim'];
    
    const workers: any[] = [];
    
    // 베트남 노동자 (15명)
    for (let i = 0; i < 15; i++) {
      workers.push({
        password: 'worker1234',
        country_code: 'VN',
        passport_id: `V${String(i + 1).padStart(8, '0')}`,
        passport_expired: '2027-12-31',
        name: vietnameseNames[i % 5],
        birth_date: `${1985 + (i % 10)}-${String((i % 12) + 1).padStart(2, '0')}-15`,
        gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE,
        register_status: i % 3 === 0 ? RegisterStatus.PUBLIC : RegisterStatus.MOU,
        resident_id: `${String(85 + (i % 10))}${String((i % 12) + 1).padStart(2, '0')}15-${i % 2 + 1}${String(i).padStart(6, '0')}`,
        account_status: AccountStatus.ACTIVE,
        manager_public_id: publicManagers[i % 5].manager_public_id,
        employer_id: employers[i % 5].employer_id,
        bank_account: `110-${String(i + 1).padStart(3, '0')}-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`
      } as any);
    }

    // 태국 노동자 (10명)
    for (let i = 0; i < 10; i++) {
      workers.push({
        password: 'worker1234',
        country_code: 'TH',
        passport_id: `T${String(i + 1).padStart(8, '0')}`,
        passport_expired: '2027-06-30',
        name: thaiNames[i % 5],
        birth_date: `${1988 + (i % 8)}-${String((i % 12) + 1).padStart(2, '0')}-20`,
        gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE,
        register_status: RegisterStatus.IMMIGRATION,
        resident_id: `${String(88 + (i % 8))}${String((i % 12) + 1).padStart(2, '0')}20-${i % 2 + 1}${String(i).padStart(6, '0')}`,
        account_status: AccountStatus.ACTIVE,
        manager_public_id: publicManagers[i % 5].manager_public_id,
        employer_id: employers[i % 5].employer_id,
        bank_account: `110-${String(i + 100).padStart(3, '0')}-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`
      } as any);
    }

    // 8. 보험 더미 데이터 생성
    const insuranceRepo = dataSource.getRepository(Insurance);
    const insurances: any[] = [];
    for (let i = 0; i < workers.length; i++) {
      const worker = workers[i];
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - (i % 12));
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 12);
      const isCancelled = i % 10 === 0;
      const cancellationRequestDate = isCancelled ? new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000) : null;
      const cancellationDate = isCancelled ? new Date(endDate) : null;
      const insurance = insuranceRepo.create({
        insurance_start_date: startDate,
        insurance_end_date: endDate,
        cancellation_request_date: cancellationRequestDate,
        cancellation_date: cancellationDate,
        worker_id: worker.worker_id
      });
      const savedInsurance = await insuranceRepo.save(insurance);
      insurances.push(savedInsurance);
    }

    // 9. VisaStatus 더미 데이터 생성
    const visaStatusRepo = dataSource.getRepository(VisaStatus);
    const visaStatuses: any[] = [];
    const visaCodes = [
      'E-8-1',
      'E-8-2',
      'E-8-3',
      'E-8-4',
      'E-8-5',
      'E-8-6',
      'E-8-7',
      'E-8-8',
      'E-8-99'
    ];
    for (let i = 0; i < workers.length; i++) {
      const worker = workers[i];
      const visaCode = visaCodes[i % visaCodes.length];
      const visaStatus = visaStatusRepo.create({
        visa_code: visaCode,
        worker_id: worker.worker_id
      });
      const savedVisaStatus = await visaStatusRepo.save(visaStatus);
      visaStatuses.push(savedVisaStatus);
    }

    // 10. ErrorCode 더미 데이터 생성
    const errorCodeRepo = dataSource.getRepository(ErrorCode);
    const errorContextList = [
      '인증 정보가 올바르지 않습니다.',
      '접근 권한이 없습니다.',
      '요청하신 데이터를 찾을 수 없습니다.',
      '이미 존재하는 데이터입니다.',
      '서버 내부 오류가 발생했습니다.',
      '필수 입력값이 누락되었습니다.',
      '입력값이 유효하지 않습니다.',
      '세션이 만료되었습니다. 다시 로그인하세요.',
      '외부 시스템 연동 중 오류가 발생했습니다.',
      '정의되지 않은 예외가 발생했습니다.'
    ];
    const errorCodes = [];
    for (let i = 0; i < errorContextList.length; i++) {
      const entity = errorCodeRepo.create({
        error_context: errorContextList[i],
        payment_id: employers[(i % employers.length)].employer_id // 실제 payment_id가 필요하다면 payment 생성 후 할당 필요
      });
      errorCodes.push(await errorCodeRepo.save(entity));
    }

    // 결과 요약 (errorCodes 포함)
    const summary = {
      regions: regions.length,
      countries: countries.length,
      admins: admins.length,
      publicManagers: publicManagers.length,
      generalManagers: generalManagers.length,
      employers: employers.length,
      workers: workers.length,
      insurances: insurances.length,
      visaStatuses: visaStatuses.length,
      errorCodes: errorCodes.length
    };

    return NextResponse.json({
      success: true,
      message: '더미 데이터가 성공적으로 생성되었습니다',
      data: summary,
      detail: {
        workersByCountry: {
          vietnam: 15,
          thailand: 10,
          cambodia: 10
        },
        insurances: {
          active: insurances.filter((ins: any) => !ins.cancellation_date).length,
          cancelled: insurances.filter((ins: any) => ins.cancellation_date).length
        },
        visaTypes: {
          'E-8-1': visaStatuses.filter((v: any) => v.visa_code === 'E-8-1').length,
          'E-8-2': visaStatuses.filter((v: any) => v.visa_code === 'E-8-2').length,
          'E-8-3': visaStatuses.filter((v: any) => v.visa_code === 'E-8-3').length,
          'E-8-4': visaStatuses.filter((v: any) => v.visa_code === 'E-8-4').length,
          'E-8-5': visaStatuses.filter((v: any) => v.visa_code === 'E-8-5').length,
          'E-8-6': visaStatuses.filter((v: any) => v.visa_code === 'E-8-6').length,
          'E-8-7': visaStatuses.filter((v: any) => v.visa_code === 'E-8-7').length,
          'E-8-8': visaStatuses.filter((v: any) => v.visa_code === 'E-8-8').length,
          'E-8-99': visaStatuses.filter((v: any) => v.visa_code === 'E-8-99').length
        },
        errorCodes: errorCodes.map((e: any) => ({ code: e.code, message: e.message }))
      }
    }, { status: 201 });
    
    // 보험/비자상태 생성 및 결과 응답은 위에서 처리됨 (중복 제거)

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

    // 외래키 관계에 따라 자식 테이블부터 삭제 (QueryBuilder 사용)
    await dataSource.getRepository(VisaStatus).createQueryBuilder().delete().execute();
    await dataSource.getRepository(Insurance).createQueryBuilder().delete().execute();
    await dataSource.getRepository(BankAccount).createQueryBuilder().delete().execute();
    await dataSource.getRepository(CreditCard).createQueryBuilder().delete().execute();
    await dataSource.getRepository(ErrorCode).createQueryBuilder().delete().execute();
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
