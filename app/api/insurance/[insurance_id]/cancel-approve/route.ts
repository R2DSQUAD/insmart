/**
 * @swagger
 * /api/insurance/{insurance_id}/cancel-approve:
 *   patch:
 *     tags:
 *       - Insurance
 *     summary: 보험 해지 승인 (관리자)
 *     description: 관리자가 보험 해지를 승인합니다 (cancellation_date 설정)
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
 *                 description: 승인 관리자 ID (선택, 토큰에서 추출 가능)
 *               note:
 *                 type: string
 *                 description: 승인 메모 (선택)
 *     responses:
 *       200:
 *         description: 해지 승인 성공
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
    const note = body.note || null;

    const dataSource = await initializeDataSource();

    // 트랜잭션으로 보험 해지 승인 처리
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
          error: '이미 해지 승인된 보험입니다'
        }, { status: 400 });
      }

      // 해지 승인일 설정
      insurance.cancellation_date = new Date();
      await manager.save(Insurance, insurance);

      // 근로자 상태를 해지자로 변경
      await manager.update(SeasonWorker,
        { worker_id: insurance.worker_id },
        { account_status: AccountStatus.CANCEL }
      );

      return NextResponse.json({
        success: true,
        message: '보험 해지가 승인되었습니다',
        data: {
          insurance_id: insurance.insurance_id,
          policy_number: insurance.policy_number,
          cancellation_request_date: insurance.cancellation_request_date,
          cancellation_date: insurance.cancellation_date,
          worker_id: insurance.worker_id,
          worker_status: AccountStatus.CANCEL
        }
      });
    });

  } catch (error) {
    console.error('보험 해지 승인 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
