export function getVisaLabel(code?: string) {
  if (!code) return '';
  switch (code) {
    case 'IMMIGRATION':
      return '이민자';
    case 'MOU':
      return 'MOU';
    case 'MARRIAGE':
      return '결혼이주';
    case 'PUBLIC':
      return '공공형';
    case 'OTHER':
      return '기타';
    case 'NONE':
      return '없음';
    default:
      return code;
  }
}
