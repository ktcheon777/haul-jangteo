import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import LikeButton from '@/app/components/LikeButton'

function formatPrice(price: number) {
  return price.toLocaleString('ko-KR') + '원'
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
  })
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>
}) {
  const { message } = await searchParams
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: { user } } = await supabase.auth.getUser()

  // 좋아요 데이터: 상품별 개수 + 내가 누른 상품 목록
  const { data: likeRows } = await supabase.from('likes').select('product_id, user_id')
  const likeCountMap = new Map<string, number>()
  const myLikedSet = new Set<string>()
  for (const row of likeRows ?? []) {
    likeCountMap.set(row.product_id, (likeCountMap.get(row.product_id) ?? 0) + 1)
    if (user && row.user_id === user.id) myLikedSet.add(row.product_id)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-white">
      {/* 헤더 */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-sky-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sky-600 hover:text-sky-800 text-sm font-medium">
              ← 홈으로
            </Link>
            <h1 className="text-lg font-bold text-sky-900">판매글 목록</h1>
          </div>
          <Link
            href="/products/new"
            className="text-sm bg-sky-500 hover:bg-sky-600 text-white px-4 py-1.5 rounded-full transition-colors"
          >
            + 판매하기
          </Link>
        </div>
      </header>

      {/* 목록 */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {message && (
          <div className="mb-4 p-3 bg-sky-50 border border-sky-200 rounded-xl text-sky-700 text-sm text-center">
            {message}
          </div>
        )}

        {!products || products.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-500 mb-6">아직 등록된 판매글이 없어요.</p>
            <Link
              href="/products/new"
              className="bg-sky-500 hover:bg-sky-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              첫 번째 판매글 올리기
            </Link>
          </div>
        ) : (
          // 한 줄에 4개씩 (모바일 2개, 태블릿 3개, 데스크탑 4개)
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {products.map((product) => (
              <div key={product.id} className="relative">
                <Link
                  href={`/products/${product.id}`}
                  className="block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
                >
                  {/* 사진 */}
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    {product.image_urls?.[0] ? (
                      <Image
                        src={product.image_urls[0]}
                        alt={product.title}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        🛍️
                      </div>
                    )}
                  </div>

                  {/* 정보 */}
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-800 truncate">{product.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {product.category} · {formatDate(product.created_at)}
                    </p>
                    <p className="text-sm font-bold text-gray-900 mt-1">
                      {formatPrice(product.price)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {product.seller_nickname ?? '판매자'}
                    </p>
                  </div>
                </Link>

                {/* 좋아요 버튼 (사진 우측 상단) */}
                <div className="absolute top-2 right-2">
                  <LikeButton
                    productId={product.id}
                    liked={myLikedSet.has(product.id)}
                    count={likeCountMap.get(product.id) ?? 0}
                    compact
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
