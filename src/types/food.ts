/** 用餐时段 */
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'night'

/** 用餐形式场景：堂食或外卖 / 自己做饭 */
export type Scene = 'eatOut' | 'homeCooking'

/** 价格档位：1 = 便宜（约 15 元以内），2 = 适中，3 = 偏贵 */
export type PriceLevel = 1 | 2 | 3

/** 口味标签 */
export type Flavor =
  | '清淡'
  | '咸鲜'
  | '香辣'
  | '麻辣'
  | '酸甜'
  | '甜'
  | '酸辣'
  | '浓郁'
  | '酥脆'

/** 美食分类 */
export type FoodCategory =
  | '中式家常菜'
  | '面食'
  | '米饭与盖饭'
  | '火锅与麻辣烫'
  | '小吃'
  | '早餐'
  | '快餐'
  | '地方特色'
  | '素食'
  | '原神美食'

/** 单个美食条目 */
export interface Food {
  /** 唯一标识 */
  id: number
  /** 美食名称 */
  name: string
  /** 所属分类 */
  category: FoodCategory
  /** 一句话简介 */
  description: string
  /** 食物图片 URL（可选，原神联动等外部数据可能携带） */
  image?: string
  /** 适合的用餐时段 */
  mealTypes: MealType[]
  /** 价格档位 */
  priceLevel: PriceLevel
  /** 口味列表 */
  flavors: Flavor[]
  /** 趣味标签 */
  tags: string[]
  /** 适用场景：堂食或外卖 / 自己做饭 */
  scenes: Scene[]
}

/** 首页欢迎语文案 */
export interface Greeting {
  id: number
  text: string
}

/* ─────────────── 筛选相关类型 ─────────────── */

/** 筛选专用口味选项（与数据中的 Flavor 分组映射） */
export type FilterFlavor = '清淡' | '香辣' | '酸甜' | '鲜香'

/** 筛选条件（'all' 表示不限） */
export interface FoodFilters {
  /** 用餐时段 */
  mealType: 'all' | MealType
  /** 预算档位 */
  priceLevel: 'all' | PriceLevel
  /** 口味 */
  flavor: 'all' | FilterFlavor
  /** 用餐形式 */
  scene: 'all' | Scene
}

/* ─────────────── 第三阶段：个人菜单与持久化 ─────────────── */

/** 历史抽取记录 */
export interface HistoryEntry {
  /** 食物 id（内置为正数，自定义为负数） */
  foodId: number
  /** 抽取时间戳（毫秒） */
  timestamp: number
}

/** 自定义食物：在 Food 基础上增加启用开关 */
export interface CustomFood extends Food {
  /** 是否启用（禁用后不进入推荐池，但保留数据） */
  enabled: boolean
}

/** 本地持久化的完整状态 */
export interface FoodStoreState {
  /** 收藏的食物 id（含内置与自定义） */
  favorites: number[]
  /** 最近抽取历史（时间倒序） */
  history: HistoryEntry[]
  /** 用户自定义食物 */
  customFoods: CustomFood[]
  /** 排除清单（不想吃 / 需避免的食物 id） */
  exclusions: number[]
  /** 是否仅从收藏中抽取 */
  favoritesOnly: boolean
}

/** 自定义食物表单草稿（不含 id，用于新增与编辑） */
export interface FoodDraft {
  name: string
  category: FoodCategory
  description: string
  mealTypes: MealType[]
  priceLevel: PriceLevel
  flavors: Flavor[]
  scenes: Scene[]
}
