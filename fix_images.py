#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""修复原神食物图片：抛弃 xlsx 内嵌图（锚点映射不可靠），
改用 wiki ld-item 中 name↔image 的权威对应关系。

- 从 genshin_wiki.json 取每条目官方图标 URL 并下载到 public/genshin/
- 按「精确 → MANUAL 映射 → 归一化」匹配食物名，重写 genshinFoods.ts 的 image 字段
- 删除旧的 image*.png
"""
import re, json, os, time, urllib.request

PROJECT = os.path.dirname(os.path.abspath(__file__))
TS = os.path.join(PROJECT, 'src', 'data', 'genshinFoods.ts')
WIKI = os.path.join(PROJECT, 'genshin_wiki.json')
IMG_DIR = os.path.join(PROJECT, 'public', 'genshin')

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36"}

def norm(s):
    return re.sub(r'[\s！!？?。，、·・「」『』（）()\-…—]+', '', s or '')

# xlsx 名 -> wiki 名（与 update_desc.py 一致）
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

def esc(s):
    return (s or '').replace('\\', '\\\\').replace("'", "\\'")

def download(url, dest, retries=4):
    if os.path.exists(dest) and os.path.getsize(dest) > 0:
        return True  # 已下载过（跨次运行缓存）
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=25) as r:
                data = r.read()
            tmp = dest + '.tmp'
            with open(tmp, 'wb') as f:
                f.write(data)
            os.replace(tmp, dest)
            time.sleep(0.04)
            return True
        except Exception as e:
            if attempt == retries - 1:
                print(f"  [download fail] {url}: {e}", flush=True)
                return False
            time.sleep(1.5 * (attempt + 1))

def main():
    wiki = json.load(open(WIKI, encoding='utf-8'))
    wiki_norm = {norm(k): k for k in wiki}

    ts = open(TS, encoding='utf-8').read()
    pattern = re.compile(
        r"name: '([^']*)',\n(\s*)category: '原神美食',\n(\s*)description: '[^']*',\n(\s*)image: (?:'[^']*'|undefined),"
    )

    stats = {'matched': 0, 'missing': []}

    def resolve_img(name):
        """xlsx 名 -> wiki 名（MANUAL → 精确 → 归一化）-> 下载官方图标"""
        wiki_name = MANUAL.get(name)
        if wiki_name is None:
            wiki_name = name if name in wiki else wiki_norm.get(norm(name))
        if wiki_name and wiki.get(wiki_name, {}).get('image'):
            info = wiki[wiki_name]
            url = info['image']
            ext = '.png' if '.png' in url else '.jpeg'
            fname = f"UI_ItemIcon_{info['id']}{ext}"
            dest = os.path.join(IMG_DIR, fname)
            if download(url, dest):
                return f"/genshin/{fname}"
        return None

    # 第一阶段：为每个食物名解析对应的本地图标（下载 + 缓存）
    blocks = re.findall(
        r"name: '([^']*)',\n\s*category: '原神美食',\n\s*description: '[^']*',\n\s*image: (?:'[^']*'|undefined),",
        ts,
    )
    name_to_local = {}
    for name in blocks:
        local = resolve_img(name)
        if local:
            name_to_local[name] = local
            stats['matched'] += 1
        else:
            stats['missing'].append(name)

    # 第二阶段：替换 image 字段
    def repl2(m):
        name = m.group(1)
        local = name_to_local.get(name)
        if not local:
            return m.group(0)
        return re.sub(r"image: (?:'[^']*'|undefined),", f"image: '{local}',", m.group(0))

    new_ts, nsub = pattern.subn(repl2, ts)
    open(TS, 'w', encoding='utf-8').write(new_ts)

    # 删除旧的 xlsx 提取图
    removed = 0
    for f in os.listdir(IMG_DIR):
        if re.match(r'image\d+\.(png|jpeg)$', f):
            os.remove(os.path.join(IMG_DIR, f))
            removed += 1

    print(f"wiki 条目: {len(wiki)}")
    print(f"食物总数: {len(blocks)}")
    print(f"图片匹配成功: {stats['matched']}（新下载 {sum(1 for _ in name_to_local)} 项映射）")
    print(f"未匹配: {len(stats['missing'])} -> {stats['missing']}")
    print(f"替换块数: {nsub}")
    print(f"删除旧图: {removed}")

if __name__ == '__main__':
    main()
