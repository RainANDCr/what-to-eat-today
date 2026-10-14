import { UtensilsCrossed } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'

/** 顶部 Logo 区（含主题切换） */
export function Header() {
  return (
    <header className="relative flex items-center justify-center gap-3 pt-8 pb-2 sm:pt-10">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-warm-400 to-orange-warm-600 shadow-lg shadow-orange-warm-500/30 sm:h-12 sm:w-12">
        <UtensilsCrossed className="h-6 w-6 text-white" strokeWidth={2.2} />
      </span>
      <h1 className="text-2xl font-bold tracking-tight text-stone-800 dark:text-stone-100 sm:text-3xl">
        今天吃什么？
      </h1>
      <div className="absolute right-4 sm:right-6">
        <ThemeToggle />
      </div>
    </header>
  )
}
