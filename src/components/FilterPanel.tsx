import type { ComponentType } from 'react'
import {
  ChefHat,
  CircleDashed,
  Citrus,
  Coffee,
  Crown,
  Flame,
  Leaf,
  Moon,
  PiggyBank,
  SlidersHorizontal,
  Sparkles,
  Store,
  Sun,
  Soup,
  Wallet,
} from 'lucide-react'
import type { FoodFilters } from '../types/food'

interface FilterPanelProps {
  filters: FoodFilters
  onChange: (filters: FoodFilters) => void
  /** 抽取动画期间禁用，避免状态竞争 */
  disabled?: boolean
  /** 当前符合条件的候选数量 */
  filteredCount: number
}

interface OptionItem<V extends string | number> {
  value: V
  label: string
  icon: ComponentType<{ className?: string }>
  /** 悬停提示，说明分组口径 */
  hint?: string
}

const mealOptions: OptionItem<FoodFilters['mealType']>[] = [
  { value: 'all', label: '不限', icon: CircleDashed },
  { value: 'breakfast', label: '早餐', icon: Coffee },
  { value: 'lunch', label: '午餐', icon: Sun },
  { value: 'dinner', label: '晚餐', icon: Moon },
  { value: 'night', label: '夜宵', icon: Soup },
]

const priceOptions: OptionItem<FoodFilters['priceLevel']>[] = [
  { value: 'all', label: '不限', icon: CircleDashed, hint: '不看预算' },
  { value: 1, label: '经济', icon: PiggyBank, hint: '约 15 元以内' },
  { value: 2, label: '适中', icon: Wallet, hint: '常见正餐价位' },
  { value: 3, label: '丰盛', icon: Crown, hint: '偶尔犒劳自己' },
]

const flavorOptions: OptionItem<FoodFilters['flavor']>[] = [
  { value: 'all', label: '不限', icon: CircleDashed },
  { value: '清淡', label: '清淡', icon: Leaf },
  { value: '香辣', label: '香辣', icon: Flame, hint: '含麻辣、酸辣' },
  { value: '酸甜', label: '酸甜', icon: Citrus },
  { value: '鲜香', label: '鲜香', icon: Sparkles, hint: '咸鲜、浓郁系' },
]

const sceneOptions: OptionItem<FoodFilters['scene']>[] = [
  { value: 'all', label: '不限', icon: CircleDashed },
  { value: 'eatOut', label: '堂食或外卖', icon: Store },
  { value: 'homeCooking', label: '自己做饭', icon: ChefHat },
]

/** 筛选面板：用餐时段 / 预算 / 口味 / 用餐形式 */
export function FilterPanel({
  filters,
  onChange,
  disabled = false,
  filteredCount,
}: FilterPanelProps) {
  return (
    <section
      aria-label="筛选条件"
      className="mx-auto mt-6 w-full max-w-md px-4"
    >
      <div className="rounded-3xl border border-orange-warm-100 bg-white/75 p-5 shadow-lg shadow-orange-warm-500/5 backdrop-blur dark:border-stone-800 dark:bg-stone-900/75 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-orange-warm-500" />
          <h2 className="text-sm font-semibold text-stone-700 dark:text-stone-200">按需筛选</h2>
          <span
            className={`ml-auto text-xs ${
              filteredCount === 0 ? 'font-semibold text-blush-400' : 'text-stone-400 dark:text-stone-500'
            }`}
            aria-live="polite"
          >
            {filteredCount === 0 ? '没有符合条件的选择' : `${filteredCount} 种可选`}
          </span>
        </div>

        <div className="flex flex-col gap-3.5">
          <FilterRow
            label="用餐时段"
            options={mealOptions}
            value={filters.mealType}
            disabled={disabled}
            onSelect={(v) => onChange({ ...filters, mealType: v })}
          />
          <FilterRow
            label="预算"
            options={priceOptions}
            value={filters.priceLevel}
            disabled={disabled}
            onSelect={(v) => onChange({ ...filters, priceLevel: v })}
          />
          <FilterRow
            label="口味"
            options={flavorOptions}
            value={filters.flavor}
            disabled={disabled}
            onSelect={(v) => onChange({ ...filters, flavor: v })}
          />
          <FilterRow
            label="用餐形式"
            options={sceneOptions}
            value={filters.scene}
            disabled={disabled}
            onSelect={(v) => onChange({ ...filters, scene: v })}
          />
        </div>
      </div>
    </section>
  )
}

interface FilterRowProps<V extends string | number> {
  label: string
  options: OptionItem<V>[]
  value: V
  disabled: boolean
  onSelect: (value: V) => void
}

/** 单行筛选：标签 + 圆角选项按钮组 */
function FilterRow<V extends string | number>({
  label,
  options,
  value,
  disabled,
  onSelect,
}: FilterRowProps<V>) {
  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
      <span className="w-16 shrink-0 text-xs font-medium text-stone-400 dark:text-stone-500">
        {label}
      </span>
      <div
        className="flex flex-wrap gap-1.5"
        role="group"
        aria-label={label}
      >
        {options.map((option) => {
          const Icon = option.icon
          const active = option.value === value
          return (
            <button
              key={String(option.value)}
              type="button"
              disabled={disabled}
              title={option.hint}
              aria-pressed={active}
              onClick={() => onSelect(option.value)}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                active
                  ? 'bg-orange-warm-500 text-white shadow-md shadow-orange-warm-500/30'
                  : 'bg-orange-warm-50 text-stone-500 hover:bg-orange-warm-100 hover:text-stone-700 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-stone-200'
              } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              <Icon className="h-3.5 w-3.5" />
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
