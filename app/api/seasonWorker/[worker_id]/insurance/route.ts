import { NextRequest, NextResponse } from 'next/server';
import { initializeDataSource } from '@/lib/data-source';
import { Insurance } from '@/lib/entity/Insurance';

// GET - 특정 계절근로자의 보험 내역 조회
export async function GET(
  request: NextRequest,
  context: { params: { worker_id: string } }
) {
  try {
    const dataSource = await initializeDataSource();
    const insuranceRepo = dataSource.getRepository(Insurance);

    // Next.js 13+에서는 params가 Promise일 수 있음
    const params = context.params;
    let workerId = params.worker_id;
    if (typeof workerId !== 'string' || !workerId) {
      // 혹시 undefined거나 비어있으면 에러 반환
      return NextResponse.json({ success: false, error: 'worker_id 파라미터가 필요합니다.' }, { status: 400 });
    }
    const workerIdNum = parseInt(workerId, 10);
    if (isNaN(workerIdNum)) {
      return NextResponse.json({ success: false, error: 'worker_id가 올바르지 않습니다.' }, { status: 400 });
    }

    const insurances = await insuranceRepo.find({
      where: { worker_id: workerIdNum },
      order: { insurance_start_date: 'DESC' }
    });

    return NextResponse.json({
      success: true,
      data: insurances
    });
  } catch (error) {
    console.error('보험 내역 조회 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
