import { useContext } from 'react'
import { FoodStoreContext } from '../store/foodStoreContext'
import type { FoodStoreValue } from '../store/foodStoreContext'

/** 读取全局持久化状态（需在 FoodStoreProvider 内使用） */
export function useFoodStore(): FoodStoreValue {
  const ctx = useContext(FoodStoreContext)
  if (!ctx) {
    throw new Error('useFoodStore 必须在 <FoodStoreProvider> 内使用')
  }
  return ctx
}
