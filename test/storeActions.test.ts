import { describe, expect, it } from 'vitest'
import {
  addHistoryEntry,
  clearHistory,
  deleteCustomFood,
  draftToCustomFood,
  nextCustomId,
  toggleCustomEnabled,
  toggleFavorite,
  toggleExclusion,
  upsertCustomFood,
} from '../src/lib/storeActions'
import type { CustomFood, FoodDraft } from '../src/types/food'

describe('收藏管理', () => {
  it('toggleFavorite 添加与移除', () => {
    expect(toggleFavorite([], 1)).toEqual([1])
    expect(toggleFavorite([1, 2], 1)).toEqual([2])
    expect(toggleFavorite([1, 2], 3)).toEqual([1, 2, 3])
  })

  it('toggleFavorite 不修改原数组', () => {
    const list = [1]
    toggleFavorite(list, 2)
    expect(list).toEqual([1])
  })
})

describe('排除清单', () => {
  it('toggleExclusion 添加与移除', () => {
    expect(toggleExclusion([], 7)).toEqual([7])
    expect(toggleExclusion([7], 7)).toEqual([])
  })
})

describe('历史记录', () => {
  it('addHistoryEntry 前插并按时间倒序', () => {
    const entries = [
      { foodId: 2, timestamp: 200 },
      { foodId: 1, timestamp: 100 },
    ]
    const next = addHistoryEntry(entries, 3, 300)
    expect(next[0]).toEqual({ foodId: 3, timestamp: 300 })
    expect(next).toHaveLength(3)
  })

  it('同一条食物重复抽取时去重并前插', () => {
    const entries = [
      { foodId: 2, timestamp: 200 },
      { foodId: 1, timestamp: 100 },
    ]
    const next = addHistoryEntry(entries, 1, 300)
    expect(next).toHaveLength(2)
    expect(next[0]).toEqual({ foodId: 1, timestamp: 300 })
  })

  it('截断到上限 30 条', () => {
    let entries: ReturnType<typeof addHistoryEntry> = []
    for (let i = 0; i < 40; i++) {
      entries = addHistoryEntry(entries, i + 1, i)
    }
    expect(entries).toHaveLength(30)
    expect(entries[0].foodId).toBe(40)
  })

  it('clearHistory 返回空', () => {
    expect(clearHistory()).toEqual([])
  })
})

const baseDraft: FoodDraft = {
  name: '家常豆腐',
  category: '素食',
  description: '',
  mealTypes: ['lunch'],
  priceLevel: 1,
  flavors: ['清淡'],
  scenes: ['homeCooking'],
}

describe('自定义食物', () => {
  it('nextCustomId 生成负 id 且不冲突', () => {
    expect(nextCustomId([])).toBe(-1)
    expect(nextCustomId([{ id: -1 } as CustomFood, { id: -3 } as CustomFood])).toBe(-4)
  })

  it('draftToCustomFood 由草稿构造并默认启用', () => {
    const food = draftToCustomFood(baseDraft, -1)
    expect(food.id).toBe(-1)
    expect(food.name).toBe('家常豆腐')
    expect(food.enabled).toBe(true)
    expect(food.tags).toEqual([])
  })

  it('upsertCustomFood 新增与更新', () => {
    const food = draftToCustomFood(baseDraft, -1)
    expect(upsertCustomFood([], food)).toHaveLength(1)
    const updated = { ...food, name: '红烧豆腐' }
    const list = upsertCustomFood([food], updated)
    expect(list).toHaveLength(1)
    expect(list[0].name).toBe('红烧豆腐')
  })

  it('deleteCustomFood 删除', () => {
    const food = draftToCustomFood(baseDraft, -1)
    expect(deleteCustomFood([food], -1)).toEqual([])
  })

  it('toggleCustomEnabled 切换启用状态', () => {
    const food = draftToCustomFood(baseDraft, -1)
    const toggled = toggleCustomEnabled([food], -1)
    expect(toggled[0].enabled).toBe(false)
    expect(toggleCustomEnabled(toggled, -1)[0].enabled).toBe(true)
  })
})
