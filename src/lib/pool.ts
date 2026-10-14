import type { CustomFood, Food } from '../types/food'

/**
 * 计算推荐候选池的纯函数：
 * 1. 内置食物：排除「排除清单」中的项（内置食物不可删除，但可被排除）；
 * 2. 自定义食物：仅保留「启用」且未在排除清单中的项；
 * 3. 若开启「仅从收藏抽取」，进一步过滤出已收藏的食物。
 *
 * @param foods         内置美食池
 * @param customFoods   自定义美食
 * @param favorites     收藏 id 集合
 * @param exclusions    排除 id 集合
 * @param favoritesOnly 是否仅从收藏抽取
 * @returns 最终候选池
 */
export function computePool(
  foods: Food[],
  customFoods: CustomFood[],
  favorites: readonly number[],
  exclusions: readonly number[],
  favoritesOnly: boolean,
): Food[] {
  const exclusionSet = new Set(exclusions)
  const favoriteSet = new Set(favorites)

  const builtIn = foods.filter((f) => !exclusionSet.has(f.id))
  const custom = customFoods.filter(
    (f) => f.enabled && !exclusionSet.has(f.id),
  )

  let pool = [...builtIn, ...custom]

  if (favoritesOnly) {
    pool = pool.filter((f) => favoriteSet.has(f.id))
  }

  return pool
}
