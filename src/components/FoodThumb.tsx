import { useState } from 'react'

interface FoodThumbProps {
  src?: string
  name: string
  /** 边长（px） */
  size?: number
  className?: string
  rounded?: boolean
}

/**
 * 食物缩略图：优先展示图片（如原神联动图标的 URL），
 * 加载失败时静默回退为不渲染，避免破图占位。
 */
export function FoodThumb({ src, name, size = 80, className = '', rounded = true }: FoodThumbProps) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) return null

  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`shrink-0 border border-orange-warm-100 bg-orange-warm-50 object-cover dark:border-stone-800 dark:bg-stone-800 ${
        rounded ? 'rounded-2xl' : 'rounded-xl'
      } ${className}`}
      style={{ width: size, height: size }}
    />
  )
}
