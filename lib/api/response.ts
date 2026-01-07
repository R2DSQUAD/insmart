import { NextResponse } from 'next/server';

// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
  page?: number;
  totalPages?: number;
  totalCount?: number;
}

// 성공 응답
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

// 페이지네이션 응답
export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  totalCount: number,
  message?: string
): NextResponse<ApiResponse<T[]>> {
  return NextResponse.json({
    success: true,
    data,
    message,
    count: data.length,
    page,
    totalPages: Math.ceil(totalCount / limit),
    totalCount,
  });
}

// 에러 응답
export function errorResponse(
  error: string | Error,
  status: number = 500
): NextResponse<ApiResponse> {
  const errorMessage = error instanceof Error ? error.message : error;
  
  return NextResponse.json(
    {
      success: false,
      error: errorMessage,
    },
    { status }
  );
}

// 유효성 검사 에러
export function validationError(message: string): NextResponse<ApiResponse> {
  return errorResponse(message, 400);
}

// Not Found 에러
export function notFoundError(resource: string): NextResponse<ApiResponse> {
  return errorResponse(`${resource}을(를) 찾을 수 없습니다`, 404);
}

// 생성 성공 응답
export function createdResponse<T>(
  data: T,
  message?: string
): NextResponse<ApiResponse<T>> {
  return successResponse(data, message || '생성되었습니다', 201);
}

// 삭제 성공 응답
export function deletedResponse(message?: string): NextResponse<ApiResponse> {
  return successResponse(null, message || '삭제되었습니다');
}

// 업데이트 성공 응답
export function updatedResponse<T>(
  data: T,
  message?: string
): NextResponse<ApiResponse<T>> {
  return successResponse(data, message || '수정되었습니다');
}
