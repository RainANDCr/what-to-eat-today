import { useMemo, useState } from 'react'
import { BookOpen, Heart, HeartOff, Search, Sparkles } from 'lucide-react'
import { foods } from '../data/foods'
import { useFoodStore } from '../hooks/useFoodStore'
import { FOOD_CATEGORIES } from '../lib/options'
import { getPinyinInitial } from '../lib/pinyin'
import { FoodThumb } from './FoodThumb'
import type { Food, FoodCategory } from '../types/food'

type CategoryFilter = 'all' | FoodCategory

const COLLATOR = new Intl.Collator('zh-Hans-CN')

/** 分类筛选标签（「原神」子类置顶突出） */
const CATEGORY_TABS: { value: CategoryFilter; label: string; highlight?: boolean }[] = [
  { value: 'all', label: '全部' },
  { value: '原神美食', label: '原神', highlight: true },
  ...FOOD_CATEGORIES.filter((c) => c !== '原神美食').map((c) => ({
    value: c as CategoryFilter,
    label: c,
  })),
]

/** 美食图鉴：搜索 + 首字母分组 + 原神子类 */
export function FoodDex() {
  const { state, toggleFavorite } = useFoodStore()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('all')

  /** 内置（含原神联动）+ 自定义，作为图鉴全集 */
  const allFoods = useMemo<Food[]>(
    () => [...foods, ...state.customFoods],
    [state.customFoods],
  )

  const filtered = useMemo(() => {
    let list = allFoods
    if (category !== 'all') {
      list = list.filter((f) => f.category === category)
    }
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          f.category.includes(q) ||
          f.tags.some((t) => t.toLowerCase().includes(q)) ||
          f.flavors.some((t) => t.includes(q)),
      )
    }
    return list
  }, [allFoods, category, query])

  /** 按首字母分组（A-Z，其余归 #），组内按中文拼音排序 */
  const groups = useMemo(() => {
    const map = new Map<string, Food[]>()
    for (const f of filtered) {
      const key = getPinyinInitial(f.name)
      const bucket = map.get(key)
      if (bucket) bucket.push(f)
      else map.set(key, [f])
    }
    for (const list of map.values()) {
      list.sort((a, b) => COLLATOR.compare(a.name, b.name))
    }
    return [...map.entries()].sort((a, b) => {
      if (a[0] === '#') return 1
      if (b[0] === '#') return -1
      return a[0] < b[0] ? -1 : 1
    })
  }, [filtered])

  return (
    <section className="mx-auto mt-6 w-full max-w-md px-4">
      {/* 标题 */}
      <div className="mb-4 flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-orange-warm-500" />
        <h2 className="text-base font-semibold text-stone-700 dark:text-stone-200">
          美食图鉴
        </h2>
        <span className="text-sm text-stone-400 dark:text-stone-500">
          （{filtered.length}）
        </span>
      </div>

      {/* 搜索框 */}
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索食物名称、描述、标签…"
          className="w-full rounded-full border border-orange-warm-100 bg-white/80 py-2.5 pl-10 pr-4 text-sm text-stone-700 shadow-sm outline-none placeholder:text-stone-400 focus:border-orange-warm-400 focus:ring-2 focus:ring-orange-warm-300/40 dark:border-stone-800 dark:bg-stone-900/80 dark:text-stone-200 dark:placeholder:text-stone-500"
        />
      </div>

      {/* 分类筛选（原神子类置顶） */}
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1">
        {CATEGORY_TABS.map((tab) => {
          const active = tab.value === category
          const isHighlight = tab.highlight
          return (
            <button
              key={tab.value}
              type="button"
              aria-pressed={active}
              onClick={() => setCategory(tab.value)}
              className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                active
                  ? isHighlight
                    ? 'bg-violet-500 text-white shadow-md shadow-violet-500/30'
                    : 'bg-orange-warm-500 text-white shadow-md shadow-orange-warm-500/30'
                  : isHighlight
                    ? 'text-violet-600 hover:bg-violet-100 dark:text-violet-300 dark:hover:bg-violet-500/15'
                    : 'text-stone-500 hover:bg-orange-warm-50 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200'
              }`}
            >
              {isHighlight && (
                <Sparkles className={active ? 'h-3.5 w-3.5' : 'h-3.5 w-3.5'} />
              )}
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* 分组列表 */}
      {groups.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800">
            <Search className="h-6 w-6 text-stone-300 dark:text-stone-600" />
          </span>
          <p className="text-sm text-stone-400 dark:text-stone-500">
            {query || category !== 'all'
              ? '没有找到符合条件的食物，换个关键词或分类试试。'
              : '图鉴里空空如也。'}
          </p>
        </div>
      ) : (
        groups.map(([letter, list]) => (
          <div key={letter} className="mb-5">
            <h3 className="mb-2 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-warm-500/10 text-sm font-bold text-orange-warm-600 dark:bg-orange-warm-500/15 dark:text-orange-warm-300">
                {letter}
              </span>
              <span className="text-xs text-stone-400 dark:text-stone-500">
                {list.length} 道
              </span>
            </h3>
            <ul className="flex flex-col gap-2">
              {list.map((food) => {
                const fav = state.favorites.includes(food.id)
                return (
                  <li
                    key={food.id}
                    className="flex items-center gap-3 rounded-2xl border border-orange-warm-100/70 bg-white/80 px-4 py-3 dark:border-stone-800 dark:bg-stone-800/60"
                  >
                    <FoodThumb src={food.image} name={food.name} size={44} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-stone-700 dark:text-stone-200">
                        {food.name}
                      </p>
                      <p className="truncate text-xs text-stone-400 dark:text-stone-500">
                        {food.category}
                        {food.tags.includes('特色料理') && (
                          <span className="ml-1.5 rounded bg-violet-100 px-1 py-0.5 text-[10px] font-medium text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
                            特色料理
                          </span>
                        )}
                      </p>
                      {food.description && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-stone-500 dark:text-stone-400">
                          {food.description}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleFavorite(food.id)}
                      aria-label={`${fav ? '取消收藏' : '收藏'} ${food.name}`}
                      className={`shrink-0 rounded-full p-2 transition-colors ${
                        fav
                          ? 'text-blush-400 hover:bg-blush-300/15'
                          : 'text-stone-300 hover:bg-blush-300/10 hover:text-blush-400 dark:text-stone-600'
                      }`}
                    >
                      {fav ? (
                        <Heart className="h-5 w-5 fill-blush-400" />
                      ) : (
                        <HeartOff className="h-5 w-5" />
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))
      )}
    </section>
  )
}
