/**
 * @swagger
 * /api/seasonWorker/{worker_id}/insurance/{insurance_id}/cancel:
 *   post:
 *     tags:
 *       - Insurance
 *     summary: 보험 해지 신청
 *     description: 계절근로자가 보험 해지를 신청합니다 (cancellation_request_date 설정)
 *     parameters:
 *       - in: path
 *         name: worker_id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: insurance_id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note:
 *                 type: string
 *                 description: 해지 신청 사유 (선택)
 *     responses:
 *       200:
 *         description: 해지 신청 성공
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 보험 정보 없음
 */

import { NextRequest, NextResponse } from 'next/server';
import { initializeDataSource } from '@/lib/data-source';
import { Insurance } from '@/lib/entity/Insurance';
import { SeasonWorker } from '@/lib/entity/SeasonWorker';
import { AccountStatus } from '@/lib/entity/LocalManagerPublic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ worker_id: string; insurance_id: string }> }
) {
  try {
    const { worker_id, insurance_id } = await params;
    const workerId = parseInt(worker_id);
    const insuranceId = parseInt(insurance_id);

    if (isNaN(workerId) || isNaN(insuranceId)) {
      return NextResponse.json({
        success: false,
        error: '잘못된 파라미터입니다'
      }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const note = body.note || null;

    const dataSource = await initializeDataSource();

    // 트랜잭션으로 보험 해지 신청 처리
    return await dataSource.manager.transaction(async (manager) => {
      // 보험 정보 조회
      const insurance = await manager.findOne(Insurance, {
        where: { insurance_id: insuranceId }
      });

      if (!insurance) {
        return NextResponse.json({
          success: false,
          error: '보험 정보를 찾을 수 없습니다'
        }, { status: 404 });
      }

      // 권한 확인: 본인의 보험인지 체크
      if (insurance.worker_id !== workerId) {
        return NextResponse.json({
          success: false,
          error: '해당 보험에 대한 권한이 없습니다'
        }, { status: 403 });
      }

      // 이미 해지 신청되었는지 확인
      if (insurance.cancellation_request_date) {
        return NextResponse.json({
          success: false,
          error: '이미 해지 신청된 보험입니다'
        }, { status: 400 });
      }

      // 이미 해지 완료되었는지 확인
      if (insurance.cancellation_date) {
        return NextResponse.json({
          success: false,
          error: '이미 해지 완료된 보험입니다'
        }, { status: 400 });
      }

      // 해지 신청일 설정
      insurance.cancellation_request_date = new Date();
      await manager.save(Insurance, insurance);

      // 근로자 상태를 해지예정자로 변경
      await manager.update(SeasonWorker, 
        { worker_id: workerId },
        { account_status: AccountStatus.CANCEL_PENDING }
      );

      return NextResponse.json({
        success: true,
        message: '보험 해지 신청이 완료되었습니다',
        data: {
          insurance_id: insurance.insurance_id,
          policy_number: insurance.policy_number,
          cancellation_request_date: insurance.cancellation_request_date,
          worker_status: AccountStatus.CANCEL_PENDING
        }
      });
    });

  } catch (error) {
    console.error('보험 해지 신청 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
