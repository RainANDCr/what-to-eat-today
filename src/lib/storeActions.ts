import { HISTORY_MAX } from './storage'
import type { CustomFood, FoodDraft, HistoryEntry } from '../types/food'

/**
 * 收藏 / 排除清单等「集合」操作的纯函数集合。
 * 所有函数均不修改入参，返回新数组。
 */

/** 切换收藏：已存在则移除，否则追加 */
export function toggleInList(list: readonly number[], id: number): number[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
}

/** 收藏 */
export const toggleFavorite = toggleInList

/** 排除清单 */
export const toggleExclusion = toggleInList

/**
 * 追加一条历史记录并保持时间倒序、截断到上限。
 * 若同一条食物已在历史中，会先移除旧记录再前插（避免重复堆积）。
 */
export function addHistoryEntry(
  entries: readonly HistoryEntry[],
  foodId: number,
  timestamp: number,
  limit: number = HISTORY_MAX,
): HistoryEntry[] {
  const withoutSame = entries.filter((e) => e.foodId !== foodId)
  return [{ foodId, timestamp }, ...withoutSame]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit)
}

/** 清空历史 */
export function clearHistory(): HistoryEntry[] {
  return []
}

/**
 * 生成下一个自定义食物 id（负数，与内置正数 id 无冲突）。
 */
export function nextCustomId(customFoods: readonly CustomFood[]): number {
  const min = customFoods.reduce<number>(
    (acc, f) => (f.id < 0 && f.id < acc ? f.id : acc),
    0,
  )
  return min - 1
}

/** 由表单草稿构造自定义食物（启用状态默认 true） */
export function draftToCustomFood(draft: FoodDraft, id: number): CustomFood {
  return {
    id,
    name: draft.name,
    category: draft.category,
    description: draft.description,
    mealTypes: draft.mealTypes,
    priceLevel: draft.priceLevel,
    flavors: draft.flavors,
    tags: [],
    scenes: draft.scenes,
    enabled: true,
  }
}

/** 新增或更新自定义食物（按 id 匹配） */
export function upsertCustomFood(
  list: readonly CustomFood[],
  food: CustomFood,
): CustomFood[] {
  const index = list.findIndex((f) => f.id === food.id)
  if (index === -1) return [...list, food]
  const next = [...list]
  next[index] = food
  return next
}

/** 删除自定义食物 */
export function deleteCustomFood(
  list: readonly CustomFood[],
  id: number,
): CustomFood[] {
  return list.filter((f) => f.id !== id)
}

/** 切换自定义食物启用状态 */
export function toggleCustomEnabled(
  list: readonly CustomFood[],
  id: number,
): CustomFood[] {
  return list.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f))
}
