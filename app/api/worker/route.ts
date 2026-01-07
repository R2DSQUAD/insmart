import 'reflect-metadata';
import { NextRequest, NextResponse } from 'next/server';
import { initializeDataSource } from '@/lib/data-source';
import { SeasonWorker, Gender, RegisterStatus } from '@/lib/entity/SeasonWorker';
import { AccountStatus } from '@/lib/entity/LocalManagerPublic';

/**
 * @swagger
 * /api/worker:
 *   get:
 *     summary: 노동자 목록 조회 또는 특정 노동자 조회
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *   post:
 *     summary: 노동자 등록
 *   put:
 *     summary: 노동자 정보 수정
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *   delete:
 *     summary: 노동자 삭제
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 */

// GET - 목록 조회 또는 특정 노동자 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const dataSource = await initializeDataSource();
    const workerRepo = dataSource.getRepository(SeasonWorker);

    // ID가 있으면 특정 노동자 조회
    if (id) {
      const worker = await workerRepo.findOne({
        where: { worker_id: parseInt(id) }
      });

      if (!worker) {
        return NextResponse.json({
          success: false,
          error: '노동자를 찾을 수 없습니다'
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: worker
      });
    }

    // 목록 조회
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    
    let queryBuilder = workerRepo.createQueryBuilder('worker');

    if (search) {
      queryBuilder = queryBuilder.where(
        'worker.name LIKE :search OR worker.passport_id LIKE :search',
        { search: `%${search}%` }
      );
    }

    const [workers, total] = await queryBuilder
      .orderBy('worker.worker_id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return NextResponse.json({
      success: true,
      data: workers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('노동자 조회 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - 노동자 등록
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      password,
      country_code,
      passport_id,
      passport_expired,
      name,
      birth_date,
      gender,
      register_status,
      resident_id,
      account_status,
      manager_public_id,
      employer_id,
      bank_account
    } = body;

    if (!password || !country_code || !passport_id || !name || !birth_date || !gender || !account_status || !manager_public_id || !employer_id) {
      return NextResponse.json({
        success: false,
        error: '필수 필드가 누락되었습니다'
      }, { status: 400 });
    }

    const dataSource = await initializeDataSource();
    const workerRepo = dataSource.getRepository(SeasonWorker);

    const newWorker = workerRepo.create({
      password,
      country_code,
      passport_id,
      passport_expired,
      name,
      birth_date,
      gender: gender as Gender,
      register_status: register_status as RegisterStatus || RegisterStatus.NONE,
      resident_id,
      account_status: account_status as AccountStatus,
      manager_public_id,
      employer_id,
      bank_account
    });

    const savedWorker = await workerRepo.save(newWorker);

    return NextResponse.json({
      success: true,
      data: savedWorker,
      message: '노동자가 등록되었습니다'
    }, { status: 201 });
  } catch (error) {
    console.error('노동자 등록 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - 노동자 수정
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
    const workerRepo = dataSource.getRepository(SeasonWorker);

    const worker = await workerRepo.findOne({
      where: { worker_id: parseInt(id) }
    });

    if (!worker) {
      return NextResponse.json({
        success: false,
        error: '노동자를 찾을 수 없습니다'
      }, { status: 404 });
    }

    await workerRepo.update({ worker_id: parseInt(id) }, body);

    const updatedWorker = await workerRepo.findOne({
      where: { worker_id: parseInt(id) }
    });

    return NextResponse.json({
      success: true,
      data: updatedWorker,
      message: '노동자 정보가 수정되었습니다'
    });
  } catch (error) {
    console.error('노동자 수정 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - 노동자 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const dataSource = await initializeDataSource();
    const workerRepo = dataSource.getRepository(SeasonWorker);

    // ID가 없으면 전체 삭제
    if (!id) {
      const confirm = searchParams.get('confirm');
      
      if (confirm !== 'true') {
        return NextResponse.json({
          success: false,
          error: '전체 삭제하려면 confirm=true 파라미터가 필요합니다',
          warning: '이 작업은 모든 노동자 데이터를 삭제합니다!'
        }, { status: 400 });
      }

      await workerRepo.clear();

      return NextResponse.json({
        success: true,
        message: '모든 노동자가 삭제되었습니다'
      });
    }

    // ID가 있으면 특정 노동자만 삭제
    const worker = await workerRepo.findOne({
      where: { worker_id: parseInt(id) }
    });

    if (!worker) {
      return NextResponse.json({
        success: false,
        error: '노동자를 찾을 수 없습니다'
      }, { status: 404 });
    }

    await workerRepo.delete({ worker_id: parseInt(id) });

    return NextResponse.json({
      success: true,
      message: '노동자가 삭제되었습니다'
    });
  } catch (error) {
    console.error('노동자 삭제 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
