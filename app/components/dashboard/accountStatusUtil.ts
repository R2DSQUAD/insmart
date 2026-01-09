// 공통 가입상태 한글 변환 함수 (이제 DB에서 직접 한글로 저장되므로 그대로 반환)
export function getAccountStatusLabel(status: string) {
  // DB에 이미 한글로 저장되어 있으므로 그대로 반환
  return status;
}
