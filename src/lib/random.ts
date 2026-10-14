import type { Food } from '../types/food'

/**
 * 从候选池中随机挑选一种美食（推荐算法核心）。
 *
 * 规则：
 * 1. 使用 crypto.getRandomValues 生成无偏随机，不允许固定顺序循环；
 * 2. 优先避免重复"最近抽取过的"食物（history 越靠前越近）；
 * 3. 当所有候选都已抽过时，允许重新开始（从全部候选中随机）；
 * 4. 候选数量大于 1 时，绝不与上一次（history[0]）连续重复；
 * 5. 候选池为空时返回 null，由调用方展示友好提示；
 * 6. 纯函数实现，不触碰 DOM、不产生副作用。
 *
 * @param candidates 候选美食数组（已由 filterFoods 按条件过滤）
 * @param history    最近抽取过的食物 id 列表，[0] 为最近一次
 * @returns 随机选中的美食；候选池为空时返回 null
 */
export function pickRandomFood(
  candidates: Food[],
  history: readonly number[] = [],
): Food | null {
  if (candidates.length === 0) return null

  const seen = new Set(history)
  let pool = candidates

  // 优先从"最近没抽过"的候选中挑选
  const fresh = candidates.filter((food) => !seen.has(food.id))
  if (fresh.length > 0) {
    pool = fresh
  }
  // fresh 为空 = 所有候选都已抽过 → 允许重新开始，使用全部候选

  // 候选数大于 1 时，避免与最近一次连续重复
  const lastId = history[0]
  if (pool.length > 1 && lastId !== undefined) {
    const withoutLast = pool.filter((food) => food.id !== lastId)
    if (withoutLast.length > 0) {
      pool = withoutLast
    }
  }

  return pool[secureRandomInt(pool.length)]
}

/**
 * 抽取后更新历史的纯辅助函数：
 * - 若本次结果已在历史中（说明发生了"重新开始"），历史重置为仅含本次结果；
 * - 否则前插并截断到指定窗口长度。
 */
export function updateHistory(
  history: readonly number[],
  pickedId: number,
  limit: number,
): number[] {
  return history.includes(pickedId)
    ? [pickedId]
    : [pickedId, ...history].slice(0, limit)
}

/**
 * 使用 crypto.getRandomValues 生成 [0, max) 的无偏随机整数，
 * 不可用时回退到 Math.random。
 */
function secureRandomInt(maxExclusive: number): number {
  if (maxExclusive <= 0) return 0

  const cryptoObj: Crypto | undefined =
    typeof globalThis !== 'undefined' ? globalThis.crypto : undefined

  if (cryptoObj?.getRandomValues) {
    // 拒绝采样，消除模偏差
    const limit = Math.floor(0xffffffff / maxExclusive) * maxExclusive
    const buf = new Uint32Array(1)
    let value = 0
    do {
      cryptoObj.getRandomValues(buf)
      value = buf[0]
    } while (value >= limit)
    return value % maxExclusive
  }

  return Math.floor(Math.random() * maxExclusive)
}

/**
 * 从任意数组中随机取一个元素（用于欢迎语、动画轮播等场景）。
 */
export function pickRandomItem<T>(items: readonly T[]): T | null {
  if (items.length === 0) return null
  return items[secureRandomInt(items.length)]
}

/**
 * 生成打乱顺序的浅拷贝数组（Fisher–Yates 洗牌）。
 */
export function shuffle<T>(items: readonly T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
