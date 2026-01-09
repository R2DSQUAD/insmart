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
    const type = searchParams.get('type'); // public, general
    const pinCode = searchParams.get('pinCode');
    const region = searchParams.get('region');
    const local_government = searchParams.get('local_government');
    
    const dataSource = await initializeDataSource();
    const employerRepo = dataSource.getRepository(Employer);

    // ID가 있으면 특정 사업자 조회
    if (id) {
      const employer = await employerRepo.findOne({
        where: { employer_id: parseInt(id) },
        relations: ['payments', 'payments.creditCards', 'payments.bankAccounts', 'workers', 'workers.insurances', 'publicManager', 'generalManager']
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

    // 목록 조회 (관계 데이터 포함 + 권한 필터링)
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    let qb = employerRepo.createQueryBuilder('employer')
      .leftJoinAndSelect('employer.payments', 'payment')
      .leftJoinAndSelect('payment.creditCards', 'creditCard')
      .leftJoinAndSelect('payment.bankAccounts', 'bankAccount')
      .leftJoinAndSelect('employer.workers', 'worker')
      .leftJoinAndSelect('worker.insurances', 'insurance')
      .leftJoinAndSelect('employer.publicManager', 'publicManager')
      .leftJoinAndSelect('publicManager.localGovernments', 'publicManagerLG')
      .leftJoinAndSelect('employer.generalManager', 'generalManager')
      .leftJoinAndSelect('generalManager.localGovernments', 'generalManagerLG')
      .orderBy('employer.employer_id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    // 권한 필터링: type에 따라 해당 관리자의 사업주만 조회
    if (type === 'public' && pinCode && region && local_government) {
      // 공공형 관리자
      qb = qb.where('publicManagerLG.region_name = :region', { region })
        .andWhere('publicManagerLG.local_government_name = :local_government', { local_government })
        .andWhere('publicManager.password = :pinCode', { pinCode });
    } else if (type === 'general' && pinCode && region && local_government) {
      // 일반형 관리자
      qb = qb.where('generalManagerLG.region_name = :region', { region })
        .andWhere('generalManagerLG.local_government_name = :local_government', { local_government })
        .andWhere('generalManager.password = :pinCode', { pinCode });
    }

    const [employers, total] = await qb.getManyAndCount();

    // 결과 매핑 - 신청연도, 이름, 결제방식, 카드회사, 은행이름, 카드번호, 계좌번호, 총금액
    const result = employers.map(employer => {
      const payment = employer.payments?.[0] || {};
      const creditCard = payment.creditCards?.[0] || {};
      const bankAccount = payment.bankAccounts?.[0] || {};
      
      // 보험 총금액 계산 (해당 사업주의 모든 계절근로자의 보험금액 합산)
      const totalInsuranceAmount = (employer.workers || []).reduce((sum: number, worker: any) => {
        const insurances = worker.insurances || [];
        const workerTotal = insurances.reduce((wSum: number, ins: any) => wSum + (ins.insurance_fee || 0), 0);
        return sum + workerTotal;
      }, 0);

      // 소속 정보 추출 (공공형/일반형)
      const publicManager = employer.publicManager || {};
      const generalManager = employer.generalManager || {};
      const publicManagerLG = publicManager.localGovernments?.[0] || {};
      const generalManagerLG = generalManager.localGovernments?.[0] || {};
      
      const 소속유형 = type === 'public' ? '공공형' : type === 'general' ? '일반형' : '';
      const 행정구역 = type === 'public' ? publicManagerLG.region_name || '' : generalManagerLG.region_name || '';
      const 지자체 = type === 'public' ? publicManagerLG.local_government_name || '' : generalManagerLG.local_government_name || '';

      return {
        employer_id: employer.employer_id,
        신청연도: employer.created_at ? new Date(employer.created_at).getFullYear() : '',
        이름: employer.owner_name,
        결제방식: payment.payment_method || '',
        카드회사: creditCard.name || '',
        은행이름: bankAccount.bank?.bank_name || '',
        카드번호: creditCard.card_no || '',
        계좌번호: bankAccount.account_no || '',
        총금액: totalInsuranceAmount,
        행정구역: 행정구역,
        지자체: 지자체,
        소속유형: 소속유형,
        // 원본 데이터도 포함 (필요시 사용)
        owner_name: employer.owner_name,
        business_name: employer.business_name,
        business_reg_no: employer.business_reg_no,
        phone: employer.phone,
        address: employer.address,
        account_status: employer.account_status
      };
    });

    return NextResponse.json({
      success: true,
      data: result,
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
