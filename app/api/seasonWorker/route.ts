import 'reflect-metadata';
import { NextRequest, NextResponse } from 'next/server';
import { initializeDataSource } from '@/lib/data-source';
// 엔티티들을 직접 Import 해야 합니다.
import { SeasonWorker, Gender, RegisterStatus } from '@/lib/entity/SeasonWorker';
import { LocalManagerPublic, AccountStatus } from '@/lib/entity/LocalManagerPublic';
import { LocalManagerGeneral } from '@/lib/entity/LocalManagerGeneral';
import { Admin } from '@/lib/entity/Admin';

// GET: 계절근로자 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dataSource = await initializeDataSource();

    // 1. 관리자 인증 파라미터
    const type = searchParams.get('type');
    const pinCode = searchParams.get('pinCode');
    const region = searchParams.get('region');
    const local_government = searchParams.get('local_government');

    // 2. 관리자 인증 로직
    let isAdmin = false;

    // 빠른 피드백: 필수 파라미터 누락이면 400 반환
    if ((type === 'public' || type === 'general') && (!pinCode || !region || !local_government)) {
      return NextResponse.json({ success: false, error: '필수 인증 파라미터가 누락되었습니다', missing: { pinCode: !pinCode, region: !region, local_government: !local_government } }, { status: 400 });
    }
    if (type === 'admin' && !pinCode) {
      return NextResponse.json({ success: false, error: '필수 인증 파라미터(pincode)가 누락되었습니다' }, { status: 400 });
    }

    // 개발용 로그: 인증 파라미터 확인 (PIN 값은 출력하지 않음)
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[SeasonWorker] auth params', { type, hasPin: !!pinCode, region, local_government });
    }

    if (type === 'public' && pinCode && region && local_government) {
      // 공공형 관리자
      const repo = dataSource.getRepository(LocalManagerPublic);
      const user = await repo.createQueryBuilder('manager')
        .innerJoin('manager.localGovernments', 'lg') // entity에 정의된 필드명에 맞춤
        .where('lg.region_name = :region', { region })
        .andWhere('lg.local_government_name = :local_government', { local_government })
        .andWhere('manager.password = :pinCode', { pinCode })
        .getOne();
      if (user) {
        isAdmin = true;
        if (process.env.NODE_ENV !== 'production') console.debug('[SeasonWorker] public manager found', { manager_public_id: user.manager_public_id });
      } else {
        if (process.env.NODE_ENV !== 'production') console.debug('[SeasonWorker] public manager not found');
      }

    } else if (type === 'general' && pinCode && region && local_government) {
      // 일반형 관리자
      const repo = dataSource.getRepository(LocalManagerGeneral);
      const user = await repo.createQueryBuilder('manager')
        .innerJoin('manager.localGovernments', 'lg')
        .where('lg.region_name = :region', { region })
        .andWhere('lg.local_government_name = :local_government', { local_government })
        .andWhere('manager.password = :pinCode', { pinCode })
        .getOne();
      if (user) {
        isAdmin = true;
        if (process.env.NODE_ENV !== 'production') console.debug('[SeasonWorker] general manager found', { manager_general_id: user.manager_general_id });
      } else {
        if (process.env.NODE_ENV !== 'production') console.debug('[SeasonWorker] general manager not found');
      }

    } else if (type === 'admin' && pinCode) {
      // 전체 관리자
      const repo = dataSource.getRepository(Admin);
      const user = await repo.createQueryBuilder('admin')
        .where('admin.password = :pinCode', { pinCode })
        .getOne();
      if (user) {
        isAdmin = true;
        if (process.env.NODE_ENV !== 'production') console.debug('[SeasonWorker] admin found', { admin_id: user.admin_id });
      } else {
        if (process.env.NODE_ENV !== 'production') console.debug('[SeasonWorker] admin not found');
      }
    }

    if (!isAdmin) {
      // 개발환경에서는 이유를 응답에 포함해 디버깅을 돕습니다. 운영환경에서는 일반 메시지 반환.
      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json({ success: false, error: '권한이 없습니다', reason: 'invalid_credentials' }, { status: 403 });
      }
      return NextResponse.json({ success: false, error: '권한이 없습니다' }, { status: 403 });
    }

    // 3. 근로자 검색 필터 파라미터
    const name = searchParams.get('name');
    const country = searchParams.get('country');
    const passport = searchParams.get('passport');
    const birth = searchParams.get('birth');
    const insuranceId = searchParams.get('insurance_id');
    const stay = searchParams.get('stay');

    // 4. 근로자 조회 쿼리 구성
    const workerRepo = dataSource.getRepository(SeasonWorker);
    
    // 관계(Relation) 이름은 Entity 정의에 따라 다를 수 있습니다. (visaStatus vs visaStatuses)
    // 여기서는 일반적인 N:1 관계를 가정하여 작성합니다.
    let qb = workerRepo.createQueryBuilder('worker')
      .leftJoinAndSelect('worker.visaStatus', 'visa')
      .leftJoinAndSelect('worker.insurances', 'insurance')
      .leftJoinAndSelect('worker.employer', 'employer');

    // 동적 필터링
    if (name) qb = qb.andWhere('worker.name LIKE :name', { name: `%${name}%` });
    if (country) qb = qb.andWhere('worker.country_code = :country', { country });
    if (passport) qb = qb.andWhere('worker.passport_id LIKE :passport', { passport: `%${passport}%` });
    
    // 생년월일 검색 (YYMMDD 형식으로 들어온다고 가정)
    if (birth) {
       // DB의 birth_date가 DATE 타입이라면 포맷팅 필요
       qb = qb.andWhere('DATE_FORMAT(worker.birth_date, "%y%m%d") = :birth', { birth });
    }

    if (insuranceId) {
      qb = qb.andWhere('insurance.insurance_id = :insuranceId', { insuranceId });
    }

    if (stay) {
      const [start, end] = stay.split('~');
      if (start && end) {
        qb = qb.andWhere('insurance.insurance_start_date >= :start AND insurance.insurance_end_date <= :end', { start, end });
      }
    }

    const workers = await qb.getMany();

    // 5. 결과 매핑
    const result = workers.map(worker => {
      // 관계 데이터가 없을 경우를 대비해 Optional Chaining 사용
      const visa = worker.visaStatus?.[0] || {}; 
      const insurance = worker.insurances?.[0] || {};
      const employer = worker.employer || {};

      return {
        id: worker.worker_id, // 고유 ID 포함 권장
        visa_status: visa.visa_code || '',
        사업주명: employer.owner_name || '',
        사업주연락처: employer.phone || '',
        증권번호: insurance.insurance_id || '',
        이름: worker.name,
        여권번호: worker.passport_id,
        국가: worker.country_code,
        성별: worker.gender,
        생년월일: worker.birth_date,
        보험기간: (insurance.insurance_start_date && insurance.insurance_end_date) 
          ? `${insurance.insurance_start_date}~${insurance.insurance_end_date}` 
          : '',
        가입상태: worker.account_status
      };
    });

    return NextResponse.json({ success: true, data: result });

  } catch (error) {
    console.error('SeasonWorker GET Error:', error);
    return NextResponse.json(
      { success: false, error: '서버 내부 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}

// POST: 계절근로자 등록
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      password,
      country_code,
      passport_id,
      passport_expired,
      name,
      birth_date,
      gender,
      register_status,
      resident_id,
      account_status,
      manager_public_id,
      employer_id,
      bank_account
    } = body;

    // 필수 필드 검증
    if (!password || !country_code || !passport_id || !name || !birth_date || !gender || !account_status || !manager_public_id || !employer_id) {
      return NextResponse.json({
        success: false,
        error: '필수 필드가 누락되었습니다',
        required: ['password', 'country_code', 'passport_id', 'name', 'birth_date', 'gender', 'account_status', 'manager_public_id', 'employer_id']
      }, { status: 400 });
    }

    const dataSource = await initializeDataSource();
    const workerRepo = dataSource.getRepository(SeasonWorker);

    const newWorker = workerRepo.create({
      password,
      country_code,
      passport_id,
      passport_expired,
      name,
      birth_date,
      gender: gender as Gender,
      register_status: register_status as RegisterStatus || RegisterStatus.NONE,
      resident_id,
      account_status: account_status as AccountStatus,
      manager_public_id,
      employer_id,
      bank_account
    });

    const savedWorker = await workerRepo.save(newWorker);

    return NextResponse.json({
      success: true,
      data: savedWorker,
      message: '계절근로자가 등록되었습니다'
    }, { status: 201 });

  } catch (error) {
    console.error('SeasonWorker POST Error:', error);
    return NextResponse.json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

// PUT: 계절근로자 정보 수정
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'id 파라미터가 필요합니다'
      }, { status: 400 });
    }

    const body = await request.json();
    const dataSource = await initializeDataSource();
    const workerRepo = dataSource.getRepository(SeasonWorker);

    const worker = await workerRepo.findOne({
      where: { worker_id: parseInt(id) }
    });

    if (!worker) {
      return NextResponse.json({
        success: false,
        error: '계절근로자를 찾을 수 없습니다'
      }, { status: 404 });
    }

    // 수정 가능한 필드만 업데이트
    const updateData: any = {};
    const allowedFields = [
      'password', 'country_code', 'passport_id', 'passport_expired',
      'name', 'birth_date', 'gender', 'register_status', 'resident_id',
      'account_status', 'manager_public_id', 'employer_id', 'bank_account'
    ];

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    await workerRepo.update({ worker_id: parseInt(id) }, updateData);

    const updatedWorker = await workerRepo.findOne({
      where: { worker_id: parseInt(id) }
    });

    return NextResponse.json({
      success: true,
      data: updatedWorker,
      message: '계절근로자 정보가 수정되었습니다'
    });

  } catch (error) {
    console.error('SeasonWorker PUT Error:', error);
    return NextResponse.json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

// DELETE: 계절근로자 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const dataSource = await initializeDataSource();
    const workerRepo = dataSource.getRepository(SeasonWorker);

    // ID가 없으면 오류 반환 (안전을 위해 전체 삭제는 비활성화)
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'id 파라미터가 필요합니다'
      }, { status: 400 });
    }

    const worker = await workerRepo.findOne({
      where: { worker_id: parseInt(id) }
    });

    if (!worker) {
      return NextResponse.json({
        success: false,
        error: '계절근로자를 찾을 수 없습니다'
      }, { status: 404 });
    }

    await workerRepo.delete({ worker_id: parseInt(id) });

    return NextResponse.json({
      success: true,
      message: '계절근로자가 삭제되었습니다',
      deleted_id: parseInt(id)
    });

  } catch (error) {
    console.error('SeasonWorker DELETE Error:', error);
    return NextResponse.json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

/**
 * @openapi
 * /api/seasonWorker:
 *   get:
 *     tags:
 *       - SeasonWorker
 *     summary: 계절근로자 목록 조회 (List/Search)
 *     description: |
 *       관리자 인증 후 근로자 목록 또는 필터 검색을 수행합니다.
 *       - 필수: `type` (admin|public|general), `pinCode` (모든 타입 공통)
 *       - 추가 필수(공공/일반): `region`, `local_government` (public 또는 general 선택 시 필요)
 *
 *       예: `?type=public&pinCode=1234&region=경기도&local_government=수원시`
 *     parameters:
 *       - name: type
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           enum: [public, general, admin]
 *         description: 관리자 유형 (필수)
 *       - name: pinCode
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: PIN 비밀번호 (필수)
 *       - name: region
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: 지역명 (public/general 타입일 때 필수)
 *       - name: local_government
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: 지자체명 (public/general 타입일 때 필수)
 *       - name: name
 *         in: query
 *         schema:
 *           type: string
 *         description: 근로자 이름 (선택)
 *       - name: country
 *         in: query
 *         schema:
 *           type: string
 *         description: 국가 코드 (선택)
 *       - name: passport
 *         in: query
 *         schema:
 *           type: string
 *         description: 여권번호 (선택)
 *       - name: birth
 *         in: query
 *         schema:
 *           type: string
 *         description: 생년월일 (YYMMDD, 선택)
 *       - name: insurance_id
 *         in: query
 *         schema:
 *           type: integer
 *         description: 증권번호 (선택)
 *       - name: stay
 *         in: query
 *         schema:
 *           type: string
 *         description: 보험기간 범위 YYYY-MM-DD~YYYY-MM-DD (선택)
 *     responses:
 *       '200':
 *         description: 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       이름:
 *                         type: string
 *                       국가:
 *                         type: string
 *                       가입상태:
 *                         type: string
 *                       visa_status:
 *                         type: string
 *                         enum:
 *                           - E-8-1
 *                           - E-8-2
 *                           - E-8-3
 *                           - E-8-4
 *                           - E-8-5
 *                           - E-8-6
 *                           - E-8-7
 *                           - E-8-8
 *                           - E-8-99
 *                         description: |
 *                           E-8-1: 국내 지자체와 외국 지자체 간의 MOU 방식(농업)
 *                           E-8-2: 한국 국민과 결혼하여 F6 비자를 받은 이민자의 4촌 이내 친척 추천(농업)
 *                           E-8-3: 국내 지자체와 외국 지자체 간의 MOU 방식(어업)
 *                           E-8-4: 한국 국민과 결혼하여 F6 비자를 받은 이민자의 4촌 이내 친척 추천(어업)
 *                           E-8-5: G-1 자격으로 계절근로 후 재입국 추천(농업)
 *                           E-8-6: G-1 자격으로 계절근로 후 재입국 추천(어업)
 *                           E-8-7: 유학생 부모 초청(농업)
 *                           E-8-8: 유학생 부모 초청(어업)
 *                           E-8-99: 언어소통 도우미 등 기타 보조 인력
 *       '400':
 *         description: 필수 파라미터 누락
 *       '403':
 *         description: 인증 실패(권한 없음)
 *   post:
 *     tags:
 *       - SeasonWorker
 *     summary: 계절근로자 등록
 *     description: 새로운 계절근로자를 등록합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - country_code
 *               - passport_id
 *               - name
 *               - birth_date
 *               - gender
 *               - account_status
 *               - manager_public_id
 *               - employer_id
 *             properties:
 *               password:
 *                 type: string
 *                 description: PIN 비밀번호
 *               country_code:
 *                 type: string
 *                 description: 국가 코드
 *               passport_id:
 *                 type: string
 *                 description: 여권번호
 *               passport_expired:
 *                 type: string
 *                 description: 여권 만료일
 *               name:
 *                 type: string
 *                 description: 이름
 *               birth_date:
 *                 type: string
 *                 format: date
 *                 description: 생년월일
 *               gender:
 *                 type: string
 *                 enum: [M, F]
 *                 description: 성별
 *               register_status:
 *                 type: string
 *                 enum: [IMMIGRATION, MOU, MARRIAGE, PUBLIC, OTHER, NONE]
 *                 description: 가입유형
 *               resident_id:
 *                 type: string
 *                 description: 외국인등록번호
 *               account_status:
 *                 type: string
 *                 enum: [Active, ActivePending, Cancel, CancelPending]
 *                 description: 가입상태
 *               manager_public_id:
 *                 type: integer
 *                 description: 공공형 관리자 ID
 *               employer_id:
 *                 type: integer
 *                 description: 사업주 ID
 *               bank_account:
 *                 type: string
 *                 description: 계좌번호
 *     responses:
 *       '201':
 *         description: 등록 성공
 *       '400':
 *         description: 필수 필드 누락
 *       '500':
 *         description: 서버 오류
 *   put:
 *     tags:
 *       - SeasonWorker
 *     summary: 계절근로자 정보 수정
 *     description: 기존 계절근로자의 정보를 수정합니다.
 *     parameters:
 *       - name: id
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *         description: 계절근로자 ID (worker_id)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *               country_code:
 *                 type: string
 *               passport_id:
 *                 type: string
 *               passport_expired:
 *                 type: string
 *               name:
 *                 type: string
 *               birth_date:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [M, F]
 *               register_status:
 *                 type: string
 *                 enum: [IMMIGRATION, MOU, MARRIAGE, PUBLIC, OTHER, NONE]
 *               resident_id:
 *                 type: string
 *               account_status:
 *                 type: string
 *                 enum: [Active, ActivePending, Cancel, CancelPending]
 *               manager_public_id:
 *                 type: integer
 *               employer_id:
 *                 type: integer
 *               bank_account:
 *                 type: string
 *     responses:
 *       '200':
 *         description: 수정 성공
 *       '400':
 *         description: ID 누락
 *       '404':
 *         description: 계절근로자를 찾을 수 없음
 *       '500':
 *         description: 서버 오류
 *   delete:
 *     tags:
 *       - SeasonWorker
 *     summary: 계절근로자 삭제
 *     description: 특정 계절근로자를 삭제합니다.
 *     parameters:
 *       - name: id
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *         description: 계절근로자 ID (worker_id)
 *     responses:
 *       '200':
 *         description: 삭제 성공
 *       '400':
 *         description: ID 누락
 *       '404':
 *         description: 계절근로자를 찾을 수 없음
 *       '500':
 *         description: 서버 오류
 */