import { Heart } from 'lucide-react'

/** 页脚及项目说明 */
export function Footer() {
  return (
    <footer className="mt-auto w-full px-4 pb-8 pt-14 text-center">
      <div className="mx-auto flex max-w-md flex-col items-center gap-1.5 border-t border-orange-warm-100 pt-6 text-xs text-stone-400 dark:border-stone-800 dark:text-stone-500">
        <p className="flex items-center gap-1">
          用
          <Heart className="h-3.5 w-3.5 fill-blush-400 text-blush-400" />
          和一点点随机性制作
        </p>
        <p>「今天吃什么？」· 随机美食推荐小工具</p>
        <p className="text-stone-300 dark:text-stone-600">
          React + TypeScript + Vite + Tailwind CSS · 数据仅供参考，好吃才是硬道理
        </p>
      </div>
    </footer>
  )
}
