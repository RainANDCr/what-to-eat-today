import { describe, expect, it } from 'vitest'
import {
  THEME_STORAGE_KEY,
  readThemePreference,
  resolveTheme,
} from '../src/hooks/useTheme'

describe('resolveTheme 纯函数', () => {
  it('跟随系统时映射系统主题', () => {
    expect(resolveTheme('system', true)).toBe('dark')
    expect(resolveTheme('system', false)).toBe('light')
  })

  it('手动选择时不依赖系统', () => {
    expect(resolveTheme('light', true)).toBe('light')
    expect(resolveTheme('dark', false)).toBe('dark')
  })
})

describe('readThemePreference 容错', () => {
  it('无 localStorage 环境（node）下回退为 system', () => {
    // node 环境中 window 未定义，读取应安全回退
    expect(readThemePreference()).toBe('system')
  })

  it('主题存储键与 index.html 防闪烁脚本一致', () => {
    // 该键用于首屏脚本与 Hook 之间的约定
    expect(THEME_STORAGE_KEY).toBe('what-to-eat:theme')
  })
})
