import { memo } from 'react'
import {
  CookingPot,
  Coins,
  Flame,
  Sun,
  Moon,
  Utensils,
  Coffee,
  Soup,
  TriangleAlert,
  RotateCcw,
  SearchX,
  Heart,
  Ban,
  Sparkles,
} from 'lucide-react'
import { getFunCopy } from '../lib/copywriting'
import { FoodThumb } from './FoodThumb'
import type { Food, MealType, PriceLevel } from '../types/food'
import type { SpinPhase } from '../hooks/useFoodSpinner'

interface FoodCardProps {
  phase: SpinPhase
  result: Food | null
  /** 动画期间轮播的名称 */
  rollingName: string
  /** 原始数据池是否为空 */
  poolEmpty: boolean
  /** 筛选后无匹配结果 */
  filteredEmpty: boolean
  /** 当前结果是否已不符合筛选条件 */
  isStale: boolean
  /** 筛选条件的可读描述（无匹配提示用） */
  filtersDescription: string
  /** 重置筛选回调 */
  onResetFilters: () => void
  /** 当前结果是否已收藏 */
  isFavorite: boolean
  /** 当前结果是否已在排除清单 */
  isExcluded: boolean
  /** 切换收藏 */
  onToggleFavorite: () => void
  /** 切换排除 */
  onToggleExclusion: () => void
}

const mealTypeMeta: Record<MealType, { label: string; icon: typeof Sun }> = {
  breakfast: { label: '早餐', icon: Coffee },
  lunch: { label: '午餐', icon: Sun },
  dinner: { label: '晚餐', icon: Moon },
  snack: { label: '小吃', icon: Utensils },
  night: { label: '夜宵', icon: Soup },
}

const priceLabels: Record<PriceLevel, string> = {
  1: '实惠',
  2: '适中',
  3: '小贵',
}

/** 中央美食结果展示卡片 */
export const FoodCard = memo(function FoodCard({
  phase,
  result,
  rollingName,
  poolEmpty,
  filteredEmpty,
  isStale,
  filtersDescription,
  onResetFilters,
  isFavorite,
  isExcluded,
  onToggleFavorite,
  onToggleExclusion,
}: FoodCardProps) {
  const spinning = phase === 'spinning'

  return (
    <section className="mx-auto mt-8 w-full max-w-md px-4">
      <div className="relative overflow-hidden rounded-3xl border border-orange-warm-100 bg-white/80 p-8 shadow-xl shadow-orange-warm-500/10 backdrop-blur dark:border-stone-800 dark:bg-stone-900/80 sm:p-10">
        {/* 顶部装饰渐变条 */}
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-orange-warm-400 via-mango-400 to-blush-400" />

        {poolEmpty ? (
          <EmptyState />
        ) : filteredEmpty ? (
          <NoMatchState
            description={filtersDescription}
            onReset={onResetFilters}
          />
        ) : spinning ? (
          <SpinningState rollingName={rollingName} />
        ) : result ? (
          <ResultState
            food={result}
            isStale={isStale}
            isFavorite={isFavorite}
            isExcluded={isExcluded}
            onToggleFavorite={onToggleFavorite}
            onToggleExclusion={onToggleExclusion}
          />
        ) : (
          <IdleState />
        )}
      </div>
    </section>
  )
})

/** 初始状态：等待抽取 */
function IdleState() {
  return (
    <div className="flex flex-col items-center gap-5 py-6 text-center">
      <span className="flex h-24 w-24 animate-bounce-subtle items-center justify-center rounded-full bg-gradient-to-br from-orange-warm-100 to-mango-300/50">
        <CookingPot className="h-11 w-11 text-orange-warm-400" strokeWidth={1.6} />
      </span>
      <div>
        <p className="text-lg font-semibold text-stone-700 dark:text-stone-200">肚子在咕咕叫了……</p>
        <p className="mt-1.5 text-sm text-stone-400 dark:text-stone-500">
          点击下方按钮，让命运替你决定
        </p>
      </div>
    </div>
  )
}

/** 抽取动画状态 */
function SpinningState({ rollingName }: { rollingName: string }) {
  return (
    <div className="flex flex-col items-center gap-5 py-6 text-center">
      <span className="flex h-24 w-24 animate-wiggle items-center justify-center rounded-full bg-gradient-to-br from-orange-warm-200 to-orange-warm-400 shadow-lg shadow-orange-warm-500/30">
        <CookingPot className="h-11 w-11 animate-bounce-subtle text-white" strokeWidth={1.6} />
      </span>
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-orange-warm-500">
          抽取中
        </p>
        <p
          className="mt-2 break-words text-2xl font-bold text-stone-800 transition-opacity duration-75 dark:text-stone-100"
          key={rollingName}
        >
          {rollingName || '……'}
        </p>
        <p className="mt-1.5 text-sm text-stone-400 dark:text-stone-500">美味正在路上 🍳</p>
      </div>
    </div>
  )
}

/** 结果状态 */
function ResultState({
  food,
  isStale,
  isFavorite,
  isExcluded,
  onToggleFavorite,
  onToggleExclusion,
}: {
  food: Food
  isStale: boolean
  isFavorite: boolean
  isExcluded: boolean
  onToggleFavorite: () => void
  onToggleExclusion: () => void
}) {
  return (
    <div className="animate-pop-in flex flex-col items-center gap-5 py-2 text-center">
      {isStale && (
        <div className="mb-1 flex w-full items-center justify-center gap-1.5 rounded-2xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
          <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
          筛选条件已变更，当前结果不再符合条件，请重新抽取
        </div>
      )}

      <span className="rounded-full bg-orange-warm-100 px-3.5 py-1 text-xs font-semibold tracking-wide text-orange-warm-700 dark:bg-orange-warm-500/20 dark:text-orange-warm-300">
        {food.category}
      </span>

      <FoodThumb src={food.image} name={food.name} size={88} className="mx-auto" />

      <h2
        className={`max-w-full break-words text-3xl font-bold tracking-tight sm:text-4xl ${
          isStale ? 'text-stone-400 dark:text-stone-600' : 'text-stone-800 dark:text-stone-100'
        }`}
      >
        {food.name}
      </h2>

      {/* 趣味文案 */}
      <p className="inline-flex items-center gap-1.5 rounded-full bg-orange-warm-50 px-4 py-1.5 text-sm font-medium text-orange-warm-600 dark:bg-orange-warm-500/15 dark:text-orange-warm-300">
        <Sparkles className="h-3.5 w-3.5 shrink-0" />
        {getFunCopy(food)}
      </p>

      <p
        className={`max-w-xs break-words text-[15px] leading-relaxed ${
          isStale ? 'text-stone-400 dark:text-stone-600' : 'text-stone-500 dark:text-stone-400'
        }`}
      >
        {food.description}
      </p>

      {/* 元信息：价格档位 + 口味 */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
          <Coins className="h-3.5 w-3.5" />
          {priceLabels[food.priceLevel]}
        </span>
        {food.flavors.map((flavor) => (
          <span
            key={flavor}
            className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-500 dark:bg-red-500/15 dark:text-red-300"
          >
            <Flame className="h-3.5 w-3.5" />
            {flavor}
          </span>
        ))}
      </div>

      {/* 适合时段 */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {food.mealTypes.map((type) => {
          const meta = mealTypeMeta[type]
          const Icon = meta.icon
          return (
            <span
              key={type}
              className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-500 dark:bg-stone-800 dark:text-stone-400"
            >
              <Icon className="h-3.5 w-3.5" />
              {meta.label}
            </span>
          )
        })}
      </div>

      {/* 收藏 / 排除操作 */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleFavorite}
          aria-label={isFavorite ? `取消收藏 ${food.name}` : `收藏 ${food.name}`}
          aria-pressed={isFavorite}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all active:scale-95 ${
            isFavorite
              ? 'bg-blush-400/15 text-blush-400'
              : 'bg-stone-100 text-stone-500 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700'
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
              : 'bg-stone-100 text-stone-500 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700'
          }`}
        >
          <Ban className="h-4 w-4" />
          {isExcluded ? '已排除' : '不想要'}
        </button>
      </div>

      {/* 趣味标签 */}
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-stone-400 dark:text-stone-500">
        {food.tags.map((tag) => (
          <span key={tag}># {tag}</span>
        ))}
      </div>
    </div>
  )
}

/** 筛选无匹配：提示用户调整条件 */
function NoMatchState({
  description,
  onReset,
}: {
  description: string
  onReset: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-5 py-6 text-center">
      <span className="flex h-24 w-24 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-500/15">
        <SearchX className="h-11 w-11 text-amber-400" strokeWidth={1.6} />
      </span>
      <div>
        <p className="break-words text-lg font-semibold text-stone-700 dark:text-stone-200">
          没有符合「{description}」的美食
        </p>
        <p className="mt-1.5 text-sm text-stone-400 dark:text-stone-500">
          试试放宽一两个条件，选择会多很多
        </p>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center gap-1.5 rounded-full bg-orange-warm-100 px-4 py-2 text-sm font-semibold text-orange-warm-600 transition-colors hover:bg-orange-warm-200 dark:bg-orange-warm-500/20 dark:text-orange-warm-300 dark:hover:bg-orange-warm-500/30"
      >
        <RotateCcw className="h-4 w-4" />
        重置筛选条件
      </button>
    </div>
  )
}

/** 空数据池的友好提示 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <span className="flex h-24 w-24 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800">
        <Soup className="h-11 w-11 text-stone-300 dark:text-stone-600" strokeWidth={1.6} />
      </span>
      <div>
        <p className="text-lg font-semibold text-stone-700 dark:text-stone-200">菜单暂时空空如也</p>
        <p className="mt-1.5 text-sm text-stone-400 dark:text-stone-500">
          美食数据池没有内容，请稍后再来看看～
        </p>
      </div>
    </div>
  )
}
