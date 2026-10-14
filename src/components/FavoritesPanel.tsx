import { Heart, HeartOff, Star } from 'lucide-react'
import { useFoodStore } from '../hooks/useFoodStore'
import { FoodThumb } from './FoodThumb'

/** 收藏夹独立界面 */
export function FavoritesPanel() {
  const { state, findFood, toggleFavorite, setFavoritesOnly } = useFoodStore()

  const favoriteFoods = state.favorites
    .map((id) => findFood(id))
    .filter((f): f is NonNullable<typeof f> => f !== undefined)

  return (
    <section className="mx-auto mt-6 w-full max-w-md px-4">
      <div className="rounded-3xl border border-orange-warm-100 bg-white/80 p-6 shadow-lg shadow-orange-warm-500/10 backdrop-blur dark:border-stone-800 dark:bg-stone-900/80">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-semibold text-stone-700 dark:text-stone-200">
            <Heart className="h-5 w-5 fill-blush-400 text-blush-400" />
            我的收藏
            <span className="text-sm font-normal text-stone-400 dark:text-stone-500">
              （{favoriteFoods.length}）
            </span>
          </h2>
        </div>

        {/* 仅从收藏抽取开关 */}
        <label className="mb-5 flex cursor-pointer items-center justify-between rounded-2xl bg-orange-warm-50 px-4 py-3 dark:bg-stone-800">
          <span className="flex items-center gap-2 text-sm font-medium text-stone-600 dark:text-stone-300">
            <Star className="h-4 w-4 text-orange-warm-400" />
            仅从收藏中抽取
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={state.favoritesOnly}
            onClick={() => setFavoritesOnly(!state.favoritesOnly)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
              state.favoritesOnly ? 'bg-orange-warm-500' : 'bg-stone-200 dark:bg-stone-600'
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                state.favoritesOnly ? 'translate-x-5.5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </label>

        {favoriteFoods.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800">
              <Heart className="h-7 w-7 text-stone-300 dark:text-stone-600" />
            </span>
            <p className="text-sm text-stone-400 dark:text-stone-500">
              还没有收藏任何美食。抽取到喜欢的，点一下❤️收藏起来吧。
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {favoriteFoods.map((food) => (
              <li
                key={food.id}
                className="flex items-center gap-3 rounded-2xl border border-orange-warm-100/70 bg-white px-4 py-3 dark:border-stone-800 dark:bg-stone-800/60"
              >
                <FoodThumb src={food.image} name={food.name} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-stone-700 dark:text-stone-200">
                    {food.name}
                  </p>
                  <p className="truncate text-xs text-stone-400 dark:text-stone-500">
                    {food.category}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleFavorite(food.id)}
                  aria-label={`取消收藏 ${food.name}`}
                  className="rounded-full p-2 text-blush-400 transition-colors hover:bg-blush-300/15"
                >
                  <HeartOff className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
