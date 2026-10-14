import type { Food } from '../types/food'

/**
 * 趣味文案：基于本地模板生成，不调用任何 AI / 外部 API。
 *
 * 设计原则：
 * - 纯函数、确定性：同一食物永远得到同一条文案（按 id 稳定散列选模板）；
 * - 模板分为「通用」与「分类专属」两组，落点更有代入感；
 * - 所有模板都通过 {name} 占位符注入食物名，绝不留未替换的占位符。
 */

const GENERIC_TEMPLATES = [
  '就决定是你了——{name}，天选之菜！',
  '{name}：今日份的快乐，安排！',
  '命运的指针指向了「{name}」，别犹豫啦。',
  '闭眼点，{name} 不会让你失望。',
  '今天和 {name} 锁了，赶紧安排起来。',
  '{name} 正在向你招手，冲鸭！',
  '吃货雷达锁定：{name}，就它了。',
  '纠结了这么久，{name} 早已迫不及待。',
]

/** 分类专属文案（更贴合场景） */
const CATEGORY_TEMPLATES: Record<string, string[]> = {
  中式家常菜: [
    '家的味道——{name}，米饭都能多吃一碗。',
    '{name}，热气腾腾才是生活。',
  ],
  面食: [
    '嗦一口 {name}，快乐直接拉满。',
    '{name}：碳水带来的满足，无与伦比。',
  ],
  米饭与盖饭: [
    '干饭人集合，{name} 一碗管饱。',
    '{name}，浇在米饭上的幸福。',
  ],
  火锅与麻辣烫: [
    '咕嘟咕嘟，翻滚的不止是 {name}，还有快乐。',
    '无辣不欢？{name} 安排上！',
  ],
  小吃: [
    '边走边吃的快乐，{name} 给足你。',
    '来点 {name} 解解馋，刚刚好。',
  ],
  早餐: [
    '美好的一天，从 {name} 开始。',
    '{name}，把早晨叫醒的味道。',
  ],
  快餐: [
    '赶时间也要吃好，{name} 就是效率与美味的平衡。',
    '{name}，快速回血的不二之选。',
  ],
  地方特色: [
    '一口 {name}，带你神游千里之外。',
    '地道风味 {name}，值得为它出发。',
  ],
  素食: [
    '清爽不油腻，{name} 让肠胃放个假。',
    '{name}：轻负担，也很有滋味。',
  ],
  原神美食: [
    '{name}：提瓦特的美味，今天也要好好吃饭！',
    '冒险路上别忘了尝尝 {name}～',
  ],
}

/** 稳定散列：把食物 id 映射到 [0, n) */
function hashIndex(id: number, n: number): number {
  if (n <= 1) return 0
  const h = Math.abs(id) % 997
  return h % n
}

/**
 * 生成某道食物的趣味文案。
 * @param food 目标食物
 * @returns 一行简短有趣的中文文案
 */
export function getFunCopy(food: Food): string {
  const categoryPool = CATEGORY_TEMPLATES[food.category]
  // 有分类专属模板时，优先命中专属，再用通用兜底（混合池，稳定选一条）
  const pool = categoryPool ? [...categoryPool, ...GENERIC_TEMPLATES] : GENERIC_TEMPLATES

  const template = pool[hashIndex(food.id, pool.length)]
  return template.replaceAll('{name}', food.name)
}
