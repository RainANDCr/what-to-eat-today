import { describe, expect, it } from 'vitest'
import {
  HISTORY_MAX,
  STORAGE_KEY,
  defaultStoreState,
  loadStore,
  sanitizeStore,
  saveStore,
} from '../src/lib/storage'
import type { StorageLike } from '../src/lib/storage'

function createMockStorage() {
  const data = new Map<string, string>()
  const storage: StorageLike & { data: Map<string, string> } = {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value)
    },
    removeItem: (key) => {
      data.delete(key)
    },
  }
  return storage
}

describe('sanitizeStore 数据校验', () => {
  it('非对象输入回退为默认状态', () => {
    expect(sanitizeStore(null)).toEqual(defaultStoreState())
    expect(sanitizeStore(undefined)).toEqual(defaultStoreState())
    expect(sanitizeStore('bad')).toEqual(defaultStoreState())
    expect(sanitizeStore(42)).toEqual(defaultStoreState())
  })

  it('空对象回退为默认状态', () => {
    expect(sanitizeStore({})).toEqual(defaultStoreState())
  })

  it('非法 id 被过滤、重复 id 被去重', () => {
    const state = sanitizeStore({
      favorites: [1, 2, 'x', 2, 3, null, 1.5],
      exclusions: [10, 10, 'y'],
    })
    expect(state.favorites).toEqual([1, 2, 3])
    expect(state.exclusions).toEqual([10])
  })

  it('非法自定义食物被剔除、合法项被保留', () => {
    const state = sanitizeStore({
      customFoods: [
        null,
        { id: -1, name: ' ', category: '面食', mealTypes: ['lunch'] },
        {
          id: -2,
          name: '妈妈牌饺子',
          category: '面食',
          mealTypes: ['lunch', 'dinner'],
          priceLevel: 2,
          flavors: ['咸鲜'],
          scenes: ['homeCooking'],
          enabled: true,
        },
        { id: -3, name: '缺分类', category: '不存在', mealTypes: ['lunch'] },
      ],
    })
    expect(state.customFoods).toHaveLength(1)
    expect(state.customFoods[0].name).toBe('妈妈牌饺子')
    expect(state.customFoods[0].tags).toEqual([])
  })

  it('历史按时间倒序并截断到上限', () => {
    const history = Array.from({ length: HISTORY_MAX + 5 }, (_, i) => ({
      foodId: i + 1,
      timestamp: i,
    }))
    const state = sanitizeStore({ history })
    expect(state.history).toHaveLength(HISTORY_MAX)
    expect(state.history[0].timestamp).toBe(HISTORY_MAX + 4)
    // 倒序
    for (let i = 1; i < state.history.length; i++) {
      expect(state.history[i - 1].timestamp).toBeGreaterThan(state.history[i].timestamp)
    }
  })

  it('favoritesOnly 仅接受 true', () => {
    expect(sanitizeStore({ favoritesOnly: true }).favoritesOnly).toBe(true)
    expect(sanitizeStore({ favoritesOnly: 'yes' }).favoritesOnly).toBe(false)
  })
})

describe('loadStore / saveStore 读写', () => {
  it('JSON 解析失败时回退默认状态', () => {
    const storage = createMockStorage()
    storage.setItem(STORAGE_KEY, '{broken json')
    expect(loadStore(storage)).toEqual(defaultStoreState())
  })

  it('空存储返回默认状态', () => {
    expect(loadStore(createMockStorage())).toEqual(defaultStoreState())
  })

  it('保存后可正确读回', () => {
    const storage = createMockStorage()
    const state = {
      ...defaultStoreState(),
      favorites: [1, 5],
      favoritesOnly: true,
    }
    expect(saveStore(state, storage)).toBe(true)
    expect(loadStore(storage).favorites).toEqual([1, 5])
    expect(loadStore(storage).favoritesOnly).toBe(true)
  })

  it('无可用存储时 saveStore 返回 false 且不抛异常', () => {
    expect(saveStore(defaultStoreState(), undefined)).toBe(false)
  })
})
