import type { ComponentType } from 'react'
import { BookOpen, ChefHat, Dices, Heart, History } from 'lucide-react'

export type TabKey = 'pick' | 'favorites' | 'history' | 'dex' | 'library'

interface TabNavProps {
  active: TabKey
  onChange: (tab: TabKey) => void
  /** 各标签角标数量（可选） */
  counts?: Partial<Record<TabKey, number>>
}

const tabs: {
  key: TabKey
  label: string
  icon: ComponentType<{ className?: string }>
}[] = [
  { key: 'pick', label: '抽取', icon: Dices },
  { key: 'favorites', label: '收藏', icon: Heart },
  { key: 'history', label: '历史', icon: History },
  { key: 'dex', label: '图鉴', icon: BookOpen },
  { key: 'library', label: '我的', icon: ChefHat },
]

/** 顶部标签导航 */
export function TabNav({ active, onChange, counts }: TabNavProps) {
  return (
    <nav
      aria-label="页面导航"
      className="mx-auto mt-6 flex w-full max-w-md items-center gap-1 rounded-full border border-orange-warm-100 bg-white/70 p-1 shadow-sm shadow-orange-warm-500/5 backdrop-blur dark:border-stone-800 dark:bg-stone-900/70"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = tab.key === active
        const count = counts?.[tab.key]
        return (
          <button
            key={tab.key}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(tab.key)}
            className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-full px-2 py-2 text-xs font-medium transition-all duration-200 sm:text-sm ${
              isActive
                ? 'bg-orange-warm-500 text-white shadow-md shadow-orange-warm-500/30'
                : 'text-stone-500 hover:bg-orange-warm-50 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
            {typeof count === 'number' && count > 0 && (
              <span
                className={`inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                  isActive
                    ? 'bg-white/25 text-white'
                    : 'bg-orange-warm-100 text-orange-warm-600 dark:bg-orange-warm-500/20 dark:text-orange-warm-300'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )
}
