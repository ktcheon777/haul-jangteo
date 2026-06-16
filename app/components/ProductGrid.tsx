import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import LikeButton from '@/app/components/LikeButton'

interface Product {
  id: string
  title: string
  price: number
  category: string
  created_at: string
  seller_nickname: string | null
  image_urls: string[] | null
}

function formatPrice(price: number) {
  return price.toLocaleString('ko-KR') + '원'
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
  })
}

// 상품을 한 줄에 4개씩(모바일 2 / 태블릿 3 / 데스크탑 4) 카드 그리드로 보여준다.
// 좋아요 개수와 내가 누른 여부도 함께 표시한다. (products는 1개 이상이라고 가정)
export default async function ProductGrid({ products }: { products: Product[] }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const ids = products.map((p) => p.id)
  const { data: likeRows } = await supabase
    .from('likes')
    .select('product_id, user_id')
    .in('product_id', ids)

  const likeCountMap = new Map<string, number>()
  const myLikedSet = new Set<string>()
  for (const row of likeRows ?? []) {
    likeCountMap.set(row.product_id, (likeCountMap.get(row.product_id) ?? 0) + 1)
    if (user && row.user_id === user.id) myLikedSet.add(row.product_id)
  }

  return (
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
              <p className="text-sm font-bold text-gray-900 mt-1">{formatPrice(product.price)}</p>
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
  )
}
