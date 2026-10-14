import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import type { ThemePreference } from '../hooks/useTheme'

const meta: Record<
  ThemePreference,
  { label: string; icon: typeof Sun }
> = {
  system: { label: '跟随系统', icon: Monitor },
  light: { label: '浅色模式', icon: Sun },
  dark: { label: '深色模式', icon: Moon },
}

/** 主题切换按钮：点击在「系统 → 浅色 → 深色」间循环 */
export function ThemeToggle() {
  const { preference, cycleTheme } = useTheme()
  const { label, icon: Icon } = meta[preference]

  return (
    <button
      type="button"
      onClick={cycleTheme}
      aria-label={`当前：${label}，点击切换主题`}
      title={`主题：${label}（点击切换）`}
      className="inline-flex items-center gap-1.5 rounded-full border border-orange-warm-100 bg-white/70 px-3 py-1.5 text-xs font-medium text-stone-500 shadow-sm backdrop-blur transition-all hover:bg-orange-warm-50 hover:text-stone-700 active:scale-95 dark:border-stone-800 dark:bg-stone-900/70 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200"
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  )
}
