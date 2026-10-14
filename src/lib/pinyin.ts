import { pinyin } from 'pinyin-pro'

/**
 * 取名字的首字母（用于图鉴 A-Z 分组）。
 * - 中文按拼音首字母（如「野菇鸡肉串」→ Y）；
 * - 英文字母开头取大写字母；
 * - 数字/符号等无法归类时返回 '#'。
 */
export function getPinyinInitial(name: string): string {
  if (!name) return '#'
  const first = pinyin(name, {
    pattern: 'first',
    toneType: 'none',
    type: 'array',
  })[0]
  const c = (first ?? '').trim().charAt(0).toUpperCase()
  return /[A-Z]/.test(c) ? c : '#'
}
