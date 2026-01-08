import { NextRequest, NextResponse } from 'next/server';
import { initializeDataSource } from '@/lib/data-source';
import { Admin } from '@/lib/entity/Admin';
import { LocalManagerPublic } from '@/lib/entity/LocalManagerPublic';
import { LocalManagerGeneral } from '@/lib/entity/LocalManagerGeneral';
import { Employer } from '@/lib/entity/Employer';
import { SeasonWorker } from '@/lib/entity/SeasonWorker';

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
 * /api/stats:
 *   get:
 *     summary: 통계 정보 조회
 *     description: 전체 시스템의 통계 정보를 조회합니다 (관리자, 매니저, 사업자, 노동자 수 및 상세 통계)
 *     responses:
 *       200:
 *         description: 성공
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
 *                     overview:
 *                       type: object
 *                     workerStats:
 *                       type: object
 */

export async function GET() {
  try {
    const dataSource = await initializeDataSource();

    // 각 엔티티별 카운트 조회
    const [
      adminCount,
      publicManagerCount,
      generalManagerCount,
      employerCount,
      workerCount
    ] = await Promise.all([
      dataSource.getRepository(Admin).count(),
      dataSource.getRepository(LocalManagerPublic).count(),
      dataSource.getRepository(LocalManagerGeneral).count(),
      dataSource.getRepository(Employer).count(),
      dataSource.getRepository(SeasonWorker).count()
    ]);

    // 계정 상태별 통계
    const workerRepo = dataSource.getRepository(SeasonWorker);
    const workersByStatus = await workerRepo
      .createQueryBuilder('worker')
      .select('worker.account_status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('worker.account_status')
      .getRawMany();

    // 성별 통계
    const workersByGender = await workerRepo
      .createQueryBuilder('worker')
      .select('worker.gender', 'gender')
      .addSelect('COUNT(*)', 'count')
      .groupBy('worker.gender')
      .getRawMany();

    // 가입 유형별 통계
    const workersByRegisterStatus = await workerRepo
      .createQueryBuilder('worker')
      .select('worker.register_status', 'registerStatus')
      .addSelect('COUNT(*)', 'count')
      .groupBy('worker.register_status')
      .getRawMany();

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalAdmins: adminCount,
          totalPublicManagers: publicManagerCount,
          totalGeneralManagers: generalManagerCount,
          totalEmployers: employerCount,
          totalWorkers: workerCount
        },
        workerStats: {
          byStatus: workersByStatus,
          byGender: workersByGender,
          byRegisterStatus: workersByRegisterStatus
        }
      }
    });
  } catch (error) {
    console.error('통계 조회 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
