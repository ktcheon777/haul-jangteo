import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import DeleteProductButton from '@/app/components/DeleteProductButton'
import ImageGallery from '@/app/components/ImageGallery'
import LikeButton from '@/app/components/LikeButton'
import CommentForm from '@/app/components/CommentForm'
import CommentItem from '@/app/components/CommentItem'

function formatPrice(price: number) {
  return price.toLocaleString('ko-KR') + '원'
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ message?: string }>
}) {
  const { id } = await params
  const { message } = await searchParams
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (!product) {
    notFound()
  }

  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === product.user_id

  // 좋아요: 전체 개수 + 내가 눌렀는지 여부
  const { count: likeCount } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', id)

  let likedByMe = false
  if (user) {
    const { data: myLike } = await supabase
      .from('likes')
      .select('id')
      .eq('product_id', id)
      .eq('user_id', user.id)
      .maybeSingle()
    likedByMe = !!myLike
  }

  // 댓글 목록 (오래된 순)
  const { data: comments } = await supabase
    .from('comments')
    .select('*')
    .eq('product_id', id)
    .order('created_at', { ascending: true })

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-white">
      {/* 헤더 */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-sky-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/products" className="text-sky-600 hover:text-sky-800 text-sm font-medium">
            ← 목록으로
          </Link>
          <h1 className="text-lg font-bold text-sky-900">상품 상세</h1>
        </div>
      </header>

      {/* 상세 내용 */}
      <main className="max-w-2xl mx-auto px-4 py-6">

        {/* 이미지 갤러리 (슬라이더) */}
        <ImageGallery images={product.image_urls ?? []} title={product.title} />

        {/* 판매자 정보 — 클릭하면 판매자 프로필로 이동 */}
        <Link
          href={`/sellers/${product.user_id}`}
          className="bg-white rounded-2xl p-4 mb-4 flex items-center gap-3 hover:bg-sky-50 transition-colors"
        >
          <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 font-bold flex-shrink-0">
            {(product.seller_nickname ?? '판매자').charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-800">{product.seller_nickname ?? '판매자'}</p>
            <p className="text-xs text-gray-400">판매자 프로필 보기 →</p>
          </div>
        </Link>

        {/* 상품 정보 */}
        <div className="bg-white rounded-2xl p-5 mb-4">
          <span className="inline-block text-xs bg-sky-100 text-sky-700 px-2.5 py-1 rounded-full mb-3">
            {product.category}
          </span>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{product.title}</h2>
          <p className="text-xs text-gray-400 mb-4">{formatDate(product.created_at)}</p>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{product.description}</p>
        </div>

        {message && (
          <div className="mb-4 p-3 bg-sky-50 border border-sky-200 rounded-xl text-sky-700 text-sm text-center">
            {message}
          </div>
        )}

        {/* 가격 + 버튼 패널 */}
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-400">판매가격</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(product.price)}</p>
            </div>
            <div className="flex items-center gap-2">
              <LikeButton productId={product.id} liked={likedByMe} count={likeCount ?? 0} />
              {!isOwner && (
                <button
                  disabled
                  className="text-sm bg-sky-500 text-white px-5 py-2.5 rounded-xl opacity-50 cursor-not-allowed"
                >
                  채팅하기 (준비 중)
                </button>
              )}
            </div>
          </div>

          {isOwner && (
            <div className="flex gap-2 mt-1">
              <Link
                href={`/products/${product.id}/edit`}
                className="flex-1 text-center bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold py-3 rounded-xl transition-colors border border-sky-200"
              >
                수정
              </Link>
              <DeleteProductButton id={product.id} />
            </div>
          )}
        </div>

        {/* 댓글 영역 */}
        <div className="bg-white rounded-2xl p-5 mt-4">
          <h3 className="font-bold text-gray-900 mb-4">
            댓글 <span className="text-sky-600">{comments?.length ?? 0}</span>
          </h3>

          {/* 댓글 작성 폼 (로그인한 사용자에게만) */}
          {user ? (
            <CommentForm productId={product.id} />
          ) : (
            <Link
              href="/login"
              className="block text-center text-sm text-gray-500 bg-gray-50 hover:bg-gray-100 py-3 rounded-xl transition-colors"
            >
              로그인하고 댓글 남기기
            </Link>
          )}

          {/* 댓글 목록 */}
          <div className="mt-2 divide-y divide-gray-100">
            {!comments || comments.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                아직 댓글이 없어요. 첫 댓글을 남겨보세요!
              </p>
            ) : (
              comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  isOwner={user?.id === comment.user_id}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
