import { NextRequest, NextResponse } from 'next/server';
import { initializeDataSource } from '@/lib/data-source';
import { SeasonWorker } from '@/lib/entity/SeasonWorker';
import { Insurance } from '@/lib/entity/Insurance';
import { AccountStatus } from '@/lib/entity/LocalManagerPublic';

export async function POST(
  request: NextRequest,
  { params }: { params: { worker_id: string } }
) {
  try {
    const dataSource = await initializeDataSource();
    const workerRepo = dataSource.getRepository(SeasonWorker);
    const insuranceRepo = dataSource.getRepository(Insurance);

    const body = await request.json();
    const { departure_date, bank_account } = body;

    if (!departure_date || !bank_account) {
      return NextResponse.json(
        { success: false, error: '출국날짜와 계좌번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    const workerId = parseInt(params.worker_id);

    // 근로자 정보 조회
    const worker = await workerRepo.findOne({ where: { worker_id: workerId } });
    if (!worker) {
      return NextResponse.json(
        { success: false, error: '근로자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 이미 해지 상태인지 확인
    if (worker.account_status === AccountStatus.CANCEL_PENDING || 
        worker.account_status === AccountStatus.CANCEL) {
      return NextResponse.json(
        { success: false, error: '이미 해지 신청되었거나 해지된 계정입니다.' },
        { status: 400 }
      );
    }

    // 계좌번호 검증 (worker 테이블의 bank_account와 비교)
    // 계좌번호 검증 (bank_account_id로 bank_account 테이블에서 조회)
    if (worker.bank_account_no) {
      const bankAccountRepo = dataSource.getRepository('bank_account');
      const bankAccountRow = await bankAccountRepo.findOne({ where: { id: worker.bank_account_no } });
      if (!bankAccountRow || bankAccountRow.account_no !== bank_account) {
        return NextResponse.json(
          { success: false, error: '입력한 계좌번호가 등록된 본인 계좌번호와 일치하지 않습니다.' },
          { status: 400 }
        );
      }
    }

    // 계정 상태를 "해지예정자"로 변경
  worker.account_status = AccountStatus.CANCEL_PENDING;
  await workerRepo.save(worker);

    // 보험 해지 신청일 업데이트
    // 출국날짜가 오늘(당일)보다 이후여야만 해지 가능
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const departureDate = departure_date instanceof Date ? departure_date : new Date(departure_date);
    departureDate.setHours(0, 0, 0, 0);
    if (departureDate <= today) {
      return NextResponse.json({ error: '출국날짜가 오늘 또는 이전이면 해지 신청이 불가합니다.' }, { status: 400 });
    }
    const insurances = await insuranceRepo.find({ where: { worker_id: workerId } });
    const cancellationRequestDate = new Date();
    
    for (const insurance of insurances) {
      if (!insurance.cancellation_date) {
        insurance.cancellation_request_date = cancellationRequestDate;
        await insuranceRepo.save(insurance);
      }
    }

    return NextResponse.json({
      success: true,
      message: '해지 신청이 완료되었습니다.',
      data: {
        worker_id: worker.worker_id,
        account_status: worker.account_status,
        departure_date,
        bank_account
      }
    });

  } catch (error) {
    console.error('해지 신청 오류:', error);
    return NextResponse.json(
      { success: false, error: '해지 신청 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
