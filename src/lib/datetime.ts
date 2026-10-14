/**
 * 与日期、用餐时段相关的工具函数。
 */

export type TimeSlot = 'morning' | 'noon' | 'afternoon' | 'evening' | 'night'

export interface DateInfo {
  /** 例如：2026年10月14日 */
  dateText: string
  /** 例如：星期三 */
  weekdayText: string
  /** 用餐时段问候语 */
  greetingText: string
  /** 当前时段标识 */
  slot: TimeSlot
}

/** 获取问候语与日期信息 */
export function getDateInfo(now: Date = new Date()): DateInfo {
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  const dateText = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`
  const weekdayText = `星期${weekdays[now.getDay()]}`

  const hour = now.getHours()
  let slot: TimeSlot
  let greetingText: string

  if (hour < 5) {
    slot = 'night'
    greetingText = '夜深了，来点夜宵怎么样？'
  } else if (hour < 9) {
    slot = 'morning'
    greetingText = '早上好，美好的一天从早餐开始'
  } else if (hour < 11) {
    slot = 'morning'
    greetingText = '上午好，琢磨一下中午吃什么吧'
  } else if (hour < 14) {
    slot = 'noon'
    greetingText = '中午好，正是干饭的好时候'
  } else if (hour < 17) {
    slot = 'afternoon'
    greetingText = '下午好，来份下午茶犒劳自己'
  } else if (hour < 21) {
    slot = 'evening'
    greetingText = '晚上好，晚饭想好吃什么了吗'
  } else {
    slot = 'night'
    greetingText = '晚安前，要不要再来一顿？'
  }

  return { dateText, weekdayText, greetingText, slot }
}

/** 把时间戳格式化为相对时间描述（如「刚刚」「5 分钟前」「昨天」） */
export function formatRelativeTime(timestamp: number, now: number = Date.now()): string {
  const diff = now - timestamp
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`
  if (diff < 2 * day) return '昨天'
  if (diff < 7 * day) return `${Math.floor(diff / day)} 天前`

  const d = new Date(timestamp)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}
