import { useCallback, useEffect, useState } from 'react'

/** 主题偏好：跟随系统 / 浅色 / 深色 */
export type ThemePreference = 'system' | 'light' | 'dark'

/** 实际生效主题 */
export type ResolvedTheme = 'light' | 'dark'

/** 主题偏好存储键 */
export const THEME_STORAGE_KEY = 'what-to-eat:theme'

const QUERY = '(prefers-color-scheme: dark)'

/** 读取系统当前是否为深色 */
function systemPrefersDark(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia(QUERY).matches
}

/**
 * 纯函数：由偏好 + 系统是否深色，得出最终生效主题。
 * 便于单元测试。
 */
export function resolveTheme(
  pref: ThemePreference,
  systemIsDark: boolean,
): ResolvedTheme {
  if (pref === 'system') return systemIsDark ? 'dark' : 'light'
  return pref
}

/** 从 localStorage 读取主题偏好（容错） */
export function readThemePreference(): ThemePreference {
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (raw === 'light' || raw === 'dark' || raw === 'system') return raw
  } catch {
    /* 忽略，回退默认 */
  }
  return 'system'
}

/** 持久化主题偏好（失败静默） */
export function writeThemePreference(pref: ThemePreference): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, pref)
  } catch {
    /* 忽略 */
  }
}

/**
 * 主题管理 Hook：
 * - 默认跟随系统主题；
 * - 用户可手动选择浅色 / 深色 / 跟随系统；
 * - 选择持久化到 localStorage；
 * - 通过 <html> 上的 .dark 类驱动 Tailwind 暗色变体。
 */
export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(() => {
    if (typeof window === 'undefined') return 'system'
    return readThemePreference()
  })

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() =>
    systemPrefersDark(),
  )

  /** 订阅系统主题变化（事件驱动，非同步 setState） */
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const query = window.matchMedia(QUERY)
    const listener = (e: MediaQueryListEvent) => setSystemIsDark(e.matches)
    query.addEventListener('change', listener)
    return () => query.removeEventListener('change', listener)
  }, [])

  /** 最终主题在渲染期间推导（无额外 state、无 effect 内 setState） */
  const resolved = resolveTheme(preference, systemIsDark)

  /** 同步 .dark 类到 <html>（外部系统副作用） */
  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolved === 'dark')
  }, [resolved])

  const setTheme = useCallback((pref: ThemePreference) => {
    setPreference(pref)
    writeThemePreference(pref)
  }, [])

  /** 循环切换：系统 → 浅色 → 深色 */
  const cycleTheme = useCallback(() => {
    const order: ThemePreference[] = ['system', 'light', 'dark']
    const next = order[(order.indexOf(preference) + 1) % order.length]
    setTheme(next)
  }, [preference, setTheme])

  return { preference, resolved, setTheme, cycleTheme }
}
