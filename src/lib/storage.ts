import {
  FOOD_CATEGORIES,
  FLAVOR_OPTIONS,
  MEAL_TYPE_OPTIONS,
  PRICE_LEVEL_OPTIONS,
  SCENE_OPTIONS,
} from './options'
import type {
  CustomFood,
  FoodCategory,
  FoodStoreState,
  Flavor,
  HistoryEntry,
  MealType,
  PriceLevel,
  Scene,
} from '../types/food'

/** 存储键名 */
export const STORAGE_KEY = 'what-to-eat:data'

/** 存储结构版本号：结构变更时递增并在 sanitize 中做迁移 */
export const STORAGE_VERSION = 1

/** 历史记录上限 */
export const HISTORY_MAX = 30

/** localStorage 的最小接口，便于测试注入 */
export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

/* ─────────────── 校验辅助 ─────────────── */

const categorySet = new Set<FoodCategory>(FOOD_CATEGORIES)
const flavorSet = new Set<Flavor>(FLAVOR_OPTIONS)
const mealTypeSet = new Set<MealType>(MEAL_TYPE_OPTIONS.map((o) => o.value))
const sceneSet = new Set<Scene>(SCENE_OPTIONS.map((o) => o.value))
const priceLevelSet = new Set<PriceLevel>(PRICE_LEVEL_OPTIONS.map((o) => o.value))

function sanitizeIdArray(raw: unknown): number[] {
  if (!Array.isArray(raw)) return []
  const seen = new Set<number>()
  const result: number[] = []
  for (const item of raw) {
    if (typeof item === 'number' && Number.isInteger(item) && !seen.has(item)) {
      seen.add(item)
      result.push(item)
    }
  }
  return result
}

function sanitizeStringArray<T extends string>(
  raw: unknown,
  allowed: Set<T>,
): T[] {
  if (!Array.isArray(raw)) return []
  const seen = new Set<T>()
  const result: T[] = []
  for (const item of raw) {
    if (typeof item === 'string' && allowed.has(item as T) && !seen.has(item as T)) {
      seen.add(item as T)
      result.push(item as T)
    }
  }
  return result
}

/** 校验单条自定义食物，非法则返回 null */
function sanitizeCustomFood(raw: unknown): CustomFood | null {
  if (typeof raw !== 'object' || raw === null) return null
  const r = raw as Record<string, unknown>

  if (typeof r.id !== 'number' || !Number.isInteger(r.id)) return null
  if (typeof r.name !== 'string' || r.name.trim() === '') return null
  if (typeof r.category !== 'string' || !categorySet.has(r.category as FoodCategory)) {
    return null
  }

  const mealTypes = sanitizeStringArray(r.mealTypes, mealTypeSet)
  const flavors = sanitizeStringArray(r.flavors, flavorSet)
  const scenes = sanitizeStringArray(r.scenes, sceneSet)
  const priceLevel = priceLevelSet.has(r.priceLevel as PriceLevel)
    ? (r.priceLevel as PriceLevel)
    : 2

  return {
    id: r.id,
    name: r.name.trim(),
    category: r.category as FoodCategory,
    description: typeof r.description === 'string' ? r.description : '',
    mealTypes,
    priceLevel,
    flavors,
    scenes,
    tags: Array.isArray(r.tags)
      ? r.tags.filter((t): t is string => typeof t === 'string')
      : [],
    enabled: typeof r.enabled === 'boolean' ? r.enabled : true,
  }
}

function sanitizeHistory(raw: unknown): HistoryEntry[] {
  if (!Array.isArray(raw)) return []
  const entries: HistoryEntry[] = []
  for (const item of raw) {
    if (typeof item !== 'object' || item === null) continue
    const r = item as Record<string, unknown>
    if (typeof r.foodId !== 'number' || !Number.isInteger(r.foodId)) continue
    if (typeof r.timestamp !== 'number' || !Number.isFinite(r.timestamp)) continue
    entries.push({ foodId: r.foodId, timestamp: r.timestamp })
  }
  // 按时间倒序，截断到上限
  return entries
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, HISTORY_MAX)
}

/** 默认状态 */
export function defaultStoreState(): FoodStoreState {
  return {
    favorites: [],
    history: [],
    customFoods: [],
    exclusions: [],
    favoritesOnly: false,
  }
}

/**
 * 纯函数：把未知结构清洗为合法的 FoodStoreState。
 * 任意字段非法都会回退为安全默认值，绝不抛出异常。
 */
export function sanitizeStore(raw: unknown): FoodStoreState {
  if (typeof raw !== 'object' || raw === null) return defaultStoreState()
  const r = raw as Record<string, unknown>

  const customFoods = Array.isArray(r.customFoods)
    ? r.customFoods
        .map(sanitizeCustomFood)
        .filter((f): f is CustomFood => f !== null)
    : []

  return {
    favorites: sanitizeIdArray(r.favorites),
    history: sanitizeHistory(r.history),
    customFoods,
    exclusions: sanitizeIdArray(r.exclusions),
    favoritesOnly: r.favoritesOnly === true,
  }
}

/** 读取并清洗本地存储；任何解析失败都回退为默认状态 */
export function loadStore(storage?: StorageLike): FoodStoreState {
  try {
    const s = storage ?? getDefaultStorage()
    if (!s) return defaultStoreState()
    const text = s.getItem(STORAGE_KEY)
    if (text == null) return defaultStoreState()
    const parsed = JSON.parse(text)
    // 版本迁移入口（当前 v1 无历史版本）
    return sanitizeStore(parsed)
  } catch {
    return defaultStoreState()
  }
}

/** 序列化并写入本地存储；失败静默（不阻断 UI） */
export function saveStore(
  state: FoodStoreState,
  storage?: StorageLike,
): boolean {
  try {
    const s = storage ?? getDefaultStorage()
    if (!s) return false
    s.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: STORAGE_VERSION, ...state }),
    )
    return true
  } catch {
    return false
  }
}

function getDefaultStorage(): StorageLike | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}
