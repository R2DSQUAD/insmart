import 'reflect-metadata';
import { NextRequest, NextResponse } from 'next/server';
import { initializeDataSource } from '@/lib/data-source';
import { LocalManagerPublic, AccountStatus } from '@/lib/entity/LocalManagerPublic';

/**
 * Responds to CORS preflight requests with permissive headers.
 *
 * @returns A JSON NextResponse with status 200 and headers that allow any origin, the methods GET/POST/PUT/DELETE/OPTIONS, and the Content-Type and Authorization request headers.
 */
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
 * /api/manager/public:
 *   get:
 *     summary: 공공형 관리자 목록 조회 또는 특정 관리자 조회
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *   post:
 *     summary: 공공형 관리자 생성
 *   put:
 *     summary: 공공형 관리자 정보 수정
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *   delete:
 *     summary: 공공형 관리자 삭제
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 */

/**
 * Retrieve public manager records: a single manager when `id` query param is present, or the full list otherwise.
 *
 * If `id` is provided, returns the matching manager or a 404 error when not found. If `id` is omitted, returns all managers ordered by `manager_public_id` descending along with a `count`.
 *
 * @param request - Incoming request; may include `id` as a query parameter to select a specific manager
 * @returns A JSON object with `success`. On success: `data` contains the manager (for single lookup) or an array of managers and `count` (for list). On error: `error` contains a human-readable message. HTTP status codes used include 200 for success, 404 when a specific manager is not found, and 500 for internal errors.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const dataSource = await initializeDataSource();
    const managerRepo = dataSource.getRepository(LocalManagerPublic);

    // ID가 있으면 특정 관리자 조회
    if (id) {
      const manager = await managerRepo.findOne({
        where: { manager_public_id: parseInt(id) }
      });

      if (!manager) {
        return NextResponse.json({
          success: false,
          error: '공공형 관리자를 찾을 수 없습니다'
        }, {
          status: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
          },
        });
      }

      return NextResponse.json({
        success: true,
        data: manager
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        },
      });
    }

    // 목록 조회
    const managers = await managerRepo.find({
      order: { manager_public_id: 'DESC' }
    });

    return NextResponse.json({
      success: true,
      data: managers,
      count: managers.length
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      },
    });
  } catch (error) {
    console.error('공공형 관리자 조회 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - 공공형 관리자 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { admin_id, password, account_status } = body;

    if (!admin_id || !password || !account_status) {
      return NextResponse.json({
        success: false,
        error: 'admin_id, password, account_status는 필수입니다'
      }, { status: 400 });
    }

    const dataSource = await initializeDataSource();
    const managerRepo = dataSource.getRepository(LocalManagerPublic);

    const newManager = managerRepo.create({
      admin_id,
      password,
      account_status: account_status as AccountStatus
    });

    const savedManager = await managerRepo.save(newManager);

    return NextResponse.json({
      success: true,
      data: savedManager,
      message: '공공형 관리자가 생성되었습니다'
    }, { status: 201 });
  } catch (error) {
    console.error('공공형 관리자 생성 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - 공공형 관리자 수정
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID가 필요합니다'
      }, { status: 400 });
    }

    const body = await request.json();
    const dataSource = await initializeDataSource();
    const managerRepo = dataSource.getRepository(LocalManagerPublic);

    const manager = await managerRepo.findOne({
      where: { manager_public_id: parseInt(id) }
    });

    if (!manager) {
      return NextResponse.json({
        success: false,
        error: '공공형 관리자를 찾을 수 없습니다'
      }, { status: 404 });
    }

    await managerRepo.update({ manager_public_id: parseInt(id) }, body);

    const updatedManager = await managerRepo.findOne({
      where: { manager_public_id: parseInt(id) }
    });

    return NextResponse.json({
      success: true,
      data: updatedManager,
      message: '공공형 관리자 정보가 수정되었습니다'
    });
  } catch (error) {
    console.error('공공형 관리자 수정 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - 공공형 관리자 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const dataSource = await initializeDataSource();
    const managerRepo = dataSource.getRepository(LocalManagerPublic);

    // ID가 없으면 전체 삭제
    if (!id) {
      const confirm = searchParams.get('confirm');
      
      if (confirm !== 'true') {
        return NextResponse.json({
          success: false,
          error: '전체 삭제하려면 confirm=true 파라미터가 필요합니다',
          warning: '이 작업은 모든 공공형 관리자 데이터를 삭제합니다!'
        }, { status: 400 });
      }

      await managerRepo.clear();

      return NextResponse.json({
        success: true,
        message: '모든 공공형 관리자가 삭제되었습니다'
      });
    }

    // ID가 있으면 특정 관리자만 삭제
    const manager = await managerRepo.findOne({
      where: { manager_public_id: parseInt(id) }
    });

    if (!manager) {
      return NextResponse.json({
        success: false,
        error: '공공형 관리자를 찾을 수 없습니다'
      }, { status: 404 });
    }

    await managerRepo.delete({ manager_public_id: parseInt(id) });

    return NextResponse.json({
      success: true,
      message: '공공형 관리자가 삭제되었습니다'
    });
  } catch (error) {
    console.error('공공형 관리자 삭제 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}