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

/**
 * Handle CORS preflight requests for this route.
 *
 * @returns A JSON response with an empty body, status 200, and CORS headers allowing all origins, common HTTP methods, and Content-Type/Authorization headers.
 */
export function OPTIONS() {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    },
  });
}

/**
 * @swagger
 * /api/seed:
 *   post:
 *     summary: 더미 데이터 생성
 *     description: 테스트용 더미 데이터를 생성합니다 (관리자 3명, 매니저 10명, 사업자 5개, 노동자 35명)
 *     responses:
 *       201:
 *         description: 생성 성공
 *   delete:
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

    // 2. Country 데이터 생성
    const countryRepo = dataSource.getRepository(Country);
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

    // 4. LocalManagerPublic 데이터 생성
    const publicManagerRepo = dataSource.getRepository(LocalManagerPublic);
    const publicManagers = await publicManagerRepo.save([
      { admin_id: admins[0].admin_id, password: 'public1234', account_status: AccountStatus.ACTIVE },
      { admin_id: admins[0].admin_id, password: 'public1234', account_status: AccountStatus.ACTIVE },
      { admin_id: admins[1].admin_id, password: 'public1234', account_status: AccountStatus.ACTIVE },
      { admin_id: admins[1].admin_id, password: 'public1234', account_status: AccountStatus.ACTIVE },
      { admin_id: admins[2].admin_id, password: 'public1234', account_status: AccountStatus.ACTIVE }
    ]);

    // 5. LocalManagerGeneral 데이터 생성
    const generalManagerRepo = dataSource.getRepository(LocalManagerGeneral);
    const generalManagers = await generalManagerRepo.save([
      { admin_id: admins[0].admin_id, password: 'general1234', account_status: AccountStatus.ACTIVE },
      { admin_id: admins[0].admin_id, password: 'general1234', account_status: AccountStatus.ACTIVE },
      { admin_id: admins[1].admin_id, password: 'general1234', account_status: AccountStatus.ACTIVE },
      { admin_id: admins[1].admin_id, password: 'general1234', account_status: AccountStatus.ACTIVE },
      { admin_id: admins[2].admin_id, password: 'general1234', account_status: AccountStatus.ACTIVE }
    ]);

    // 6. Employer 데이터 생성
    const employerRepo = dataSource.getRepository(Employer);
    const employers = await employerRepo.save([
      {
        password: 'emp1234',
        owner_name: '김사장',
        business_name: '행복농장',
        business_reg_no: '123-45-67890',
        address: '경기도 양평군 양평읍',
        phone: '031-1234-5678',
        account_status: AccountStatus.ACTIVE,
        manager_general_id: generalManagers[0].manager_general_id,
        manager_public_id: publicManagers[0].manager_public_id
      },
      {
        password: 'emp1234',
        owner_name: '이대표',
        business_name: '풍요농업법인',
        business_reg_no: '234-56-78901',
        address: '강원도 춘천시 남면',
        phone: '033-2345-6789',
        account_status: AccountStatus.ACTIVE,
        manager_general_id: generalManagers[1].manager_general_id,
        manager_public_id: publicManagers[1].manager_public_id
      },
      {
        password: 'emp1234',
        owner_name: '박농부',
        business_name: '황금들녘농장',
        business_reg_no: '345-67-89012',
        address: '충청남도 당진시 송악읍',
        phone: '041-3456-7890',
        account_status: AccountStatus.ACTIVE,
        manager_general_id: generalManagers[2].manager_general_id,
        manager_public_id: publicManagers[2].manager_public_id
      },
      {
        password: 'emp1234',
        owner_name: '최농장주',
        business_name: '신선과일농장',
        business_reg_no: '456-78-90123',
        address: '전라남도 나주시 봉황면',
        phone: '061-4567-8901',
        account_status: AccountStatus.ACTIVE,
        manager_general_id: generalManagers[3].manager_general_id,
        manager_public_id: publicManagers[3].manager_public_id
      },
      {
        password: 'emp1234',
        owner_name: '정대리',
        business_name: '바다채소농장',
        business_reg_no: '567-89-01234',
        address: '경상남도 거제시 일운면',
        phone: '055-5678-9012',
        account_status: AccountStatus.ACTIVE,
        manager_general_id: generalManagers[4].manager_general_id,
        manager_public_id: publicManagers[4].manager_public_id
      }
    ]);

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

    // 캄보디아 노동자 (10명)
    for (let i = 0; i < 10; i++) {
      workers.push({
        password: 'worker1234',
        country_code: 'KH',
        passport_id: `K${String(i + 1).padStart(8, '0')}`,
        passport_expired: '2026-12-31',
        name: cambodianNames[i % 5],
        birth_date: `${1990 + (i % 6)}-${String((i % 12) + 1).padStart(2, '0')}-10`,
        gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE,
        register_status: RegisterStatus.OTHER,
        resident_id: `${String(90 + (i % 6))}${String((i % 12) + 1).padStart(2, '0')}10-${i % 2 + 1}${String(i).padStart(6, '0')}`,
        account_status: i % 4 === 0 ? AccountStatus.ACTIVE_PENDING : AccountStatus.ACTIVE,
        manager_public_id: publicManagers[i % 5].manager_public_id,
        employer_id: employers[i % 5].employer_id,
        bank_account: `110-${String(i + 200).padStart(3, '0')}-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`
      } as any);
    }

    // Worker 생성 테스트를 위해 먼저 다른 엔티티들만 확인
    console.log('Admin:', admins.length);
    console.log('Public Managers:', publicManagers.length);
    console.log('General Managers:', generalManagers.length);
    console.log('Employers:', employers.length);
    console.log('Workers to create:', workers.length);

    const savedWorkers: any[] = [];
    
    // 하나씩 생성하고 저장
    for (let i = 0; i < workers.length; i++) {
      const workerData = workers[i];
      console.log(`Creating worker ${i + 1}/${workers.length}:`, workerData.name);
      const worker = workerRepo.create(workerData);
      const saved = await workerRepo.save(worker);
      savedWorkers.push(saved);
    }

    // 결과 요약
    const summary = {
      regions: regions.length,
      countries: countries.length,
      admins: admins.length,
      publicManagers: publicManagers.length,
      generalManagers: generalManagers.length,
      employers: employers.length,
      workers: savedWorkers.length
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

    // 역순으로 삭제 (외래키 제약 조건 때문)
    await dataSource.getRepository(SeasonWorker).clear();
    await dataSource.getRepository(Employer).clear();
    await dataSource.getRepository(LocalManagerGeneral).clear();
    await dataSource.getRepository(LocalManagerPublic).clear();
    await dataSource.getRepository(Admin).clear();
    await dataSource.getRepository(Country).clear();
    await dataSource.getRepository(Region).clear();

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