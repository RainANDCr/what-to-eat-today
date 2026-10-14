import { describe, expect, it } from 'vitest'
import { getPinyinInitial } from '../src/lib/pinyin'

describe('getPinyinInitial 首字母分组', () => {
  it('中文取拼音首字母', () => {
    expect(getPinyinInitial('番茄炒蛋')).toBe('F')
    expect(getPinyinInitial('野菇鸡肉串')).toBe('Y')
    expect(getPinyinInitial('仙跳墙')).toBe('X')
    expect(getPinyinInitial('糖雕・凛角鹿')).toBe('T')
  })

  it('英文字母开头取大写首字母', () => {
    expect(getPinyinInitial('Apple Pie')).toBe('A')
    expect(getPinyinInitial('burger')).toBe('B')
  })

  it('数字 / 符号 / 空串归入 #', () => {
    expect(getPinyinInitial('5号餐')).toBe('#')
    expect(getPinyinInitial('・特殊')).toBe('#')
    expect(getPinyinInitial('')).toBe('#')
  })
})
