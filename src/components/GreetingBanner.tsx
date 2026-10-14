import { CalendarDays, Sparkles } from 'lucide-react'
import type { DateInfo } from '../lib/datetime'

interface GreetingBannerProps {
  dateInfo: DateInfo
  /** 随机欢迎语 */
  welcomeText: string
}

/** 欢迎语 + 日期 + 用餐时段问候 */
export function GreetingBanner({ dateInfo, welcomeText }: GreetingBannerProps) {
  return (
    <section className="mt-4 flex flex-col items-center gap-2.5 px-4 text-center">
      <p className="inline-flex items-center gap-1.5 rounded-full bg-orange-warm-100 px-4 py-1.5 text-sm font-medium text-orange-warm-700 dark:bg-orange-warm-500/20 dark:text-orange-warm-300 sm:text-base">
        <Sparkles className="h-4 w-4 animate-wiggle text-orange-warm-500" />
        {welcomeText}
      </p>
      <p className="flex items-center gap-1.5 text-sm text-stone-400 dark:text-stone-500 sm:text-[15px]">
        <CalendarDays className="h-4 w-4" />
        <span>
          {dateInfo.dateText} · {dateInfo.weekdayText}
        </span>
      </p>
      <p className="text-base font-medium text-stone-500 dark:text-stone-300 sm:text-lg">
        {dateInfo.greetingText}
      </p>
    </section>
  )
}
