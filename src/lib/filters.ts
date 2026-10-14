import type { FilterFlavor, Food, FoodFilters, Flavor, Scene } from '../types/food'

/** 默认筛选条件：全部不限 */
export const DEFAULT_FILTERS: FoodFilters = {
  mealType: 'all',
  priceLevel: 'all',
  flavor: 'all',
  scene: 'all',
}

/**
 * 筛选口味 → 数据口味分组的映射。
 * 香辣包含麻辣、酸辣等辣味系；鲜香对应咸鲜、浓郁系。
 */
const FLAVOR_MATCHES: Record<Exclude<FoodFilters['flavor'], 'all'>, Flavor[]> = {
  清淡: ['清淡'],
  香辣: ['香辣', '麻辣', '酸辣'],
  酸甜: ['酸甜'],
  鲜香: ['咸鲜', '浓郁'],
}

/**
 * 纯函数：按筛选条件过滤美食池。
 *
 * 规则：
 * 1. 所有已启用的筛选条件同时生效（AND 组合）；
 * 2. 'all' 表示该条件不启用；
 * 3. 不擅自放宽或忽略任何条件——无匹配时返回空数组，
 *    由 UI 提示用户调整筛选。
 *
 * @param foods   完整美食池
 * @param filters 筛选条件
 * @returns 同时满足所有已启用条件的美食列表
 */
export function filterFoods(foods: Food[], filters: FoodFilters): Food[] {
  return foods.filter((food) => {
    if (filters.mealType !== 'all' && !food.mealTypes.includes(filters.mealType)) {
      return false
    }
    if (filters.priceLevel !== 'all' && food.priceLevel !== filters.priceLevel) {
      return false
    }
    if (filters.flavor !== 'all') {
      const accepted = FLAVOR_MATCHES[filters.flavor]
      if (!food.flavors.some((f) => accepted.includes(f))) {
        return false
      }
    }
    if (filters.scene !== 'all' && !food.scenes.includes(filters.scene)) {
      return false
    }
    return true
  })
}

/**
 * 判断某个美食是否仍满足筛选条件（用于检测"结果过期"）。
 */
export function matchesFilters(food: Food, filters: FoodFilters): boolean {
  return filterFoods([food], filters).length > 0
}

/** 场景的中文描述（用于空态提示文案） */
export const sceneLabels: Record<Scene, string> = {
  eatOut: '堂食或外卖',
  homeCooking: '自己做饭',
}

/** 生成当前筛选条件的可读描述，用于无匹配提示 */
export function describeFilters(filters: FoodFilters): string {
  const parts: string[] = []
  const mealLabels: Record<string, string> = {
    breakfast: '早餐',
    lunch: '午餐',
    dinner: '晚餐',
    night: '夜宵',
  }
  const priceLabels: Record<string, string> = {
    1: '经济',
    2: '适中',
    3: '丰盛',
  }

  if (filters.mealType !== 'all') parts.push(mealLabels[filters.mealType])
  if (filters.priceLevel !== 'all') parts.push(priceLabels[filters.priceLevel])
  if (filters.flavor !== 'all') parts.push(`${filters.flavor}口`)
  if (filters.scene !== 'all') parts.push(sceneLabels[filters.scene])

  return parts.length > 0 ? parts.join(' + ') : '当前条件'
}

/** 导出映射供测试与文档使用 */
export { FLAVOR_MATCHES }
export type { FilterFlavor }
