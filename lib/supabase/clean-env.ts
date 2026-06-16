// 환경변수 값에 섞여 들어온 BOM(U+FEFF, 보이지 않는 파일 시작 표시 문자)과
// 앞뒤 공백을 제거한다. Vercel 등에 환경변수를 붙여넣을 때 BOM이 따라붙으면
// fetch 헤더(Authorization: Bearer ...)를 만들 때 "Cannot convert argument to
// a ByteString" 에러가 나기 때문에 반드시 정리해서 사용한다.
export function cleanEnv(value: string | undefined): string {
  const BOM = String.fromCharCode(0xfeff) // U+FEFF
  return (value ?? '').split(BOM).join('').trim()
}
