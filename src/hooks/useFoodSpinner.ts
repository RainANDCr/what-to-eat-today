import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { pickRandomFood, pickRandomItem, shuffle } from '../lib/random'
import type { Food } from '../types/food'

/** 抽取动画时长（毫秒） */
export const SPIN_DURATION_MS = 1100

export type SpinPhase = 'idle' | 'spinning' | 'done'

/**
 * 核心随机推荐 Hook：
 * - 接受外部传入的候选池（已应用筛选、排除与收藏过滤）；
 * - 基于传入的 recentIds（来自持久化历史）优先避免重复；
 * - 抽取成功后通过 onPicked 回调记录历史；
 * - 动画期间禁用重复提交（isSpinning 守卫 + phase 守卫）；
 * - 支持 prefers-reduced-motion：直接出结果。
 */
export function useFoodSpinner(
  pool: Food[],
  recentIds: readonly number[],
  onPicked: (food: Food) => void,
) {
  const [phase, setPhase] = useState<SpinPhase>('idle')
  /** 动画期间轮播显示的名称 */
  const [rollingName, setRollingName] = useState<string>('')
  /** 最终落定的结果 */
  const [result, setResult] = useState<Food | null>(null)
  const timersRef = useRef<number[]>([])
  const reducedMotion = usePrefersReducedMotion()

  const poolRef = useRef(pool)
  const recentIdsRef = useRef(recentIds)
  const onPickedRef = useRef(onPicked)

  /** 同步最新候选池 / 历史 / 回调到 ref（供定时器与回调读取） */
  useEffect(() => {
    poolRef.current = pool
  }, [pool])

  useEffect(() => {
    recentIdsRef.current = recentIds
  }, [recentIds])

  useEffect(() => {
    onPickedRef.current = onPicked
  }, [onPicked])

  const isSpinning = phase === 'spinning'
  const isEmpty = pool.length === 0

  /** 清理所有挂起的定时器 */
  const clearTimers = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t))
    timersRef.current = []
  }, [])

  useEffect(() => clearTimers, [clearTimers])

  /** 动画期间从候选池随机轮播名称 */
  useEffect(() => {
    if (phase !== 'spinning') return

    const interval = window.setInterval(() => {
      const random = pickRandomItem(poolRef.current)
      if (random) setRollingName(random.name)
    }, 90)

    return () => window.clearInterval(interval)
  }, [phase])

  const spin = useCallback(() => {
    // 动画期间不得重复提交
    if (phase === 'spinning') return

    const candidates = poolRef.current
    const next = pickRandomFood(candidates, recentIdsRef.current)

    // 候选池为空：保持 idle，由 UI 显示友好提示
    if (!next) {
      setPhase('idle')
      return
    }

    // 记录成功抽取（在落定前记录，避免动画被打断导致历史丢失）
    onPickedRef.current(next)

    if (reducedMotion) {
      // 用户偏好减少动画：立即展示结果
      setResult(next)
      setPhase('done')
      return
    }

    setPhase('spinning')
    setResult(null)

    const timer = window.setTimeout(() => {
      setResult(next)
      setPhase('done')
    }, SPIN_DURATION_MS)

    timersRef.current.push(timer)
  }, [phase, reducedMotion])

  return {
    /** 当前最终结果（动画结束后） */
    result,
    /** 动画期间轮播的名称 */
    rollingName,
    /** 当前阶段 */
    phase,
    /** 是否正在抽取（用于禁用按钮与筛选面板） */
    isSpinning,
    /** 触发抽取 */
    spin,
    /** 当前候选池是否为空 */
    isEmpty,
  }
}

/**
 * 跟随系统"减少动态效果"偏好。
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const listener = (e: MediaQueryListEvent) => setReduced(e.matches)
    query.addEventListener('change', listener)
    return () => query.removeEventListener('change', listener)
  }, [])

  return reduced
}

/**
 * 随机欢迎语：每次挂载随机一条，可手动刷新。
 */
export function useRandomGreeting(pool: readonly string[]) {
  const [index, setIndex] = useState(() => {
    const shuffled = shuffle(pool)
    return shuffled.length > 0 ? pool.indexOf(shuffled[0]) : 0
  })

  const refresh = useCallback(() => {
    if (pool.length === 0) return
    setIndex((prev) => {
      let next = Math.floor(Math.random() * pool.length)
      if (next === prev && pool.length > 1) {
        next = (next + 1) % pool.length
      }
      return next
    })
  }, [pool])

  const text = useMemo(() => pool[index] ?? '', [pool, index])

  return { text, refresh }
}
