#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""用 wiki 原版文案替换 genshinFoods.ts 里的合成 description。

匹配策略：按 name 精确匹配 → 去除标点/空格后模糊匹配 → 未命中则保留原 description。
"""
import re, json, os

PROJECT = os.path.dirname(os.path.abspath(__file__))
TS = os.path.join(PROJECT, 'src', 'data', 'genshinFoods.ts')
WIKI = os.path.join(PROJECT, 'genshin_wiki.json')

def norm(s):
    return re.sub(r'[\s！!？?。，、·・「」『』（）()\-…—]+', '', s or '')

def esc(s):
    if s is None:
        return ''
    return s.replace('\\', '\\\\').replace("'", "\\'")

# 翻译/前缀差异的显式映射（xlsx 名 -> wiki 名）
MANUAL = {
    '清新花饼': '清心花饼',
    '肉酱干层面': '肉酱千层面',
    '奇魂之汤': '奇瑰之汤',
    '嘭嘭冰激凌': '膨膨冰淇淋',
    '海灯节特色烤吃虎鱼': '烤吃虎鱼',
    '摇滚团子牛奶': '团子牛奶',
    '如同焦炭的蘑幻之菇': '蘑幻之菇',
    '雾淞秋分': '雾凇秋分',
}

wiki = json.load(open(WIKI, encoding='utf-8'))
wiki_norm = {norm(k): k for k in wiki}

ts = open(TS, encoding='utf-8').read()

# split into per-food blocks: name: '...', category: '原神美食', description: '...'
pattern = re.compile(
    r"name: '([^']*)',\n(\s*)category: '原神美食',\n(\s*)description: '[^']*',",
    re.S,
)

stats = {'exact': 0, 'fuzzy': 0, 'missing': []}

def repl(m):
    name = m.group(1)
    ind1 = m.group(2)
    ind2 = m.group(3)
    desc = None
    if name in MANUAL:
        target = MANUAL[name]
        if target in wiki and wiki[target].get('desc'):
            desc = wiki[target]['desc']
            stats['fuzzy'] += 1
    elif name in wiki and wiki[name].get('desc'):
        desc = wiki[name]['desc']
        stats['exact'] += 1
    else:
        n = norm(name)
        if n in wiki_norm and wiki[wiki_norm[n]].get('desc'):
            desc = wiki[wiki_norm[n]]['desc']
            stats['fuzzy'] += 1
        else:
            stats['missing'].append(name)
            return m.group(0)  # keep original
    return f"name: '{esc(name)}',\n{ind1}category: '原神美食',\n{ind2}description: '{esc(desc)}',"

new_ts, nsub = pattern.subn(repl, ts)
open(TS, 'w', encoding='utf-8').write(new_ts)

print(f"wiki entries: {len(wiki)}")
print(f"exact matched: {stats['exact']}")
print(f"fuzzy matched: {stats['fuzzy']}")
print(f"missing: {len(stats['missing'])}")
for m in stats['missing']:
    print("   MISSING:", m)
print(f"blocks replaced: {nsub}")
