import { describe, expect, it } from 'vitest'
import { getFunCopy } from '../src/lib/copywriting'
import { foods } from '../src/data/foods'

describe('getFunCopy 趣味文案', () => {
  it('所有内置食物都能生成非空文案', () => {
    for (const food of foods) {
      expect(getFunCopy(food)).toBeTruthy()
    }
  })

  it('文案中不存在未替换的占位符', () => {
    for (const food of foods) {
      expect(getFunCopy(food)).not.toContain('{name}')
    }
  })

  it('文案包含食物名称', () => {
    const sample = foods.slice(0, 20)
    for (const food of sample) {
      expect(getFunCopy(food)).toContain(food.name)
    }
  })

  it('同一食物文案确定（无随机漂移）', () => {
    for (const food of foods.slice(0, 10)) {
      expect(getFunCopy(food)).toBe(getFunCopy(food))
    }
  })
})
