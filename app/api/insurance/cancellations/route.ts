/**
 * @swagger
 * /api/insurance/cancellations:
 *   get:
 *     tags:
 *       - Insurance
 *     summary: 보험 해지 현황 조회
 *     description: 해지 완료(해지자)와 해지 신청(해지예정자) 현황을 조회합니다
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [approved, pending, all]
 *         description: 조회할 상태 (approved=해지자, pending=해지예정자, all=전체)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     summary:
 *                       type: object
 *                       properties:
 *                         approved_count:
 *                           type: integer
 *                         pending_count:
 *                           type: integer
 *                         total_count:
 *                           type: integer
 *                     approved:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pending:
 *                       type: array
 *                       items:
 *                         type: object
 */

import { NextRequest, NextResponse } from 'next/server';
import { initializeDataSource } from '@/lib/data-source';
import { Insurance } from '@/lib/entity/Insurance';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const dataSource = await initializeDataSource();
    const insuranceRepo = dataSource.getRepository(Insurance);

    // 요약 정보 조회 (카운트)
    const summary = await dataSource.manager.query(`
      SELECT
        SUM(CASE WHEN cancellation_date IS NOT NULL THEN 1 ELSE 0 END) AS approved_count,
        SUM(CASE WHEN cancellation_request_date IS NOT NULL AND cancellation_date IS NULL THEN 1 ELSE 0 END) AS pending_count,
        SUM(CASE WHEN cancellation_request_date IS NOT NULL THEN 1 ELSE 0 END) AS total_count
      FROM insurance
    `);

    const summaryData = {
      approved_count: parseInt(summary[0].approved_count || 0),
      pending_count: parseInt(summary[0].pending_count || 0),
      total_count: parseInt(summary[0].total_count || 0)
    };

    // 상세 목록 조회
    let approved = [];
    let pending = [];

    if (status === 'approved' || status === 'all') {
      // 해지 완료 목록 (해지자)
      approved = await insuranceRepo
        .createQueryBuilder('insurance')
        .leftJoinAndSelect('insurance.worker', 'worker')
        .leftJoinAndSelect('worker.employer', 'employer')
        .where('insurance.cancellation_date IS NOT NULL')
        .orderBy('insurance.cancellation_date', 'DESC')
        .skip(offset)
        .take(limit)
        .getMany();
    }

    if (status === 'pending' || status === 'all') {
      // 해지 신청 목록 (해지예정자)
      pending = await insuranceRepo
        .createQueryBuilder('insurance')
        .leftJoinAndSelect('insurance.worker', 'worker')
        .leftJoinAndSelect('worker.employer', 'employer')
        .where('insurance.cancellation_request_date IS NOT NULL')
        .andWhere('insurance.cancellation_date IS NULL')
        .orderBy('insurance.cancellation_request_date', 'DESC')
        .skip(offset)
        .take(limit)
        .getMany();
    }

    return NextResponse.json({
      success: true,
      data: {
        summary: summaryData,
        approved: status === 'pending' ? [] : approved,
        pending: status === 'approved' ? [] : pending,
        pagination: {
          page,
          limit,
          total_approved: summaryData.approved_count,
          total_pending: summaryData.pending_count
        }
      }
    });

  } catch (error) {
    console.error('해지 현황 조회 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
