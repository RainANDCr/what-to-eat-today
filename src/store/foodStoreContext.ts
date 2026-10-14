import { createContext } from 'react'
import type { CustomFood, Food, FoodDraft, FoodStoreState } from '../types/food'

/** 全局持久化状态上下文的值类型 */
export interface FoodStoreValue {
  /** 持久化状态 */
  state: FoodStoreState
  /** 最终推荐候选池（内置 + 自定义，已应用排除与收藏过滤） */
  pool: Food[]
  /** 最近抽取的食物 id（时间倒序，用于减少重复推荐） */
  recentIds: number[]
  /** 是否已收藏 */
  isFavorite: (id: number) => boolean
  /** 是否已在排除清单 */
  isExcluded: (id: number) => boolean
  /** 切换收藏 */
  toggleFavorite: (id: number) => void
  /** 记录一次成功抽取 */
  recordPick: (food: Food) => void
  /** 清空历史 */
  clearHistory: () => void
  /** 新增自定义食物，返回创建后的食物 */
  addCustomFood: (draft: FoodDraft) => CustomFood
  /** 编辑自定义食物 */
  updateCustomFood: (id: number, draft: FoodDraft) => void
  /** 删除自定义食物 */
  removeCustomFood: (id: number) => void
  /** 切换自定义食物启用状态 */
  toggleCustomEnabled: (id: number) => void
  /** 切换排除清单 */
  toggleExclusion: (id: number) => void
  /** 设置「仅从收藏抽取」 */
  setFavoritesOnly: (value: boolean) => void
  /** 按 id 查找食物（内置或自定义） */
  findFood: (id: number) => Food | undefined
}

export const FoodStoreContext = createContext<FoodStoreValue | null>(null)
