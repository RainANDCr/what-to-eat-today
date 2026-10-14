import { describe, expect, it } from 'vitest'
import {
  MAX_WHEEL_SEGMENTS,
  buildWheelSegments,
  computeTargetRotation,
  nextRotation,
  segmentAngle,
} from '../src/lib/wheel'

describe('buildWheelSegments 候选展示策略', () => {
  it('空数组返回空数组', () => {
    expect(buildWheelSegments([], MAX_WHEEL_SEGMENTS)).toEqual([])
  })

  it('候选数不超过上限时原样返回（浅拷贝，不改顺序）', () => {
    const items = ['a', 'b', 'c']
    const out = buildWheelSegments(items, MAX_WHEEL_SEGMENTS)
    expect(out).toEqual(['a', 'b', 'c'])
    expect(out).not.toBe(items)
  })

  it('候选过多时抽样到上限，且全部来自原候选、无重复', () => {
    const items = Array.from({ length: 50 }, (_, i) => i)
    const out = buildWheelSegments(items, MAX_WHEEL_SEGMENTS)
    expect(out).toHaveLength(MAX_WHEEL_SEGMENTS)
    expect(new Set(out).size).toBe(MAX_WHEEL_SEGMENTS)
    for (const v of out) {
      expect(items).toContain(v)
    }
  })
})

describe('segmentAngle 扇区圆心角', () => {
  it('n=4 时每个扇区 90 度', () => {
    expect(segmentAngle(4)).toBe(90)
  })
  it('n<=0 时返回 0', () => {
    expect(segmentAngle(0)).toBe(0)
  })
})

describe('computeTargetRotation 目标旋转角（动画与结果一致）', () => {
  it('jitter=0 时精确对准获胜扇区中心', () => {
    const n = 8
    const seg = segmentAngle(n)
    for (let i = 0; i < n; i++) {
      const rot = computeTargetRotation(i, n, 0)
      const center = i * seg + seg / 2
      // 旋转后该扇区中心应回到顶部（0°），即 (rot + center) ≡ 0 (mod 360)
      expect((rot + center) % 360).toBeCloseTo(0, 6)
    }
  })

  it('默认抖动仍落在获胜扇区内部', () => {
    const n = 12
    const seg = segmentAngle(n)
    for (let i = 0; i < n; i++) {
      const rot = computeTargetRotation(i, n, 0.35)
      // 落点（从顶部顺时针计） = (360 - rot) mod 360
      const landed = ((360 - rot) % 360 + 360) % 360
      expect(landed).toBeGreaterThanOrEqual(i * seg)
      expect(landed).toBeLessThan((i + 1) * seg)
    }
  })

  it('返回角度始终在 [0, 360) 内', () => {
    for (let n = 1; n <= 12; n++) {
      for (let i = 0; i < n; i++) {
        const rot = computeTargetRotation(i, n)
        expect(rot).toBeGreaterThanOrEqual(0)
        expect(rot).toBeLessThan(360)
      }
    }
  })
})

describe('nextRotation 累计旋转', () => {
  it('始终向前多转并落在目标角上', () => {
    const target = 120
    const first = nextRotation(0, target, 6)
    expect(first).toBeGreaterThanOrEqual(6 * 360 + target)
    expect(first % 360).toBe(target)

    const second = nextRotation(first, target, 6)
    expect(second).toBeGreaterThan(first)
    expect(second % 360).toBe(target)
  })
})
