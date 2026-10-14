import { Dices, RefreshCw, Loader2 } from 'lucide-react'
import type { SpinPhase } from '../hooks/useFoodSpinner'

interface SpinControlsProps {
  phase: SpinPhase
  onSpin: () => void
  /** 当前无可用候选（数据池空或筛选无匹配） */
  noCandidates: boolean
  /** 当前结果已不符合筛选条件 */
  isStale?: boolean
}

/** 主按钮（帮我决定 / 再来一次） */
export function SpinControls({
  phase,
  onSpin,
  noCandidates,
  isStale = false,
}: SpinControlsProps) {
  const spinning = phase === 'spinning'
  const hasResult = phase === 'done'
  const disabled = spinning || noCandidates

  return (
    <div className="mt-8 flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={onSpin}
        disabled={disabled}
        aria-label={
          spinning
            ? '正在抽取'
            : hasResult
              ? '再来一次'
              : '帮我决定吃什么'
        }
        className={`group relative inline-flex h-16 w-64 max-w-[85vw] items-center justify-center gap-2.5 overflow-hidden rounded-full text-lg font-bold text-white transition-all duration-300 sm:w-72 ${
          disabled
            ? 'cursor-not-allowed bg-stone-300 shadow-none dark:bg-stone-700'
            : 'bg-gradient-to-r from-orange-warm-500 via-orange-warm-400 to-mango-400 shadow-xl shadow-orange-warm-500/40 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-orange-warm-500/50 active:translate-y-0 active:scale-95'
        }`}
      >
        {/* 高光扫过效果 */}
        {!disabled && (
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        )}
        {spinning ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : hasResult ? (
          <RefreshCw className="h-6 w-6 transition-transform duration-500 group-hover:rotate-180" />
        ) : (
          <Dices className="h-6 w-6 transition-transform duration-300 group-hover:rotate-12" />
        )}
        <span>
          {spinning ? '抽取中…' : hasResult ? '再来一次' : '帮我决定吃什么'}
        </span>
      </button>

      <p className="text-xs text-stone-400 dark:text-stone-500" aria-live="polite">
        {noCandidates
          ? '先调整筛选条件，再让命运出手'
          : hasResult && isStale
            ? '⚠️ 筛选已变更，重新抽取才能匹配新条件'
            : hasResult
              ? '不满意？命运愿意再给你一次机会'
              : '随机推荐 · 已避免连续重复'}
      </p>
    </div>
  )
}
