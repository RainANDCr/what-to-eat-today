import { useCallback, useEffect, useRef, useState } from 'react'
import { Ban, Heart, Loader2, RotateCw } from 'lucide-react'
import { getFunCopy } from '../lib/copywriting'
import { FoodThumb } from './FoodThumb'
import { pickRandomFood } from '../lib/random'
import {
  MAX_WHEEL_SEGMENTS,
  buildWheelSegments,
  computeTargetRotation,
  nextRotation,
  segmentAngle,
} from '../lib/wheel'
import { useFoodStore } from '../hooks/useFoodStore'
import { usePrefersReducedMotion } from '../hooks/useFoodSpinner'
import type { Food } from '../types/food'

/** 转盘旋转动画时长（毫秒） */
const WHEEL_SPIN_MS = 3400

/** 扇区配色（暖色系，深浅两种主题下均与深色文字保持对比） */
const SEGMENT_COLORS = [
  '#fb923c',
  '#fbbf24',
  '#fda4af',
  '#f97316',
  '#fcd34d',
  '#fdba74',
  '#fb7185',
  '#f59e0b',
  '#fde68a',
  '#fca5a5',
  '#fed7aa',
  '#f472b6',
]

/** 把「从 12 点方向顺时针」的角度换算为 SVG 极坐标点 */
function polarPoint(
  cx: number,
  cy: number,
  r: number,
  angleFromTopDeg: number,
) {
  const rad = ((angleFromTopDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

/** 生成单个扇区路径 */
function wedgePath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
): string {
  const p0 = polarPoint(cx, cy, r, startDeg)
  const p1 = polarPoint(cx, cy, r, endDeg)
  const largeArc = endDeg - startDeg > 180 ? 1 : 0
  return [
    `M ${cx} ${cy}`,
    `L ${p0.x.toFixed(2)} ${p0.y.toFixed(2)}`,
    `A ${r} ${r} 0 ${largeArc} 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
    'Z',
  ].join(' ')
}

interface WheelPickerProps {
  /** 当前筛选后的候选食物 */
  candidates: Food[]
}

/**
 * 幸运大转盘：
 * - 使用当前筛选后的候选池；
 * - 候选过多时随机抽样展示（保证可读性），最终结果只从展示扇区中抽取，
 *   因此指针落点与公告结果严格一致；
 * - 旋转期间禁止重复触发；尊重 prefers-reduced-motion。
 */
export function WheelPicker({ candidates }: WheelPickerProps) {
  const store = useFoodStore()
  const reducedMotion = usePrefersReducedMotion()

  const [segments, setSegments] = useState<Food[]>(() =>
    buildWheelSegments(candidates, MAX_WHEEL_SEGMENTS),
  )
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<Food | null>(null)
  const [prevCandidates, setPrevCandidates] = useState<Food[]>(candidates)

  const rotationRef = useRef(0)
  const candidatesRef = useRef(candidates)
  const recentIdsRef = useRef(store.recentIds)
  const timersRef = useRef<number[]>([])

  useEffect(() => {
    candidatesRef.current = candidates
  }, [candidates])

  useEffect(() => {
    recentIdsRef.current = store.recentIds
  }, [store.recentIds])

  /** 候选池变化时重置结果并重建扇区（渲染期间调整，避免 effect 内 setState） */
  if (prevCandidates !== candidates) {
    setPrevCandidates(candidates)
    setResult(null)
    setSegments(buildWheelSegments(candidates, MAX_WHEEL_SEGMENTS))
  }

  /** 卸载时清理定时器 */
  useEffect(() => {
    const timers = timersRef.current
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [])

  const spin = useCallback(() => {
    if (spinning) return
    const pool = candidatesRef.current
    if (pool.length === 0) return

    const nextSegments = buildWheelSegments(pool, MAX_WHEEL_SEGMENTS)
    const winner = pickRandomFood(nextSegments, recentIdsRef.current)
    if (!winner) return

    const winnerIndex = nextSegments.findIndex((f) => f.id === winner.id)
    const target = computeTargetRotation(winnerIndex, nextSegments.length)
    const next = nextRotation(rotationRef.current, target)
    rotationRef.current = next

    setSegments(nextSegments)
    setResult(null)

    if (reducedMotion) {
      setRotation(next)
      setResult(winner)
      store.recordPick(winner)
      return
    }

    setSpinning(true)
    setRotation(next)

    const timer = window.setTimeout(() => {
      setResult(winner)
      store.recordPick(winner)
      setSpinning(false)
    }, WHEEL_SPIN_MS)
    timersRef.current.push(timer)
  }, [spinning, reducedMotion, store])

  const hasResult = result !== null
  const resultId = result?.id ?? null
  const resultIsFavorite = resultId !== null && store.isFavorite(resultId)
  const resultIsExcluded = resultId !== null && store.isExcluded(resultId)

  return (
    <section className="mx-auto mt-8 w-full max-w-md px-4">
      <div className="rounded-3xl border border-orange-warm-100 bg-white/80 p-6 shadow-xl shadow-orange-warm-500/10 backdrop-blur dark:border-stone-800 dark:bg-stone-900/80 sm:p-8">
        <div className="mb-4 text-center">
          <p className="text-sm font-semibold text-stone-700 dark:text-stone-200">
            幸运大转盘
          </p>
          <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">
            命运转起来，落在哪格吃哪个
          </p>
        </div>

        {candidates.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800">
              <RotateCw className="h-7 w-7 text-stone-300 dark:text-stone-600" />
            </span>
            <p className="text-sm text-stone-400 dark:text-stone-500">
              没有符合条件的美食，去调整一下筛选吧
            </p>
          </div>
        ) : (
          <>
            {/* 转盘 */}
            <div className="relative mx-auto aspect-square w-full max-w-[380px]">
              <div
                className="absolute inset-0"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: spinning
                    ? `transform ${WHEEL_SPIN_MS}ms cubic-bezier(0.16, 0.84, 0.22, 1)`
                    : 'none',
                  willChange: 'transform',
                }}
              >
                <WheelDisc segments={segments} />
              </div>
              {/* 固定指针 */}
              <div className="pointer-events-none absolute left-1/2 top-[-10px] z-10 -translate-x-1/2">
                <svg width="30" height="34" viewBox="0 0 30 34" aria-hidden>
                  <path
                    d="M15 33 L3 10 Q3 2 15 2 Q27 2 27 10 Z"
                    fill="#f97316"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                  />
                </svg>
              </div>
            </div>

            {/* 转盘图例：色块序号与菜名一一对应 */}
            <WheelLegend segments={segments} highlightId={result?.id ?? null} />

            {/* 候选过多提示 */}
            {candidates.length > MAX_WHEEL_SEGMENTS && (
              <p className="mt-3 text-center text-xs text-stone-400 dark:text-stone-500">
                当前 {candidates.length} 种候选，转盘每次随机展示{' '}
                {MAX_WHEEL_SEGMENTS} 格，再转一次会换一批
              </p>
            )}

            {/* 抽取按钮 */}
            <div className="mt-6 flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={spin}
                disabled={spinning}
                className={`relative inline-flex h-14 w-60 max-w-[85vw] items-center justify-center gap-2.5 overflow-hidden rounded-full text-lg font-bold text-white transition-all duration-300 ${
                  spinning
                    ? 'cursor-not-allowed bg-stone-300 dark:bg-stone-700'
                    : 'bg-gradient-to-r from-orange-warm-500 via-orange-warm-400 to-mango-400 shadow-xl shadow-orange-warm-500/40 hover:-translate-y-0.5 hover:shadow-2xl active:translate-y-0 active:scale-95'
                }`}
              >
                {spinning ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    转动中…
                  </>
                ) : (
                  <>
                    <RotateCw className="h-6 w-6" />
                    {hasResult ? '再转一次' : '转起来！'}
                  </>
                )}
              </button>
            </div>

            {/* 结果展示 */}
            {hasResult && result && (
              <WheelResult
                food={result}
                isFavorite={resultIsFavorite}
                isExcluded={resultIsExcluded}
                onToggleFavorite={() => resultId !== null && store.toggleFavorite(resultId)}
                onToggleExclusion={() =>
                  resultId !== null && store.toggleExclusion(resultId)
                }
              />
            )}
          </>
        )}
      </div>
    </section>
  )
}

/** 转盘圆盘（SVG 扇区 + 标签 + 中心毂） */
function WheelDisc({ segments }: { segments: Food[] }) {
  const count = segments.length
  const cx = 150
  const cy = 150
  const r = 140
  const seg = segmentAngle(count)

  return (
    <svg viewBox="0 0 300 300" className="h-full w-full" role="img" aria-label="幸运大转盘">
      {count === 1 ? (
        <circle cx={cx} cy={cy} r={r} fill={SEGMENT_COLORS[0]} />
      ) : (
        segments.map((food, i) => {
          const start = i * seg
          const end = (i + 1) * seg
          return (
            <path
              key={food.id}
              d={wedgePath(cx, cy, r, start, end)}
              fill={SEGMENT_COLORS[i % SEGMENT_COLORS.length]}
              stroke="#fffdf7"
              strokeWidth="1.5"
            />
          )
        })
      )}

      {/* 扇区标签 */}
      {count > 1 &&
        segments.map((food, i) => {
          const centerDeg = i * seg + seg / 2
          const lp = polarPoint(cx, cy, r * 0.64, centerDeg)
          const flip = centerDeg > 90 && centerDeg < 270
          const rotate = flip ? centerDeg + 180 : centerDeg
          return (
            <text
              key={`label-${food.id}`}
              x={lp.x}
              y={lp.y}
              textAnchor="middle"
              dominantBaseline="middle"
              transform={`rotate(${rotate} ${lp.x} ${lp.y})`}
              fill="#292524"
              stroke="#ffffff"
              strokeWidth="1.2"
              paintOrder="stroke"
              fontSize="17"
              fontWeight="700"
            >
              {i + 1}
            </text>
          )
        })}

      {count === 1 && (
        <text
          x={cx}
          y={cy - 40}
          textAnchor="middle"
          fill="#292524"
          fontSize="20"
          fontWeight="700"
        >
          1
        </text>
      )}

      {/* 中心毂 */}
      <circle cx={cx} cy={cy} r={30} fill="var(--surface-solid)" stroke="#ffedd5" strokeWidth="2" />
      <circle cx={cx} cy={cy} r={10} fill="#f97316" />
    </svg>
  )
}

/** 转盘图例：彩色序号徽章对应扇区，完整展示菜名 */
function WheelLegend({
  segments,
  highlightId,
}: {
  segments: Food[]
  highlightId?: number | null
}) {
  if (segments.length <= 1) return null
  return (
    <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-1.5 sm:grid-cols-3">
      {segments.map((food, i) => {
        const active = food.id === highlightId
        return (
          <div
            key={food.id}
            className={`flex min-w-0 items-center gap-2 rounded-lg px-1.5 py-0.5 transition-colors ${
              active ? 'bg-orange-warm-100 dark:bg-orange-warm-500/20' : ''
            }`}
          >
            <span
              className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
              style={{ backgroundColor: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }}
            >
              {i + 1}
            </span>
            <span
              className={`min-w-0 truncate text-xs ${
                active
                  ? 'font-semibold text-orange-warm-700 dark:text-orange-warm-300'
                  : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              {food.name}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/** 转盘结果卡（含趣味文案与收藏/排除操作） */
function WheelResult({
  food,
  isFavorite,
  isExcluded,
  onToggleFavorite,
  onToggleExclusion,
}: {
  food: Food
  isFavorite: boolean
  isExcluded: boolean
  onToggleFavorite: () => void
  onToggleExclusion: () => void
}) {
  return (
    <div className="animate-pop-in mt-6 flex flex-col items-center gap-3 rounded-3xl bg-orange-warm-50/70 p-5 text-center dark:bg-stone-800/60">
      <span className="rounded-full bg-orange-warm-100 px-3 py-1 text-xs font-semibold text-orange-warm-700 dark:bg-orange-warm-500/20 dark:text-orange-warm-300">
        {food.category}
      </span>
      <FoodThumb src={food.image} name={food.name} size={80} className="mx-auto" />
      <h3 className="break-words text-2xl font-bold text-stone-800 dark:text-stone-100">
        {food.name}
      </h3>
      <p className="text-sm font-medium text-orange-warm-600 dark:text-orange-warm-300">
        {getFunCopy(food)}
      </p>
      <p className="max-w-xs text-sm leading-relaxed text-stone-500 dark:text-stone-400">
        {food.description}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleFavorite}
          aria-label={isFavorite ? `取消收藏 ${food.name}` : `收藏 ${food.name}`}
          aria-pressed={isFavorite}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all active:scale-95 ${
            isFavorite
              ? 'bg-blush-400/15 text-blush-400'
              : 'bg-white text-stone-500 hover:bg-orange-warm-100 dark:bg-stone-700 dark:text-stone-300 dark:hover:bg-stone-600'
          }`}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-blush-400' : ''}`} />
          {isFavorite ? '已收藏' : '收藏'}
        </button>
        <button
          type="button"
          onClick={onToggleExclusion}
          aria-label={isExcluded ? `移出排除清单 ${food.name}` : `将 ${food.name} 加入排除清单`}
          aria-pressed={isExcluded}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all active:scale-95 ${
            isExcluded
              ? 'bg-stone-800 text-white dark:bg-stone-600'
              : 'bg-white text-stone-500 hover:bg-orange-warm-100 dark:bg-stone-700 dark:text-stone-300 dark:hover:bg-stone-600'
          }`}
        >
          <Ban className="h-4 w-4" />
          {isExcluded ? '已排除' : '不想要'}
        </button>
      </div>
    </div>
  )
}
