import { useState } from 'react'
import { History, Trash2, Utensils } from 'lucide-react'
import { useFoodStore } from '../hooks/useFoodStore'
import { formatRelativeTime } from '../lib/datetime'
import { FoodThumb } from './FoodThumb'

/** 历史记录独立界面 */
export function HistoryPanel() {
  const { state, findFood, clearHistory } = useFoodStore()
  const [confirming, setConfirming] = useState(false)

  const handleClear = () => {
    if (!confirming) {
      setConfirming(true)
      // 3 秒后自动取消确认态
      window.setTimeout(() => setConfirming(false), 3000)
      return
    }
    clearHistory()
    setConfirming(false)
  }

  return (
    <section className="mx-auto mt-6 w-full max-w-md px-4">
      <div className="rounded-3xl border border-orange-warm-100 bg-white/80 p-6 shadow-lg shadow-orange-warm-500/10 backdrop-blur dark:border-stone-800 dark:bg-stone-900/80">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-semibold text-stone-700 dark:text-stone-200">
            <History className="h-5 w-5 text-orange-warm-500" />
            抽取历史
            <span className="text-sm font-normal text-stone-400 dark:text-stone-500">
              （最近 {state.history.length} 次）
            </span>
          </h2>
          {state.history.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              onBlur={() => setConfirming(false)}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                confirming
                  ? 'bg-red-500 text-white'
                  : 'text-stone-400 hover:bg-stone-100 hover:text-red-500 dark:text-stone-500 dark:hover:bg-stone-800'
              }`}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {confirming ? '确认清空？' : '清空'}
            </button>
          )}
        </div>

        {state.history.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800">
              <Utensils className="h-7 w-7 text-stone-300 dark:text-stone-600" />
            </span>
            <p className="text-sm text-stone-400 dark:text-stone-500">
              还没有抽取记录。去抽取几顿，历史会记在这里。
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {state.history.map((entry, index) => {
              const food = findFood(entry.foodId)
              return (
                <li
                  key={`${entry.foodId}-${entry.timestamp}-${index}`}
                  className="flex items-center gap-3 rounded-2xl border border-orange-warm-100/70 bg-white px-4 py-3 dark:border-stone-800 dark:bg-stone-800/60"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-warm-50 text-sm font-bold text-orange-warm-500 dark:bg-orange-warm-500/15 dark:text-orange-warm-300">
                    {state.history.length - index}
                  </span>
                  <FoodThumb src={food?.image} name={food?.name ?? ''} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-stone-700 dark:text-stone-200">
                      {food ? food.name : '（已删除的食物）'}
                    </p>
                    <p className="truncate text-xs text-stone-400 dark:text-stone-500">
                      {food ? food.category : ''}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-stone-400 dark:text-stone-500">
                    {formatRelativeTime(entry.timestamp)}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
