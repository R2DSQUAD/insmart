import { NextResponse } from 'next/server';
import { AppDataSource } from '@/lib/data-source';

/**
 * Responds to CORS preflight requests with permissive Access-Control-Allow-* headers.
 *
 * @returns A NextResponse containing an empty JSON body, HTTP status 200, and headers:
 * `Access-Control-Allow-Origin: *`, `Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS`, and
 * `Access-Control-Allow-Headers: Content-Type,Authorization`.
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
 * /api/reset-db:
 *   post:
 *     summary: 데이터베이스 초기화
 *     description: 모든 테이블을 삭제하고 다시 생성합니다 (개발 환경 전용, 주의!)
 *     responses:
 *       200:
 *         description: 초기화 성공
 *       500:
 *         description: 초기화 실패
 */

export async function POST() {
  try {
    // 데이터소스가 이미 초기화되어 있으면 연결 해제
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }

    // synchronize를 true로 설정하여 테이블 재생성
    await AppDataSource.setOptions({
      ...AppDataSource.options,
      synchronize: true,
      dropSchema: true // 기존 스키마 삭제
    });

    await AppDataSource.initialize();

    return NextResponse.json({
      success: true,
      message: '데이터베이스가 초기화되었습니다. 모든 테이블이 재생성되었습니다.'
    });

  } catch (error) {
    console.error('DB 초기화 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}