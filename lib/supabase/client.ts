import { createBrowserClient } from '@supabase/ssr'
import { cleanEnv } from './clean-env'

// 환경변수에 보이지 않는 BOM(파일 시작 표시) 문자가 섞여 들어오는 경우를 방지하기 위해 cleanEnv() 처리
export function createClient() {
  return createBrowserClient(
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL),
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  )
}
