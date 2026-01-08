
import { NextRequest, NextResponse } from 'next/server';
import { initializeDataSource } from '@/lib/data-source';
import { Employer } from '@/lib/entity/Employer';
import { LocalManagerPublic } from '@/lib/entity/LocalManagerPublic';
import { LocalManagerGeneral } from '@/lib/entity/LocalManagerGeneral';
import { SeasonWorker } from '@/lib/entity/SeasonWorker';

/**
 * @swagger
 * /api/auth:
 *   post:
 *     summary: 통합 로그인
 *     description: |
 *       유형(type)에 따라 각 사용자 그룹별 인증을 수행합니다.
 *       - 공공형/일반형 관리자는 행정구역, 자치단체, 핀번호만 필요하며 바로 로그인 성공.
 *       - 개인(계절노동자)은 여권이름, 여권번호, 생년월일 필요.
 *       - 사업주는 사업주이름, 전화번호, 문자인증코드 필요.
 *       - ADMIN(최고관리자)은 id, password 필요.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [general, public, seasonWorker, employer]
 *                 description: 로그인 유형 (일반, 공공, 계절노동자, 사업주)
 *               region:
 *                 type: string
 *                 enum: [서울특별시, 경기도, 강원도, 충청북도, 충청남도, 전라북도, 전라남도, 경상북도, 경상남도, 제주특별자치도]
 *                 description: 행정구역
 *               local_government:
 *                 type: string
 *                 enum: [서울특별시 노원구, 서울특별시 강남구, 경기도 양평시, 경기도 수원시, 강원도 강릉시, 강원도 원주시, ...]
 *                 description: 행정구역별 자치단체 예시 (local_government 컬럼)
 *               pinCode:
 *                 type: string
 *                 description: 핀번호 (필수, 직접 입력)
 *               name:
 *                 type: string
 *                 description: 이름 (개인/사업주, 직접 입력)
 *               passportNo:
 *                 type: string
 *                 description: 여권번호 (개인, 직접 입력)
 *               birth:
 *                 type: string
 *                 description: 생년월일 (YYMMDD, 개인, 직접 입력)
 *               phone:
 *                 type: string
 *                 description: 전화번호 (사업주, 직접 입력)
 *               smsCode:
 *                 type: string
 *                 description: 문자인증코드 (사업주, 직접 입력)
 *             required:
 *               - type
 *               - region
 *               - local_government
 *               - pinCode
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   type: object
 *                 group:
 *                   type: string
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 */


export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ success: false, error: '잘못된 JSON 형식' }, { status: 400 });
  }
  const { type, region, local_government, pinCode, name, passportNo, birth, phone, smsCode, step } = body || {};
  const dataSource = await initializeDataSource();

  if (type === 'public') {
    // 공공형 관리자: region, local_government, pinCode 모두 확인 (local_government 테이블 조인)
    const repo = dataSource.getRepository(LocalManagerPublic);
    const user = await repo
      .createQueryBuilder('manager')
      .innerJoin('manager.localGovernments', 'lg')
      .where('lg.region_name = :region', { region })
      .andWhere('lg.local_government_name = :local_government', { local_government })
      .andWhere('manager.password = :pinCode', { pinCode })
      .getOne();
    if (!user) return NextResponse.json({ success: false, error: '인증 실패' }, { status: 401 });
    return NextResponse.json({ success: true, user, group: 'public' });
  }
  if (type === 'general') {
    // 일반형 관리자: region, local_government, pinCode 모두 확인 (local_government 테이블 조인)
    const repo = dataSource.getRepository(LocalManagerGeneral);
    const user = await repo
      .createQueryBuilder('manager')
      .innerJoin('manager.localGovernments', 'lg')
      .where('lg.region_name = :region', { region })
      .andWhere('lg.local_government_name = :local_government', { local_government })
      .andWhere('manager.password = :pinCode', { pinCode })
      .getOne();
    if (!user) return NextResponse.json({ success: false, error: '인증 실패' }, { status: 401 });
    return NextResponse.json({ success: true, user, group: 'general' });
  }
  if (type === 'seasonWorker') {
    const repo = dataSource.getRepository(SeasonWorker);
    
    // 1차 인증: region, local_government, pinCode만으로 계정 존재 확인
    if (step === 1) {
      if (!region || !local_government || !pinCode) {
        return NextResponse.json({ success: false, error: '필수 정보 누락 (1차)' }, { status: 400 });
      }
      
      const user = await repo
        .createQueryBuilder('worker')
        .innerJoin('worker.publicManager', 'manager')
        .innerJoin('manager.localGovernments', 'lg')
        .where('lg.region_name = :region', { region })
        .andWhere('lg.local_government_name = :local_government', { local_government })
        .andWhere('worker.password = :pinCode', { pinCode })
        .getOne();
      
      if (!user) return NextResponse.json({ success: false, error: '계정 정보가 올바르지 않습니다' }, { status: 401 });
      return NextResponse.json({ success: true, message: '1차 인증 성공' });
    }
    
    // 2차 인증: 추가 정보(이름, 여권번호, 생년월일)로 최종 인증
    if (!region || !local_government || !pinCode || !name || !passportNo || !birth) {
      return NextResponse.json({ success: false, error: '필수 정보 누락 (2차)' }, { status: 400 });
    }
    
    // YYMMDD 형식 검증
    if (birth.length !== 6) {
      return NextResponse.json({ success: false, error: '생년월일 형식 오류 (YYMMDD)' }, { status: 400 });
    }
    
    const user = await repo
      .createQueryBuilder('worker')
      .innerJoin('worker.publicManager', 'manager')
      .innerJoin('manager.localGovernments', 'lg')
      .where('lg.region_name = :region', { region })
      .andWhere('lg.local_government_name = :local_government', { local_government })
      .andWhere('worker.password = :pinCode', { pinCode })
      .andWhere('worker.name = :name', { name })
      .andWhere('worker.passport_id = :passportNo', { passportNo })
      .andWhere('RIGHT(REPLACE(worker.birth_date, "-", ""), 6) = :birth', { birth })
      .getOne();
    
    if (!user) return NextResponse.json({ success: false, error: '본인 인증에 실패했습니다' }, { status: 401 });
    return NextResponse.json({ success: true, user, group: 'seasonWorker' });
  }
  if (type === 'employer') {
    const repo = dataSource.getRepository(Employer);
    
    // 1차 인증: region, local_government, pinCode만으로 계정 존재 확인
    if (step === 1) {
      if (!region || !local_government || !pinCode) {
        return NextResponse.json({ success: false, error: '필수 정보 누락 (1차)' }, { status: 400 });
      }
      
      const user = await repo
        .createQueryBuilder('employer')
        .innerJoin('employer.generalManager', 'managerG')
        .innerJoin('managerG.localGovernments', 'lgG')
        .where('lgG.region_name = :region', { region })
        .andWhere('lgG.local_government_name = :local_government', { local_government })
        .andWhere('employer.password = :pinCode', { pinCode })
        .getOne();
      
      if (!user) return NextResponse.json({ success: false, error: '계정 정보가 올바르지 않습니다' }, { status: 401 });
      return NextResponse.json({ success: true, message: '1차 인증 성공' });
    }
    
    // 2차 인증: 추가 정보(사업주이름, 전화번호)로 최종 인증
    if (!region || !local_government || !pinCode || !name || !phone) {
      return NextResponse.json({ success: false, error: '필수 정보 누락 (2차)' }, { status: 400 });
    }
    
    const user = await repo
      .createQueryBuilder('employer')
      .innerJoin('employer.generalManager', 'managerG')
      .innerJoin('managerG.localGovernments', 'lgG')
      .where('lgG.region_name = :region', { region })
      .andWhere('lgG.local_government_name = :local_government', { local_government })
      .andWhere('employer.password = :pinCode', { pinCode })
      .andWhere('employer.owner_name = :name', { name })
      .andWhere('employer.phone = :phone', { phone })
      .getOne();
    
    if (!user) return NextResponse.json({ success: false, error: '본인 인증에 실패했습니다' }, { status: 401 });
    // TODO: smsCode 검증 로직 추가 필요
    // if (smsCode !== expectedCode) {
    //   return NextResponse.json({ success: false, error: 'SMS 인증 실패' }, { status: 401 });
    // }
    return NextResponse.json({ success: true, user, group: 'employer' });
  }
  return NextResponse.json({ success: false, error: '지원하지 않는 유형' }, { status: 400 });
}
