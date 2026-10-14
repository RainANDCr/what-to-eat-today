import { describe, expect, it } from 'vitest'
import { pickRandomFood, updateHistory } from '../src/lib/random'
import { foods } from '../src/data/foods'

describe('pickRandomFood 随机抽取', () => {
  it('空候选池返回 null', () => {
    expect(pickRandomFood([], [])).toBeNull()
  })

  it('单条候选正常返回', () => {
    const single = [foods[0]]
    expect(pickRandomFood(single, [])?.id).toBe(foods[0].id)
  })

  it('单条候选即使与上次相同也返回它', () => {
    const single = [foods[0]]
    expect(pickRandomFood(single, [foods[0].id])?.id).toBe(foods[0].id)
  })

  it('候选数 > 1 时不与最近一次连续重复', () => {
    const pool = foods.slice(0, 5)
    let history: number[] = []
    let prev: number | null = null
    for (let i = 0; i < 200; i++) {
      const pick = pickRandomFood(pool, history)
      expect(pick).not.toBeNull()
      if (prev !== null) {
        expect(pick!.id).not.toBe(prev)
      }
      history = updateHistory(history, pick!.id, 12)
      prev = pick!.id
    }
  })

  it('优先抽取最近未抽过的候选', () => {
    const pool = foods.slice(0, 3)
    const drawn = pool.slice(0, 2).map((f) => f.id)
    const pick = pickRandomFood(pool, drawn)
    expect(pick).not.toBeNull()
    expect(drawn).not.toContain(pick!.id)
  })

  it('全部候选已抽过时允许重新开始', () => {
    const pool = foods.slice(0, 2)
    const history = pool.map((f) => f.id)
    const pick = pickRandomFood(pool, history)
    expect(pick).not.toBeNull()
    expect(pool.map((f) => f.id)).toContain(pick!.id)
    // 仍不与最近一次连续重复
    expect(pick!.id).not.toBe(history[0])
  })

  it('大候选池下结果稳定非空', () => {
    for (let i = 0; i < 50; i++) {
      const pick = pickRandomFood(foods, [])
      expect(pick).not.toBeNull()
      expect(typeof pick!.id).toBe('number')
    }
  })
})

describe('updateHistory 历史更新', () => {
  it('前插并截断到上限', () => {
    const history: number[] = [1, 2, 3]
    expect(updateHistory(history, 9, 3)).toEqual([9, 1, 2])
  })

  it('已存在时重置为仅含本次', () => {
    expect(updateHistory([1, 2, 3], 2, 12)).toEqual([2])
  })

  it('不会修改原数组', () => {
    const history: number[] = [1, 2]
    updateHistory(history, 3, 12)
    expect(history).toEqual([1, 2])
  })
})
