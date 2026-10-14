import { describe, expect, it } from 'vitest'
import { computePool } from '../src/lib/pool'
import type { CustomFood, Food } from '../src/types/food'

function makeFood(id: number, name: string): Food {
  return {
    id,
    name,
    category: '快餐',
    description: '',
    mealTypes: ['lunch'],
    priceLevel: 1,
    flavors: ['咸鲜'],
    tags: [],
    scenes: ['eatOut'],
  }
}

const foods: Food[] = [makeFood(1, 'A'), makeFood(2, 'B'), makeFood(3, 'C')]

function makeCustom(id: number, name: string, enabled = true): CustomFood {
  return { ...makeFood(id, name), enabled }
}

describe('computePool 候选池计算', () => {
  it('默认返回全部内置 + 启用的自定义', () => {
    const custom = [makeCustom(-1, '自制'), makeCustom(-2, '禁用', false)]
    const pool = computePool(foods, custom, [], [], false)
    expect(pool.map((f) => f.id)).toEqual([1, 2, 3, -1])
  })

  it('排除清单中的食物被剔除', () => {
    const pool = computePool(foods, [], [], [2], false)
    expect(pool.map((f) => f.id)).toEqual([1, 3])
  })

  it('禁用与排除的自定义均被剔除', () => {
    const custom = [makeCustom(-1, 'a'), makeCustom(-2, 'b', false)]
    const pool = computePool(foods, custom, [], [-1], false)
    expect(pool.map((f) => f.id)).toEqual([1, 2, 3])
  })

  it('仅从收藏抽取时只保留已收藏', () => {
    const pool = computePool(foods, [], [1, 3], [], true)
    expect(pool.map((f) => f.id)).toEqual([1, 3])
  })

  it('收藏 + 排除同时生效', () => {
    const pool = computePool(foods, [], [1, 2, 3], [2], true)
    expect(pool.map((f) => f.id)).toEqual([1, 3])
  })

  it('收藏空且仅从收藏 → 空池', () => {
    expect(computePool(foods, [], [], [], true)).toEqual([])
  })
})
