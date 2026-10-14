import { shuffle } from './random'

/**
 * 转盘纯函数：负责「候选展示策略」与「目标旋转角计算」，
 * 确保动画终点与最终结果严格一致。
 */

/** 转盘最多展示的扇区数（超过则随机抽样展示，保证可读性） */
export const MAX_WHEEL_SEGMENTS = 12

/**
 * 计算扇区数对应的单个扇区圆心角（度）。
 */
export function segmentAngle(count: number): number {
  if (count <= 0) return 0
  return 360 / count
}

/**
 * 候选展示策略：
 * - 候选数不超过上限时，原样返回（保持稳定顺序，不额外打乱）；
 * - 候选过多时，随机抽样 `max` 个用于展示。
 *
 * 由于最终结果只从「展示出来的扇区」中抽取，因此指针落点
 * 必然与公告结果一致，不会出现"转盘指向 A 却宣布 B"的割裂。
 */
export function buildWheelSegments<T>(items: readonly T[], max: number): T[] {
  if (items.length === 0) return []
  if (items.length <= max) return [...items]
  return shuffle(items).slice(0, max)
}

/**
 * 计算使第 `winnerIndex` 个扇区中心对准顶部指针的目标旋转角（度）。
 *
 * 约定：角度从 12 点方向顺时针计量；CSS 正向旋转为顺时针。
 * 扇区 i 的中心角 = i*seg + seg/2，需旋转 θ 使该点回到 0°（顶部），
 * 即 θ ≡ -center (mod 360)。
 *
 * @param winnerIndex 结果在扇区数组中的下标（0 起）
 * @param count       扇区总数
 * @param jitterRatio 落点抖动比例（0~0.5，0 表示精确落在中心）
 * @returns [0, 360) 内的目标旋转角
 */
export function computeTargetRotation(
  winnerIndex: number,
  count: number,
  jitterRatio = 0.35,
): number {
  if (count <= 0) return 0
  const seg = segmentAngle(count)
  const idx = Math.max(0, Math.min(winnerIndex, count - 1))
  const center = idx * seg + seg / 2

  // 在扇区内部做小幅抖动，让落点更自然，但绝不越出该扇区
  const clamped = Math.max(0, Math.min(jitterRatio, 0.5))
  const jitter = (Math.random() * 2 - 1) * seg * clamped

  const raw = 360 - (center + jitter)
  return ((raw % 360) + 360) % 360
}

/**
 * 计算一次完整旋转的累计角度：
 * 在目标角基础上叠加若干整圈，保证转盘向前多转几圈、减速自然。
 *
 * @param currentRotation 当前累计旋转角（度）
 * @param target          目标旋转角（[0,360)）
 * @param turns           额外完整圈数
 */
export function nextRotation(
  currentRotation: number,
  target: number,
  turns = 6,
): number {
  const base = Math.floor(currentRotation / 360)
  return (base + turns) * 360 + target
}
