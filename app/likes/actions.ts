'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// 좋아요 토글 (이미 눌렀으면 취소, 안 눌렀으면 추가)
export async function toggleLike(formData: FormData) {
  const productId = formData.get('product_id') as string

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 이미 좋아요를 눌렀는지 확인
  const { data: existing } = await supabase
    .from('likes')
    .select('id')
    .eq('product_id', productId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    // 이미 있으면 취소
    await supabase.from('likes').delete().eq('id', existing.id).eq('user_id', user.id)
  } else {
    // 없으면 추가
    await supabase.from('likes').insert({ product_id: productId, user_id: user.id })
  }

  revalidatePath(`/products/${productId}`)
  revalidatePath('/products')
}
