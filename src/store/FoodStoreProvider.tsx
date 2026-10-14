import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { foods } from '../data/foods'
import { computePool } from '../lib/pool'
import { loadStore, saveStore } from '../lib/storage'
import {
  addHistoryEntry,
  clearHistory as clearHistoryAction,
  deleteCustomFood,
  draftToCustomFood,
  nextCustomId,
  toggleCustomEnabled,
  toggleExclusion,
  toggleFavorite,
  upsertCustomFood,
} from '../lib/storeActions'
import { FoodStoreContext } from './foodStoreContext'
import type { FoodStoreValue } from './foodStoreContext'
import type {
  CustomFood,
  Food,
  FoodDraft,
  FoodStoreState,
} from '../types/food'

export function FoodStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FoodStoreState>(() => loadStore())

  /** 状态变更即持久化到 localStorage */
  useEffect(() => {
    saveStore(state)
  }, [state])

  /** 内置 + 自定义（用于按 id 查找展示） */
  const allFoods = useMemo<Food[]>(
    () => [...foods, ...state.customFoods],
    [state.customFoods],
  )

  const pool = useMemo(
    () =>
      computePool(
        foods,
        state.customFoods,
        state.favorites,
        state.exclusions,
        state.favoritesOnly,
      ),
    [state.customFoods, state.favorites, state.exclusions, state.favoritesOnly],
  )

  const recentIds = useMemo(
    () => state.history.map((h) => h.foodId),
    [state.history],
  )

  const isFavorite = useCallback(
    (id: number) => state.favorites.includes(id),
    [state.favorites],
  )

  const isExcluded = useCallback(
    (id: number) => state.exclusions.includes(id),
    [state.exclusions],
  )

  const findFood = useCallback(
    (id: number) => allFoods.find((f) => f.id === id),
    [allFoods],
  )

  const toggleFavoriteCb = useCallback((id: number) => {
    setState((prev) => ({
      ...prev,
      favorites: toggleFavorite(prev.favorites, id),
    }))
  }, [])

  const recordPick = useCallback((food: Food) => {
    setState((prev) => ({
      ...prev,
      history: addHistoryEntry(prev.history, food.id, Date.now()),
    }))
  }, [])

  const clearHistory = useCallback(() => {
    setState((prev) => ({ ...prev, history: clearHistoryAction() }))
  }, [])

  const addCustomFood = useCallback(
    (draft: FoodDraft): CustomFood => {
      const id = nextCustomId(state.customFoods)
      const food = draftToCustomFood(draft, id)
      setState((prev) => ({
        ...prev,
        customFoods: upsertCustomFood(prev.customFoods, food),
      }))
      return food
    },
    [state.customFoods],
  )

  const updateCustomFood = useCallback((id: number, draft: FoodDraft) => {
    setState((prev) => {
      const existing = prev.customFoods.find((f) => f.id === id)
      if (!existing) return prev
      const updated: CustomFood = {
        ...draftToCustomFood(draft, id),
        enabled: existing.enabled,
      }
      return {
        ...prev,
        customFoods: upsertCustomFood(prev.customFoods, updated),
      }
    })
  }, [])

  const removeCustomFood = useCallback((id: number) => {
    setState((prev) => ({
      ...prev,
      customFoods: deleteCustomFood(prev.customFoods, id),
      // 清理对该食物的引用
      favorites: prev.favorites.filter((x) => x !== id),
      exclusions: prev.exclusions.filter((x) => x !== id),
      history: prev.history.filter((h) => h.foodId !== id),
    }))
  }, [])

  const toggleCustomEnabledCb = useCallback((id: number) => {
    setState((prev) => ({
      ...prev,
      customFoods: toggleCustomEnabled(prev.customFoods, id),
    }))
  }, [])

  const toggleExclusionCb = useCallback((id: number) => {
    setState((prev) => ({
      ...prev,
      exclusions: toggleExclusion(prev.exclusions, id),
    }))
  }, [])

  const setFavoritesOnly = useCallback((value: boolean) => {
    setState((prev) => ({ ...prev, favoritesOnly: value }))
  }, [])

  const value: FoodStoreValue = {
    state,
    pool,
    recentIds,
    isFavorite,
    isExcluded,
    toggleFavorite: toggleFavoriteCb,
    recordPick,
    clearHistory,
    addCustomFood,
    updateCustomFood,
    removeCustomFood,
    toggleCustomEnabled: toggleCustomEnabledCb,
    toggleExclusion: toggleExclusionCb,
    setFavoritesOnly,
    findFood,
  }

  return (
    <FoodStoreContext.Provider value={value}>
      {children}
    </FoodStoreContext.Provider>
  )
}
