import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ProductGrid from '@/app/components/ProductGrid'

export default async function SellerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // 이 판매자가 등록한 상품들 (조회는 누구나 가능 — RLS SELECT public)
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', id)
    .order('created_at', { ascending: false })

  const { data: { user } } = await supabase.auth.getUser()
  const isMe = user?.id === id
  const count = products?.length ?? 0

  // 닉네임: 상품에 저장된 판매자 닉네임 → (내 프로필이면) 내 메타데이터 → 기본값
  const nickname =
    products?.[0]?.seller_nickname ??
    (isMe ? user?.user_metadata?.nickname ?? user?.email?.split('@')[0] : null) ??
    '판매자'

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-white">
      {/* 헤더 */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-sky-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/products" className="text-sky-600 hover:text-sky-800 text-sm font-medium">
            ← 목록으로
          </Link>
          <h1 className="text-lg font-bold text-sky-900">판매자 프로필</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* 프로필 카드 */}
        <div className="bg-white rounded-2xl p-6 mb-6 flex items-center gap-4 shadow-sm">
          <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 text-2xl font-bold flex-shrink-0">
            {nickname.charAt(0)}
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-gray-900 truncate">
              {nickname}
              {isMe && <span className="text-sky-500 text-sm font-medium ml-1">(나)</span>}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">판매 중인 상품 {count}개</p>
          </div>
        </div>

        {/* 상품 그리드 */}
        {count === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-500">
              {isMe ? '아직 등록한 판매글이 없어요.' : '아직 등록한 판매글이 없어요.'}
            </p>
            {isMe && (
              <Link
                href="/products/new"
                className="inline-block mt-6 bg-sky-500 hover:bg-sky-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                첫 번째 판매글 올리기
              </Link>
            )}
          </div>
        ) : (
          <ProductGrid products={products!} />
        )}
      </main>
    </div>
  )
}
