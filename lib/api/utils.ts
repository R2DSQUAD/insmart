import { NextRequest } from 'next/server';

// 페이지네이션 파라미터
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

// URL에서 페이지네이션 파라미터 추출
export function getPaginationParams(request: NextRequest): PaginationParams {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

// ID 파라미터 검증
export function validateId(id: string): number {
  const numId = parseInt(id);
  if (isNaN(numId) || numId <= 0) {
    throw new Error('유효하지 않은 ID입니다');
  }
  return numId;
}

// 필수 필드 검증
export function validateRequired<T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[]
): void {
  const missing = requiredFields.filter(field => !data[field]);
  if (missing.length > 0) {
    throw new Error(`필수 필드가 누락되었습니다: ${missing.join(', ')}`);
  }
}

// 검색 파라미터 추출
export function getSearchParams(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const params: Record<string, string> = {};
  
  searchParams.forEach((value, key) => {
    if (key !== 'page' && key !== 'limit') {
      params[key] = value;
    }
  });
  
  return params;
}
