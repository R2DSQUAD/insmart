import 'reflect-metadata';
import { NextRequest, NextResponse } from 'next/server';
import { initializeDataSource } from '@/lib/data-source';
import { Employer } from '@/lib/entity/Employer';
import { AccountStatus } from '@/lib/entity/LocalManagerPublic';

export function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}

/**
 * @swagger
 * tags:
 *   - name: Employer
 *     description: 사업자 관련 API
 * /api/employer:
 *   get:
 *     tags:
 *       - Employer
 *     summary: 사업자 목록 조회 또는 특정 사업자 조회
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *   post:
 *     tags:
 *       - Employer
 *     summary: 사업자 생성
 *   put:
 *     tags:
 *       - Employer
 *     summary: 사업자 정보 수정
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *   delete:
 *     tags:
 *       - Employer
 *     summary: 사업자 삭제
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 */

// GET - 목록 조회 또는 특정 사업자 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const dataSource = await initializeDataSource();
    const employerRepo = dataSource.getRepository(Employer);

    // ID가 있으면 특정 사업자 조회
    if (id) {
      const employer = await employerRepo.findOne({
        where: { employer_id: parseInt(id) }
      });

      if (!employer) {
        return NextResponse.json({
          success: false,
          error: '사업자를 찾을 수 없습니다'
        }, {
          status: 404,
          headers: {
// ...existing code...
          },
        });
      }

      return NextResponse.json({
        success: true,
        data: employer
      }, {
        headers: {
// ...existing code...
        },
      });
    }

    // 목록 조회
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const [employers, total] = await employerRepo.findAndCount({
      order: { employer_id: 'DESC' },
      skip: (page - 1) * limit,
      take: limit
    });

    return NextResponse.json({
      success: true,
      data: employers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('사업자 조회 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - 사업자 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      password,
      owner_name,
      business_name,
      business_reg_no,
      address,
      phone,
      account_status,
      manager_general_id,
      manager_public_id
    } = body;

    if (!password || !owner_name || !business_name || !phone || !account_status || !manager_general_id || !manager_public_id) {
      return NextResponse.json({
        success: false,
        error: '필수 필드가 누락되었습니다'
      }, { status: 400 });
    }

    const dataSource = await initializeDataSource();
    const employerRepo = dataSource.getRepository(Employer);

    const newEmployer = employerRepo.create({
      password,
      owner_name,
      business_name,
      business_reg_no,
      address,
      phone,
      account_status: account_status as AccountStatus,
      manager_general_id,
      manager_public_id
    });

    const savedEmployer = await employerRepo.save(newEmployer);

    return NextResponse.json({
      success: true,
      data: savedEmployer,
      message: '사업자가 생성되었습니다'
    }, { status: 201 });
  } catch (error) {
    console.error('사업자 생성 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - 사업자 수정
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
    const employerRepo = dataSource.getRepository(Employer);

    const employer = await employerRepo.findOne({
      where: { employer_id: parseInt(id) }
    });

    if (!employer) {
      return NextResponse.json({
        success: false,
        error: '사업자를 찾을 수 없습니다'
      }, { status: 404 });
    }

    await employerRepo.update({ employer_id: parseInt(id) }, body);

    const updatedEmployer = await employerRepo.findOne({
      where: { employer_id: parseInt(id) }
    });

    return NextResponse.json({
      success: true,
      data: updatedEmployer,
      message: '사업자 정보가 수정되었습니다'
    });
  } catch (error) {
    console.error('사업자 수정 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - 사업자 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const dataSource = await initializeDataSource();
    const employerRepo = dataSource.getRepository(Employer);

    // ID가 없으면 전체 삭제
    if (!id) {
      const confirm = searchParams.get('confirm');
      
      if (confirm !== 'true') {
        return NextResponse.json({
          success: false,
          error: '전체 삭제하려면 confirm=true 파라미터가 필요합니다',
          warning: '이 작업은 모든 사업자 데이터를 삭제합니다!'
        }, { status: 400 });
      }

      await employerRepo.clear();

      return NextResponse.json({
        success: true,
        message: '모든 사업자가 삭제되었습니다'
      });
    }

    // ID가 있으면 특정 사업자만 삭제
    const employer = await employerRepo.findOne({
      where: { employer_id: parseInt(id) }
    });

    if (!employer) {
      return NextResponse.json({
        success: false,
        error: '사업자를 찾을 수 없습니다'
      }, { status: 404 });
    }

    await employerRepo.delete({ employer_id: parseInt(id) });

    return NextResponse.json({
      success: true,
      message: '사업자가 삭제되었습니다'
    });
  } catch (error) {
    console.error('사업자 삭제 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
