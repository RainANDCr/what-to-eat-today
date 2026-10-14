import { describe, expect, it } from 'vitest'
import {
  DEFAULT_FILTERS,
  describeFilters,
  filterFoods,
  matchesFilters,
} from '../src/lib/filters'
import { foods } from '../src/data/foods'

describe('filterFoods 筛选逻辑', () => {
  it('无启用条件时返回全部', () => {
    expect(filterFoods(foods, DEFAULT_FILTERS)).toHaveLength(foods.length)
  })

  it('单条件：早餐时段', () => {
    const result = filterFoods(foods, { ...DEFAULT_FILTERS, mealType: 'breakfast' })
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((f) => f.mealTypes.includes('breakfast'))).toBe(true)
  })

  it('单条件：经济预算', () => {
    const result = filterFoods(foods, { ...DEFAULT_FILTERS, priceLevel: 1 })
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((f) => f.priceLevel === 1)).toBe(true)
  })

  it('单条件：香辣口味（含麻辣、酸辣）', () => {
    const result = filterFoods(foods, { ...DEFAULT_FILTERS, flavor: '香辣' })
    expect(result.length).toBeGreaterThan(0)
    expect(
      result.every((f) =>
        f.flavors.some((x) => ['香辣', '麻辣', '酸辣'].includes(x)),
      ),
    ).toBe(true)
  })

  it('单条件：自己做饭', () => {
    const result = filterFoods(foods, { ...DEFAULT_FILTERS, scene: 'homeCooking' })
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((f) => f.scenes.includes('homeCooking'))).toBe(true)
  })

  it('多条件组合同时生效', () => {
    const result = filterFoods(foods, {
      mealType: 'breakfast',
      priceLevel: 1,
      flavor: '清淡',
      scene: 'homeCooking',
    })
    expect(result.length).toBeGreaterThan(0)
    expect(
      result.every(
        (f) =>
          f.mealTypes.includes('breakfast') &&
          f.priceLevel === 1 &&
          f.flavors.includes('清淡') &&
          f.scenes.includes('homeCooking'),
      ),
    ).toBe(true)
  })

  it('无匹配时返回空数组，不擅自放宽条件', () => {
    const result = filterFoods(foods, {
      mealType: 'night',
      priceLevel: 3,
      flavor: 'all',
      scene: 'homeCooking',
    })
    expect(result).toEqual([])
  })

  it('matchesFilters 判定结果是否过期', () => {
    const hotpot = foods.find((f) => f.name === '川渝火锅')!
    expect(matchesFilters(hotpot, DEFAULT_FILTERS)).toBe(true)
    expect(matchesFilters(hotpot, { ...DEFAULT_FILTERS, scene: 'homeCooking' })).toBe(false)
  })

  it('describeFilters 生成可读描述', () => {
    expect(describeFilters(DEFAULT_FILTERS)).toBe('当前条件')
    expect(
      describeFilters({ mealType: 'breakfast', priceLevel: 1, flavor: 'all', scene: 'all' }),
    ).toBe('早餐 + 经济')
  })
})
