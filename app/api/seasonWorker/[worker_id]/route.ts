import 'reflect-metadata';
import { NextRequest, NextResponse } from 'next/server';
import { initializeDataSource } from '@/lib/data-source';

// 상세조회: /api/seasonWorker/[worker_id]
export async function GET(request: NextRequest, context: any) {
  const workerId = context?.params && (await context.params).worker_id ? (await context.params).worker_id : context?.params?.worker_id;
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const pinCode = searchParams.get('pinCode');
  const region = searchParams.get('region');
  const local_government = searchParams.get('local_government');

  let isAdmin = false;
  if (type === 'public' && pinCode && region && local_government) {
    const dataSource = await initializeDataSource();
    const repo = dataSource.getRepository('local_manager_public');
    const user = await repo.createQueryBuilder('manager')
      .innerJoin('manager.localGovernments', 'lg')
      .where('lg.region_name = :region', { region })
      .andWhere('lg.local_government_name = :local_government', { local_government })
      .andWhere('manager.password = :pinCode', { pinCode })
      .getOne();
    if (user) isAdmin = true;
  } else if (type === 'general' && pinCode && region && local_government) {
    const dataSource = await initializeDataSource();
    const repo = dataSource.getRepository('local_manager_general');
    const user = await repo.createQueryBuilder('manager')
      .innerJoin('manager.localGovernments', 'lg')
      .where('lg.region_name = :region', { region })
      .andWhere('lg.local_government_name = :local_government', { local_government })
      .andWhere('manager.password = :pinCode', { pinCode })
      .getOne();
    if (user) isAdmin = true;
  } else if (type === 'admin' && pinCode) {
    const dataSource = await initializeDataSource();
    const repo = dataSource.getRepository('admin');
    const user = await repo.createQueryBuilder('admin')
      .where('admin.password = :pinCode', { pinCode })
      .getOne();
    if (user) isAdmin = true;
  }

  if (!isAdmin) {
    return NextResponse.json({ success: false, error: '권한이 없습니다' }, { status: 403 });
  }

  if (!workerId) {
    return NextResponse.json({ success: false, error: 'worker_id 파라미터가 필요합니다' }, { status: 400 });
  }

  const dataSource = await initializeDataSource();
  const workerRepo = dataSource.getRepository('season_worker');
  const worker = await workerRepo.createQueryBuilder('worker')
    .leftJoinAndSelect('worker.visaStatuses', 'visa')
    .leftJoinAndSelect('worker.insurances', 'insurance')
    .leftJoinAndSelect('worker.employer', 'employer')
    .where('worker.worker_id = :workerId', { workerId })
    .getOne();

  if (!worker) {
    return NextResponse.json({ success: false, error: '근로자를 찾을 수 없습니다' }, { status: 404 });
  }

  const visa = worker.visaStatuses?.[0] || {};
  const insurance = worker.insurances?.[0] || {};
  const employer = worker.employer || {};
  const result = {
    visa_status: visa.visa_code || '',
    사업주명: employer.owner_name || '',
    사업주연락처: employer.phone || '',
    증권번호: insurance.insurance_id || '',
    이름: worker.name,
    여권번호: worker.passport_id,
    국가: worker.country_code,
    성별: worker.gender,
    생년월일: worker.birth_date,
    보험기간: insurance.insurance_start_date && insurance.insurance_end_date ? `${insurance.insurance_start_date}~${insurance.insurance_end_date}` : '',
    가입상태: worker.account_status
  };

  return NextResponse.json({ success: true, data: result });
}
