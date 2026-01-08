import 'reflect-metadata';
import { NextRequest, NextResponse } from 'next/server';
import { initializeDataSource } from '@/lib/data-source';
import { Admin } from '@/lib/entity/Admin';

/**
 * Responds to CORS preflight requests with permissive Access-Control headers.
 *
 * @returns A NextResponse with status 200, an empty JSON body, and headers that allow all origins, methods GET/POST/PUT/DELETE/OPTIONS, and headers `Content-Type` and `Authorization`.
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
 * /api/admin:
 *   get:
 *     summary: 전체 관리자 목록 조회 (또는 특정 ID 조회)
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         description: 특정 관리자 ID (선택사항)
 *   post:
 *     summary: 전체 관리자 생성
 *   put:
 *     summary: 관리자 정보 수정
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *   delete:
 *     summary: 관리자 삭제
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 */

/**
 * Retrieve a single admin by `id` or return the list of all admins.
 *
 * @returns A NextResponse with JSON:
 * - On success: `{ success: true, data }` where `data` is an admin object (when `id` is provided) or an array of admin objects.
 * - If the requested admin is not found: `{ success: false, error }` with HTTP status `404`.
 * - On internal error: `{ success: false, error }` with HTTP status `500`.
 * Successful and 404 responses include CORS headers permitting common methods and headers.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const dataSource = await initializeDataSource();
    const adminRepo = dataSource.getRepository(Admin);

    // ID가 있으면 특정 관리자 조회
    if (id) {
      const admin = await adminRepo.findOne({
        where: { admin_id: parseInt(id) },
        select: ['admin_id', 'name', 'created_at', 'updated_at']
      });

      if (!admin) {
        return NextResponse.json({
          success: false,
          error: '관리자를 찾을 수 없습니다'
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
        data: admin
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        },
      });
    }

    // ID가 없으면 전체 목록 조회
    const admins = await adminRepo.find({
      select: ['admin_id', 'name', 'created_at', 'updated_at'],
      order: { admin_id: 'DESC' }
    });

    return NextResponse.json({
      success: true,
      data: admins
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      },
    });
  } catch (error) {
    console.error('Admin 조회 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - 관리자 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, name } = body;

    if (!password || !name) {
      return NextResponse.json({
        success: false,
        error: 'password와 name은 필수입니다'
      }, { status: 400 });
    }

    const dataSource = await initializeDataSource();
    const adminRepo = dataSource.getRepository(Admin);

    const newAdmin = adminRepo.create({ password, name });
    const savedAdmin = await adminRepo.save(newAdmin);

    return NextResponse.json({
      success: true,
      data: savedAdmin,
      message: '전체 관리자가 생성되었습니다'
    }, { status: 201 });
  } catch (error) {
    console.error('Admin 생성 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - 관리자 수정
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
    const adminRepo = dataSource.getRepository(Admin);

    const admin = await adminRepo.findOne({
      where: { admin_id: parseInt(id) }
    });

    if (!admin) {
      return NextResponse.json({
        success: false,
        error: '관리자를 찾을 수 없습니다'
      }, { status: 404 });
    }

    await adminRepo.update({ admin_id: parseInt(id) }, body);

    const updatedAdmin = await adminRepo.findOne({
      where: { admin_id: parseInt(id) },
      select: ['admin_id', 'name', 'created_at', 'updated_at']
    });

    return NextResponse.json({
      success: true,
      data: updatedAdmin,
      message: '관리자 정보가 수정되었습니다'
    });
  } catch (error) {
    console.error('Admin 수정 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - 관리자 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const dataSource = await initializeDataSource();
    const adminRepo = dataSource.getRepository(Admin);

    // ID가 없으면 전체 삭제
    if (!id) {
      const confirm = searchParams.get('confirm');
      
      if (confirm !== 'true') {
        return NextResponse.json({
          success: false,
          error: '전체 삭제하려면 confirm=true 파라미터가 필요합니다',
          warning: '이 작업은 모든 관리자 데이터를 삭제합니다!'
        }, { status: 400 });
      }

      await adminRepo.clear();

      return NextResponse.json({
        success: true,
        message: '모든 관리자가 삭제되었습니다'
      });
    }

    // ID가 있으면 특정 관리자만 삭제
    const admin = await adminRepo.findOne({
      where: { admin_id: parseInt(id) }
    });

    if (!admin) {
      return NextResponse.json({
        success: false,
        error: '관리자를 찾을 수 없습니다'
      }, { status: 404 });
    }

    await adminRepo.delete({ admin_id: parseInt(id) });

    return NextResponse.json({
      success: true,
      message: '관리자가 삭제되었습니다'
    });
  } catch (error) {
    console.error('Admin 삭제 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}