/**
 * @swagger
 * /api/insurance/{insurance_id}/cancel-reject:
 *   patch:
 *     tags:
 *       - Insurance
 *     summary: 보험 해지 신청 거절 (관리자)
 *     description: 관리자가 보험 해지 신청을 거절합니다 (cancellation_request_date 제거, 근로자 상태 원복)
 *     parameters:
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
 *               admin_id:
 *                 type: integer
 *                 description: 거절 관리자 ID (선택)
 *               reason:
 *                 type: string
 *                 description: 거절 사유 (권장)
 *     responses:
 *       200:
 *         description: 해지 거절 성공
 *       404:
 *         description: 보험 정보 없음
 *       400:
 *         description: 잘못된 요청
 */

import { NextRequest, NextResponse } from 'next/server';
import { initializeDataSource } from '@/lib/data-source';
import { Insurance } from '@/lib/entity/Insurance';
import { SeasonWorker } from '@/lib/entity/SeasonWorker';
import { AccountStatus } from '@/lib/entity/LocalManagerPublic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ insurance_id: string }> }
) {
  try {
    const { insurance_id } = await params;
    const insuranceId = parseInt(insurance_id);

    if (isNaN(insuranceId)) {
      return NextResponse.json({
        success: false,
        error: '잘못된 파라미터입니다'
      }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const adminId = body.admin_id || null;
    const reason = body.reason || null;

    const dataSource = await initializeDataSource();

    // 트랜잭션으로 보험 해지 거절 처리
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

      // 해지 신청이 되어있는지 확인
      if (!insurance.cancellation_request_date) {
        return NextResponse.json({
          success: false,
          error: '해지 신청이 되어있지 않은 보험입니다'
        }, { status: 400 });
      }

      // 이미 해지 승인되었는지 확인
      if (insurance.cancellation_date) {
        return NextResponse.json({
          success: false,
          error: '이미 해지 승인된 보험입니다. 거절할 수 없습니다'
        }, { status: 400 });
      }

      // 해지 신청 취소 (날짜 제거)
      insurance.cancellation_request_date = null;
      await manager.save(Insurance, insurance);

      // 근로자 상태를 가입자로 복원
      await manager.update(SeasonWorker,
        { worker_id: insurance.worker_id },
        { account_status: AccountStatus.ACTIVE }
      );

      return NextResponse.json({
        success: true,
        message: '보험 해지 신청이 거절되었습니다',
        data: {
          insurance_id: insurance.insurance_id,
          policy_number: insurance.policy_number,
          worker_id: insurance.worker_id,
          worker_status: AccountStatus.ACTIVE,
          rejection_reason: reason
        }
      });
    });

  } catch (error) {
    console.error('보험 해지 거절 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
