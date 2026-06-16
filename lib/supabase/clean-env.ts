// 환경변수 값을 안전하게 정리한다.
// Vercel 등에 키 값을 붙여넣을 때 BOM(U+FEFF)이나 제로폭 공백 같은
// "보이지 않는 문자"가 따라붙으면, fetch 헤더(Authorization: Bearer ...)를
// 만들 때 "Cannot convert argument to a ByteString" 에러가 난다.
//
// Supabase URL과 키 값은 원래 모두 "보이는 ASCII 문자"(공백 0x20 ~ 물결 0x7E)
// 뿐이므로, 그 범위를 벗어나는 문자는 모두 제거한다. 이렇게 하면 BOM은 물론
// 다른 어떤 보이지 않는 문자가 섞여 들어와도 안전하게 걸러진다.
export function cleanEnv(value: string | undefined): string {
  return (value ?? '').replace(/[^\x20-\x7E]/g, '').trim()
}
