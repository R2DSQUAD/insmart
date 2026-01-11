"use client";

import { createContext, useContext } from 'react';

// 쿠키 정보 타입 정의
export interface CookieInfo {
  type: string;
  pinCode: string;
  region: string;
  local_government: string;
}

// Context 생성
export const CookieContext = createContext<CookieInfo>({
  type: '',
  pinCode: '',
  region: '',
  local_government: ''
});

// Context를 사용하는 커스텀 훅
export function useCookieInfo() {
  return useContext(CookieContext);
}
