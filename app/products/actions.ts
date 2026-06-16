'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function deleteProduct(formData: FormData) {
  const id = formData.get('id') as string
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 삭제 전에 이미지 URL 목록 가져오기
  const { data: product } = await supabase
    .from('products')
    .select('image_urls')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  // 스토리지(파일 저장소)에서 이미지 파일도 삭제
  if (product?.image_urls?.length) {
    const paths = (product.image_urls as string[])
      .map(url => url.split('/product-images/')[1]?.split('?')[0])
      .filter(Boolean) as string[]
    if (paths.length) {
      await supabase.storage.from('product-images').remove(paths)
    }
  }

  await supabase.from('products').delete().eq('id', id).eq('user_id', user.id)
  redirect('/products?message=' + encodeURIComponent('판매글이 삭제됐습니다.'))
}

export async function updateProduct(formData: FormData) {
  const id = formData.get('id') as string
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const imageUrls = formData.getAll('image_urls') as string[]

  const { error } = await supabase
    .from('products')
    .update({
      title: formData.get('title') as string,
      price: parseInt(formData.get('price') as string, 10),
      category: formData.get('category') as string,
      description: formData.get('description') as string,
      image_urls: imageUrls,
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    redirect(`/products/${id}/edit?error=` + encodeURIComponent(error.message))
  }
  redirect(`/products/${id}?message=` + encodeURIComponent('수정이 완료됐습니다!'))
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const title = formData.get('title') as string
  const price = parseInt(formData.get('price') as string, 10)
  const category = formData.get('category') as string
  const description = formData.get('description') as string
  const imageUrls = formData.getAll('image_urls') as string[]

  const { error } = await supabase.from('products').insert({
    user_id: user.id,
    title,
    price,
    category,
    description,
    image_urls: imageUrls,
    seller_nickname: user.user_metadata?.nickname ?? user.email?.split('@')[0],
  })

  if (error) {
    redirect('/products/new?error=' + encodeURIComponent(error.message))
  }

  // 등록이 끝나면 판매글 목록 페이지로 이동
  redirect('/products?message=' + encodeURIComponent('판매글이 등록되었습니다!'))
}
