import { NextRequest, NextResponse } from 'next/server';
import { initializeDataSource } from '@/lib/data-source';
import { Employer } from '@/lib/entity/Employer';

// GET - 특정 사업주 정보 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dataSource = await initializeDataSource();
    const employerRepo = dataSource.getRepository(Employer);

    const employer = await employerRepo.findOne({
      where: { employer_id: parseInt(params.id) },
      relations: ['publicManager', 'generalManager', 'workers', 'payments']
    });

    if (!employer) {
      return NextResponse.json({
        success: false,
        error: '사업주를 찾을 수 없습니다'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: employer
    });
  } catch (error) {
    console.error('사업주 조회 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
