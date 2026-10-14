import { useState } from 'react'
import {
  Ban,
  ChefHat,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import { useFoodStore } from '../hooks/useFoodStore'
import { PRICE_LABELS } from '../lib/options'
import { FoodEditor } from './FoodEditor'
import type { CustomFood } from '../types/food'

/** 我的：自定义食物管理 + 排除清单 */
export function FoodLibrary() {
  const {
    state,
    findFood,
    removeCustomFood,
    toggleCustomEnabled,
    toggleExclusion,
  } = useFoodStore()

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<CustomFood | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

  const excludedFoods = state.exclusions
    .map((id) => findFood(id))
    .filter((f): f is NonNullable<typeof f> => f !== undefined)

  const openAdd = () => {
    setEditing(null)
    setShowForm(true)
  }

  const openEdit = (food: CustomFood) => {
    setEditing(food)
    setShowForm(true)
  }

  const closeEditor = () => {
    setShowForm(false)
    setEditing(null)
  }

  const handleDelete = (food: CustomFood) => {
    if (deleteConfirmId !== food.id) {
      setDeleteConfirmId(food.id)
      window.setTimeout(() => setDeleteConfirmId(null), 3000)
      return
    }
    removeCustomFood(food.id)
    setDeleteConfirmId(null)
  }

  return (
    <section className="mx-auto mt-6 w-full max-w-md px-4">
      {/* 自定义食物 */}
      <div className="rounded-3xl border border-orange-warm-100 bg-white/80 p-6 shadow-lg shadow-orange-warm-500/10 backdrop-blur dark:border-stone-800 dark:bg-stone-900/80">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-semibold text-stone-700 dark:text-stone-200">
            <ChefHat className="h-5 w-5 text-orange-warm-500" />
            我的自定义食物
            <span className="text-sm font-normal text-stone-400 dark:text-stone-500">
              （{state.customFoods.length}）
            </span>
          </h2>
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-1 rounded-full bg-orange-warm-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-orange-warm-500/30 transition-all hover:bg-orange-warm-600 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            添加
          </button>
        </div>

        {showForm && (
          <div className="mb-4 rounded-2xl bg-orange-warm-50/70 p-4 dark:bg-stone-800/60">
            <FoodEditor food={editing} onClose={closeEditor} />
          </div>
        )}

        {state.customFoods.length === 0 && !showForm ? (
          <p className="py-6 text-center text-sm text-stone-400 dark:text-stone-500">
            还没有自定义食物。点击「添加」，把你家的拿手菜加进来吧。
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {state.customFoods.map((food) => (
              <li
                key={food.id}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
                  food.enabled
                    ? 'border-orange-warm-100/70 bg-white dark:border-stone-800 dark:bg-stone-800/60'
                    : 'border-stone-100 bg-stone-50 opacity-60 dark:border-stone-700 dark:bg-stone-800/40'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-stone-700 dark:text-stone-200">
                    {food.name}
                    {!food.enabled && (
                      <span className="ml-2 text-xs font-normal text-stone-400 dark:text-stone-500">
                        已禁用
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-stone-400 dark:text-stone-500">
                    {food.category} · {PRICE_LABELS[food.priceLevel]}
                  </p>
                </div>

                {/* 启用开关 */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={food.enabled}
                  aria-label={`${food.enabled ? '禁用' : '启用'} ${food.name}`}
                  onClick={() => toggleCustomEnabled(food.id)}
                  className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                    food.enabled ? 'bg-orange-warm-500' : 'bg-stone-300 dark:bg-stone-600'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      food.enabled ? 'translate-x-4.5' : 'translate-x-0.5'
                    }`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => openEdit(food)}
                  aria-label={`编辑 ${food.name}`}
                  className="rounded-full p-1.5 text-stone-400 transition-colors hover:bg-orange-warm-50 hover:text-orange-warm-500 dark:hover:bg-stone-700"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(food)}
                  aria-label={`删除 ${food.name}`}
                  className={`rounded-full p-1.5 transition-colors ${
                    deleteConfirmId === food.id
                      ? 'bg-red-500 text-white'
                      : 'text-stone-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/15'
                  }`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 排除清单 */}
      <div className="mt-4 rounded-3xl border border-orange-warm-100 bg-white/80 p-6 shadow-lg shadow-orange-warm-500/10 backdrop-blur dark:border-stone-800 dark:bg-stone-900/80">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-stone-700 dark:text-stone-200">
          <Ban className="h-5 w-5 text-stone-400 dark:text-stone-500" />
          排除清单
          <span className="text-sm font-normal text-stone-400 dark:text-stone-500">
            （{excludedFoods.length}）
          </span>
        </h2>

        {excludedFoods.length === 0 ? (
          <p className="py-4 text-center text-sm text-stone-400 dark:text-stone-500">
            这里可以放你不想吃或需要避免的食物。抽取时会被自动跳过。
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {excludedFoods.map((food) => (
              <li
                key={food.id}
                className="flex items-center gap-3 rounded-2xl border border-stone-100 bg-stone-50 px-4 py-2.5 dark:border-stone-800 dark:bg-stone-800/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-stone-600 dark:text-stone-300">
                    {food.name}
                  </p>
                  <p className="truncate text-xs text-stone-400 dark:text-stone-500">
                    {food.category}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleExclusion(food.id)}
                  aria-label={`移出排除清单 ${food.name}`}
                  className="rounded-full p-1.5 text-stone-400 transition-colors hover:bg-stone-200 hover:text-stone-600 dark:hover:bg-stone-700 dark:hover:text-stone-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
