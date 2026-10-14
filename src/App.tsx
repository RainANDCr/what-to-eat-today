import { useCallback, useEffect, useMemo, useState } from 'react'
import { Dices, Star, WandSparkles } from 'lucide-react'
import { FavoritesPanel } from './components/FavoritesPanel'
import { FilterPanel } from './components/FilterPanel'
import { FoodCard } from './components/FoodCard'
import { FoodDex } from './components/FoodDex'
import { FoodLibrary } from './components/FoodLibrary'
import { Footer } from './components/Footer'
import { GreetingBanner } from './components/GreetingBanner'
import { Header } from './components/Header'
import { HistoryPanel } from './components/HistoryPanel'
import { SpinControls } from './components/SpinControls'
import { TabNav } from './components/TabNav'
import type { TabKey } from './components/TabNav'
import { WheelPicker } from './components/WheelPicker'
import { foods, greetings } from './data/foods'
import { useFoodStore } from './hooks/useFoodStore'
import { useFoodSpinner, useRandomGreeting } from './hooks/useFoodSpinner'
import { getDateInfo } from './lib/datetime'
import { DEFAULT_FILTERS, describeFilters, filterFoods } from './lib/filters'
import type { FoodFilters } from './types/food'

/** 抽取方式 */
type PickMode = 'random' | 'wheel'

/** 定期刷新日期与时段问候（分钟级足够） */
const DATE_REFRESH_MS = 30_000

export default function App() {
  const store = useFoodStore()
  const [tab, setTab] = useState<TabKey>('pick')
  const [mode, setMode] = useState<PickMode>('random')
  const [filters, setFilters] = useState<FoodFilters>(DEFAULT_FILTERS)
  const [now, setNow] = useState(() => new Date())

  /** 候选池：先应用排除/收藏/自定义，再应用筛选条件 */
  const filteredFoods = useMemo(
    () => filterFoods(store.pool, filters),
    [store.pool, filters],
  )

  const { result, rollingName, phase, isSpinning, spin } = useFoodSpinner(
    filteredFoods,
    store.recentIds,
    store.recordPick,
  )
  const { text: welcomeText } = useRandomGreeting(greetings)

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), DATE_REFRESH_MS)
    return () => clearInterval(timer)
  }, [])

  const dateInfo = useMemo(() => getDateInfo(now), [now])

  /** 当前结果是否已不在候选池中（筛选/排除/收藏模式变更导致） */
  const isStale = useMemo(
    () => result !== null && !filteredFoods.some((f) => f.id === result.id),
    [result, filteredFoods],
  )

  const filterDescription = useMemo(() => {
    if (store.state.favoritesOnly && store.state.favorites.length === 0) {
      return '仅从收藏（还没有收藏）'
    }
    return describeFilters(filters)
  }, [store.state.favoritesOnly, store.state.favorites.length, filters])

  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
  }, [])

  const resultId = result?.id ?? null
  const resultIsFavorite = resultId !== null && store.isFavorite(resultId)
  const resultIsExcluded = resultId !== null && store.isExcluded(resultId)

  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden">
      {/* 背景装饰：柔和渐变 + 漂浮气泡 */}
      <BackgroundDecor />

      <Header />
      <TabNav
        active={tab}
        onChange={setTab}
        counts={{
          favorites: store.state.favorites.length,
          history: store.state.history.length,
          library: store.state.customFoods.length,
        }}
      />

      {/* 抽取页 */}
      <div className={tab === 'pick' ? '' : 'hidden'}>
        <GreetingBanner dateInfo={dateInfo} welcomeText={welcomeText} />

        {/* 抽取方式切换 */}
        <PickModeSwitch mode={mode} onChange={setMode} />

        {mode === 'random' ? (
          <>
            <FoodCard
              phase={phase}
              result={result}
              rollingName={rollingName}
              poolEmpty={foods.length === 0}
              filteredEmpty={filteredFoods.length === 0 && foods.length > 0}
              isStale={isStale}
              filtersDescription={filterDescription}
              onResetFilters={handleResetFilters}
              isFavorite={resultIsFavorite}
              isExcluded={resultIsExcluded}
              onToggleFavorite={() => resultId !== null && store.toggleFavorite(resultId)}
              onToggleExclusion={() => resultId !== null && store.toggleExclusion(resultId)}
            />
            <SpinControls
              phase={phase}
              onSpin={spin}
              noCandidates={filteredFoods.length === 0}
              isStale={isStale}
            />
          </>
        ) : (
          <WheelPicker candidates={filteredFoods} />
        )}

        {/* 仅从收藏抽取快捷开关 */}
        <button
          type="button"
          onClick={() => store.setFavoritesOnly(!store.state.favoritesOnly)}
          aria-pressed={store.state.favoritesOnly}
          className={`mx-auto mt-5 flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
            store.state.favoritesOnly
              ? 'bg-blush-400 text-white shadow-md shadow-blush-400/30'
              : 'bg-white/70 text-stone-500 hover:bg-orange-warm-50 dark:bg-stone-900/60 dark:text-stone-400 dark:hover:bg-stone-800'
          }`}
        >
          <Star
            className={`h-4 w-4 ${store.state.favoritesOnly ? 'fill-white' : ''}`}
          />
          {store.state.favoritesOnly ? '仅从收藏抽取中' : '仅从收藏抽取'}
        </button>

        <FilterPanel
          filters={filters}
          onChange={setFilters}
          disabled={isSpinning}
          filteredCount={filteredFoods.length}
        />
      </div>

      {/* 收藏页 */}
      <div className={tab === 'favorites' ? '' : 'hidden'}>
        <FavoritesPanel />
      </div>

      {/* 历史页 */}
      <div className={tab === 'history' ? '' : 'hidden'}>
        <HistoryPanel />
      </div>

      {/* 图鉴页 */}
      <div className={tab === 'dex' ? '' : 'hidden'}>
        <FoodDex />
      </div>

      {/* 我的页 */}
      <div className={tab === 'library' ? '' : 'hidden'}>
        <FoodLibrary />
      </div>

      <Footer />
      {/* 无障碍：抽取状态播报 */}
      <span className="sr-only" role="status" aria-live="polite">
        {isSpinning
          ? '正在抽取美食'
          : result
            ? `今日推荐：${result.name}`
            : ''}
      </span>
    </div>
  )
}

/** 抽取方式切换（随机 / 转盘） */
function PickModeSwitch({
  mode,
  onChange,
}: {
  mode: PickMode
  onChange: (mode: PickMode) => void
}) {
  const options: { value: PickMode; label: string; icon: typeof Dices }[] = [
    { value: 'random', label: '随机抽取', icon: Dices },
    { value: 'wheel', label: '幸运转盘', icon: WandSparkles },
  ]

  return (
    <div
      role="group"
      aria-label="抽取方式"
      className="mx-auto mt-5 flex w-fit items-center gap-1 rounded-full border border-orange-warm-100 bg-white/70 p-1 shadow-sm backdrop-blur dark:border-stone-800 dark:bg-stone-900/70"
    >
      {options.map((opt) => {
        const Icon = opt.icon
        const active = opt.value === mode
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 sm:text-sm ${
              active
                ? 'bg-orange-warm-500 text-white shadow-md shadow-orange-warm-500/30'
                : 'text-stone-500 hover:bg-orange-warm-50 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Icon className="h-4 w-4" />
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

/** 背景：奶油白渐变 + 若干漂浮的柔色圆点 */
function BackgroundDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-b from-orange-warm-100 via-cream-100 to-cream-200 dark:from-stone-900 dark:via-stone-950 dark:to-stone-950" />
      <div className="absolute -top-16 -left-16 h-56 w-56 animate-float rounded-full bg-mango-300/25 blur-3xl dark:bg-orange-warm-500/10" />
      <div className="absolute top-1/3 -right-20 h-72 w-72 animate-float rounded-full bg-orange-warm-300/25 blur-3xl [animation-delay:-2s] dark:bg-blush-400/10" />
      <div className="absolute bottom-0 left-1/4 h-48 w-48 animate-float rounded-full bg-blush-300/20 blur-3xl [animation-delay:-3.5s] dark:bg-orange-warm-400/10" />
    </div>
  )
}
