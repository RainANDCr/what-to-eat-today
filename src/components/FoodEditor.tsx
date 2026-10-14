import { FoodForm } from './FoodForm'
import { useFoodStore } from '../hooks/useFoodStore'
import type { CustomFood, FoodDraft } from '../types/food'

interface FoodEditorProps {
  /** 编辑的目标食物；新增时传 null */
  food?: CustomFood | null
  /** 关闭编辑器 */
  onClose: () => void
}

function toDraft(food: CustomFood): FoodDraft {
  return {
    name: food.name,
    category: food.category,
    description: food.description,
    mealTypes: food.mealTypes,
    priceLevel: food.priceLevel,
    flavors: food.flavors,
    scenes: food.scenes,
  }
}

/** 自定义食物编辑器：负责新增 / 编辑与 store 写入 */
export function FoodEditor({ food, onClose }: FoodEditorProps) {
  const { addCustomFood, updateCustomFood } = useFoodStore()

  const handleSubmit = (draft: FoodDraft) => {
    if (food) {
      updateCustomFood(food.id, draft)
    } else {
      addCustomFood(draft)
    }
    onClose()
  }

  return (
    <FoodForm
      initial={food ? toDraft(food) : null}
      submitLabel={food ? '保存修改' : '添加食物'}
      onSubmit={handleSubmit}
      onCancel={onClose}
    />
  )
}
