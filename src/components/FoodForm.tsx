import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Check, X } from 'lucide-react'
import {
  FLAVOR_OPTIONS,
  FOOD_CATEGORIES,
  MEAL_TYPE_OPTIONS,
  PRICE_LEVEL_OPTIONS,
  SCENE_OPTIONS,
} from '../lib/options'
import type {
  Flavor,
  FoodDraft,
  MealType,
  PriceLevel,
  Scene,
} from '../types/food'

interface FoodFormProps {
  /** 编辑时的初始值；新增时传 null */
  initial?: FoodDraft | null
  submitLabel?: string
  onSubmit: (draft: FoodDraft) => void
  onCancel: () => void
}

/** 默认草稿 */
function emptyDraft(): FoodDraft {
  return {
    name: '',
    category: '中式家常菜',
    description: '',
    mealTypes: ['lunch'],
    priceLevel: 2,
    flavors: [],
    scenes: ['eatOut'],
  }
}

/** 自定义食物的新增 / 编辑表单（含校验与错误提示） */
export function FoodForm({
  initial,
  submitLabel = '保存',
  onSubmit,
  onCancel,
}: FoodFormProps) {
  const [draft, setDraft] = useState<FoodDraft>(() => initial ?? emptyDraft())
  const [errors, setErrors] = useState<{ name?: string; mealTypes?: string }>({})

  const toggleIn = <T,>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((x) => x !== value) : [...list, value]

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const nextErrors: typeof errors = {}
    if (draft.name.trim() === '') {
      nextErrors.name = '请填写食物名称'
    }
    if (draft.mealTypes.length === 0) {
      nextErrors.mealTypes = '请至少选择一个用餐时段'
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    onSubmit({ ...draft, name: draft.name.trim() })
  }

  const fieldError = (msg?: string) =>
    msg ? <p className="mt-1 text-xs text-red-500">{msg}</p> : null

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* 名称 */}
      <Field label="食物名称" required error={errors.name}>
        <input
          type="text"
          value={draft.name}
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          placeholder="例如：奶奶牌红烧排骨"
          maxLength={30}
          className={`w-full rounded-2xl border bg-white px-4 py-2.5 text-sm text-stone-700 outline-none transition-colors placeholder:text-stone-300 focus:border-orange-warm-400 dark:bg-stone-800 dark:text-stone-200 dark:placeholder:text-stone-500 ${
            errors.name
              ? 'border-red-300 dark:border-red-500/60'
              : 'border-orange-warm-100 dark:border-stone-700'
          }`}
        />
        {fieldError(errors.name)}
      </Field>

      {/* 分类 */}
      <Field label="分类">
        <select
          value={draft.category}
          onChange={(e) =>
            setDraft((d) => ({
              ...d,
              category: e.target.value as FoodDraft['category'],
            }))
          }
          className="w-full rounded-2xl border border-orange-warm-100 bg-white px-4 py-2.5 text-sm text-stone-700 outline-none transition-colors focus:border-orange-warm-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
        >
          {FOOD_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Field>

      {/* 用餐时段 */}
      <Field label="用餐时段" required error={errors.mealTypes}>
        <div className="flex flex-wrap gap-1.5">
          {MEAL_TYPE_OPTIONS.map((opt) => (
            <ChipToggle
              key={opt.value}
              label={opt.label}
              active={draft.mealTypes.includes(opt.value)}
              onClick={() =>
                setDraft((d) => ({
                  ...d,
                  mealTypes: toggleIn<MealType>(d.mealTypes, opt.value),
                }))
              }
            />
          ))}
        </div>
        {fieldError(errors.mealTypes)}
      </Field>

      {/* 价格档位 */}
      <Field label="价格档位">
        <div className="flex flex-wrap gap-1.5">
          {PRICE_LEVEL_OPTIONS.map((opt) => (
            <ChipToggle
              key={opt.value}
              label={opt.label}
              active={draft.priceLevel === opt.value}
              onClick={() =>
                setDraft((d) => ({ ...d, priceLevel: opt.value as PriceLevel }))
              }
            />
          ))}
        </div>
      </Field>

      {/* 口味 */}
      <Field label="口味（可多选）">
        <div className="flex flex-wrap gap-1.5">
          {FLAVOR_OPTIONS.map((flavor) => (
            <ChipToggle
              key={flavor}
              label={flavor}
              active={draft.flavors.includes(flavor)}
              onClick={() =>
                setDraft((d) => ({
                  ...d,
                  flavors: toggleIn<Flavor>(d.flavors, flavor),
                }))
              }
            />
          ))}
        </div>
      </Field>

      {/* 用餐形式 */}
      <Field label="用餐形式（可多选）">
        <div className="flex flex-wrap gap-1.5">
          {SCENE_OPTIONS.map((opt) => (
            <ChipToggle
              key={opt.value}
              label={opt.label}
              active={draft.scenes.includes(opt.value)}
              onClick={() =>
                setDraft((d) => ({
                  ...d,
                  scenes: toggleIn<Scene>(d.scenes, opt.value),
                }))
              }
            />
          ))}
        </div>
      </Field>

      {/* 简介 */}
      <Field label="食物简介（可选）">
        <textarea
          value={draft.description}
          onChange={(e) =>
            setDraft((d) => ({ ...d, description: e.target.value }))
          }
          placeholder="一句话描述这道菜的味道或记忆点……"
          rows={2}
          maxLength={80}
          className="w-full resize-none rounded-2xl border border-orange-warm-100 bg-white px-4 py-2.5 text-sm text-stone-700 outline-none transition-colors placeholder:text-stone-300 focus:border-orange-warm-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:placeholder:text-stone-500"
        />
      </Field>

      {/* 操作按钮 */}
      <div className="mt-1 flex items-center gap-3">
        <button
          type="submit"
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-orange-warm-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-warm-500/30 transition-all hover:bg-orange-warm-600 active:scale-95"
        >
          <Check className="h-4 w-4" />
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-4 py-2.5 text-sm font-medium text-stone-500 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
        >
          <X className="h-4 w-4" />
          取消
        </button>
      </div>
    </form>
  )
}

/** 带标签的表单项 */
function Field({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-stone-400 dark:text-stone-500">
        {label}
        {required && <span className="ml-0.5 text-red-400">*</span>}
        {error && <span className="ml-2 text-red-500">{error}</span>}
      </label>
      {children}
    </div>
  )
}

/** 圆角选项 chip */
function ChipToggle({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
        active
          ? 'bg-orange-warm-500 text-white shadow-sm shadow-orange-warm-500/30'
          : 'bg-orange-warm-50 text-stone-500 hover:bg-orange-warm-100 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-stone-200'
      }`}
    >
      {label}
    </button>
  )
}
