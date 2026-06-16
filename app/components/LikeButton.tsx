import { toggleLike } from '@/app/likes/actions'

interface Props {
  productId: string
  liked: boolean
  count: number
  compact?: boolean
}

// 좋아요 버튼 — 폼 제출로 서버에서 토글 처리(로그인 안 했으면 로그인 페이지로 이동)
// compact=true 이면 목록 카드 모서리에 들어갈 작은 크기로 표시
export default function LikeButton({ productId, liked, count, compact = false }: Props) {
  return (
    <form action={toggleLike}>
      <input type="hidden" name="product_id" value={productId} />
      <button
        type="submit"
        aria-pressed={liked}
        className={`flex items-center gap-1 rounded-full border transition-colors ${
          compact ? 'px-2 py-1 shadow-sm backdrop-blur-sm' : 'gap-1.5 px-4 py-2'
        } ${
          liked
            ? 'bg-red-50 border-red-200 text-red-600'
            : 'bg-white/90 border-gray-200 text-gray-500 hover:bg-gray-50'
        }`}
      >
        <span className={compact ? 'text-sm leading-none' : 'text-lg leading-none'}>
          {liked ? '❤️' : '🤍'}
        </span>
        <span className={`font-semibold tabular-nums ${compact ? 'text-xs' : 'text-sm'}`}>
          {count}
        </span>
      </button>
    </form>
  )
}
