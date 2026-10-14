import type {
  Flavor,
  FoodCategory,
  MealType,
  PriceLevel,
  Scene,
} from '../types/food'

/** 表单选项：分类 */
export const FOOD_CATEGORIES: FoodCategory[] = [
  '中式家常菜',
  '面食',
  '米饭与盖饭',
  '火锅与麻辣烫',
  '小吃',
  '早餐',
  '快餐',
  '地方特色',
  '素食',
  '原神美食',
]

/** 表单选项：口味 */
export const FLAVOR_OPTIONS: Flavor[] = [
  '清淡',
  '咸鲜',
  '香辣',
  '麻辣',
  '酸甜',
  '甜',
  '酸辣',
  '浓郁',
  '酥脆',
]

/** 表单选项：用餐时段（含中文标签） */
export const MEAL_TYPE_OPTIONS: { value: MealType; label: string }[] = [
  { value: 'breakfast', label: '早餐' },
  { value: 'lunch', label: '午餐' },
  { value: 'dinner', label: '晚餐' },
  { value: 'snack', label: '小吃' },
  { value: 'night', label: '夜宵' },
]

/** 表单选项：价格档位 */
export const PRICE_LEVEL_OPTIONS: { value: PriceLevel; label: string }[] = [
  { value: 1, label: '经济' },
  { value: 2, label: '适中' },
  { value: 3, label: '丰盛' },
]

/** 表单选项：用餐形式 */
export const SCENE_OPTIONS: { value: Scene; label: string }[] = [
  { value: 'eatOut', label: '堂食或外卖' },
  { value: 'homeCooking', label: '自己做饭' },
]

/** 价格档位中文标签 */
export const PRICE_LABELS: Record<PriceLevel, string> = {
  1: '经济',
  2: '适中',
  3: '丰盛',
}

/** 用餐时段中文标签 */
export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
  snack: '小吃',
  night: '夜宵',
}

/** 用餐形式中文标签 */
export const SCENE_LABELS: Record<Scene, string> = {
  eatOut: '堂食或外卖',
  homeCooking: '自己做饭',
}
