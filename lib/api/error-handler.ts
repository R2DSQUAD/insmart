import { NextRequest } from 'next/server';
import { errorResponse } from './response';

// 에러 핸들러 래퍼
export function withErrorHandler(
  handler: (...args: any[]) => Promise<Response>
) {
  return async (...args: any[]): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error('API Error:', error);
      
      if (error instanceof Error) {
        // 유효성 검사 에러
        if (error.message.includes('필수') || error.message.includes('유효하지')) {
          return errorResponse(error.message, 400);
        }
        
        // DB 에러
        if (error.message.includes('EntityMetadata') || error.message.includes('Repository')) {
          return errorResponse('데이터베이스 연결 오류가 발생했습니다', 500);
        }
      }
      
      return errorResponse(
        error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다',
        500
      );
    }
  };
}

// 비동기 try-catch 래퍼
export async function asyncHandler<T>(
  fn: () => Promise<T>,
  errorMessage?: string
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error(errorMessage || 'Error:', error);
    throw error;
  }
}
