#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Extract Genshin foods (name + icon image + metadata) from the user-provided
xlsx workbook and generate src/data/genshinFoods.ts plus local image files.

The workbook has NO lore/description column, so descriptions are synthesized
from available metadata (star rating, effect type, specialty character,
recipe acquisition method).
"""
import zipfile, re, os, json
from collections import Counter
import openpyxl

SRC = r"C:\Users\Crain\Downloads\原神食谱.xlsx"
PROJECT = r"E:\workbuddyhuancun\嘉然今天吃什么"
IMG_DIR = os.path.join(PROJECT, "public", "genshin")
TS_OUT = os.path.join(PROJECT, "src", "data", "genshinFoods.ts")
os.makedirs(IMG_DIR, exist_ok=True)

z = zipfile.ZipFile(SRC)
wb = openpyxl.load_workbook(SRC, read_only=True, data_only=True)

# ---- resolve rId -> media file inside a drawing's rels ----
def rid_to_media(drawing_path):
    rels_path = drawing_path.replace('xl/drawings/', 'xl/drawings/_rels/') + '.rels'
    try:
        rels = z.read(rels_path).decode('utf-8')
    except KeyError:
        return {}
    return dict(re.findall(r'Id="([^"]+)"[^>]*Target="(media/[^"]+)"', rels))

# ---- parse anchor map: (col,row) -> rId for a drawing ----
def anchor_points(drawing_path):
    xml = z.read(drawing_path).decode('utf-8')
    anchors = re.split(r'</xdr:twoCellAnchor>|</xdr:oneCellAnchor>', xml)
    pts = {}  # (col,row) -> rId
    for a in anchors:
        if '<xdr:from>' not in a:
            continue
        frm = re.search(r'<xdr:from>(.*?)</xdr:from>', a, re.S)
        if not frm:
            continue
        col = re.search(r'<xdr:col>(\d+)</xdr:col>', frm.group(1))
        row = re.search(r'<xdr:row>(\d+)</xdr:row>', frm.group(1))
        emb = re.search(r'r:embed="([^"]+)"', a)
        if col and row and emb:
            pts[(int(col.group(1)), int(row.group(1)))] = emb.group(1)
    return pts

SHEETS = [
    ('食谱合集（无食材）', 'xl/drawings/drawing2.xml'),
    ('食谱合集（有食材）', 'xl/drawings/drawing3.xml'),
]

# Media cache: media filename -> public relative path (extract once)
media_cache = {}
def extract_media(rId, rid_map, drawing_path):
    if rId in media_cache:
        return media_cache[rId]
    rel = rid_map.get(rId)
    if not rel:
        media_cache[rId] = None
        return None
    media_name = os.path.basename(rel)
    full = 'xl/drawings/' + rel
    try:
        data = z.read(full)
    except KeyError:
        media_cache[rId] = None
        return None
    out_name = media_name  # keep original name+ext (png/jpeg)
    with open(os.path.join(IMG_DIR, out_name), 'wb') as f:
        f.write(data)
    rel_path = '/genshin/' + out_name
    media_cache[rId] = rel_path
    return rel_path

def col_index(header, name):
    try:
        return header.index(name)
    except ValueError:
        return None

def val(row, idx):
    if idx is None or idx >= len(row):
        return None
    v = row[idx]
    if v is None:
        return None
    return str(v).strip()

def synth_desc(star, effect, specialty_char, method):
    parts = []
    if star:
        parts.append(f"★{star}")
    if specialty_char:
        parts.append(f"{specialty_char}的特色料理")
    else:
        parts.append("原神料理")
    if effect:
        eff = effect.rstrip('类') if effect.endswith('类') else effect
        parts.append(f"{eff}类")
    d = " · ".join(parts)
    if method:
        m = method if len(method) <= 18 else method[:18] + "…"
        d += f" · 获取：{m}"
    return d

def parse_star(star):
    if not star:
        return None
    n = star.count('★')
    if n > 0:
        return n
    m = re.search(r'(\d+)', star)
    return int(m.group(1)) if m else None

def price_from_star(star):
    if star is None:
        return 2
    if star <= 2:
        return 1
    if star == 3:
        return 2
    return 3

def flavors_from(name, effect):
    text = (name or "") + (effect or "")
    if "辣" in text:
        return ["香辣"]
    if any(k in text for k in ["甜", "糖", "蜜", "糕", "布丁"]):
        return ["甜"]
    if "酸" in text:
        return ["酸甜"]
    return ["咸鲜"]

foods = []
seen_names = set()
running_id = 900000

for sheetname, drawing in SHEETS:
    ws = wb[sheetname]
    rid_map = rid_to_media(drawing)
    pts = anchor_points(drawing)
    header = None
    for row in ws.iter_rows(values_only=True):
        if any(c is not None for c in row):
            header = [str(c).strip() if c is not None else '' for c in row]
            break
    if not header:
        continue
    name_col = col_index(header, '料理名称')
    icon_col = col_index(header, '图鉴')
    spec_icon_col = col_index(header, '特色图鉴')
    star_col = col_index(header, '星级')
    effect_col = col_index(header, '效果类型')
    spec_col = col_index(header, '特色料理')
    specchar_col = col_index(header, '特色料理     角色')
    if specchar_col is None:
        specchar_col = col_index(header, '特色料理角色')
    method_col = col_index(header, '食谱获得方式')

    for i, row in enumerate(ws.iter_rows(values_only=True)):
        if i == 0:
            continue  # header
        name = val(row, name_col)
        if not name:
            continue
        if name in seen_names:
            continue
        seen_names.add(name)
        star_raw = val(row, star_col)
        star = parse_star(star_raw)
        effect = val(row, effect_col)
        spec = val(row, spec_col)
        spec = spec if spec and spec != '∅' else None
        specchar = val(row, specchar_col)
        specchar = specchar if specchar and specchar != '∅' else None
        method = val(row, method_col)
        # image: icon anchored at (icon_col, i)  [i is 0-based Excel row]
        rId = pts.get((icon_col, i)) if icon_col is not None else None
        img = extract_media(rId, rid_map, drawing) if rId else None
        running_id += 1
        foods.append({
            "id": running_id,
            "name": name,
            "star": star,
            "effect": effect,
            "specchar": specchar,
            "method": method,
            "image": img,
            "desc": synth_desc(star, effect, specchar, method),
            "price": price_from_star(star),
            "flavors": flavors_from(name, effect),
            "isspec": False,
        })
        # 特色料理作为独立食物条目
        if spec and spec not in seen_names:
            seen_names.add(spec)
            spec_star = min((star or 0) + 1, 5) if star else None
            s_rId = pts.get((spec_icon_col, i)) if spec_icon_col is not None else None
            s_img = extract_media(s_rId, rid_map, drawing) if s_rId else None
            running_id += 1
            foods.append({
                "id": running_id,
                "name": spec,
                "star": spec_star,
                "effect": effect,
                "specchar": specchar,
                "method": method,
                "image": s_img,
                "desc": synth_desc(spec_star, effect, specchar, method),
                "price": price_from_star(spec_star),
                "flavors": flavors_from(spec, effect),
                "isspec": True,
            })

# ---- write TS ----
def esc(s):
    if s is None:
        return ""
    return s.replace("\\", "\\\\").replace("'", "\\'")

lines = []
lines.append("import type { Food } from '../types/food'")
lines.append("")
lines.append("/**")
lines.append(" * 原神联动美食数据池：来自用户提供的《原神食谱.xlsx》表格。")
lines.append(" * 字段说明：")
lines.append(" * - id 为 900000+ 的内部编号（正整数，避免与内置美食冲突）；")
lines.append(" * - category 统一为「原神美食」；")
lines.append(" * - image 为随站打包的本地图标（public/genshin/ 下）；")
lines.append(" * - 原表无「介绍/描述」列，description 由星级 / 效果类型 / 特色角色 / 获取方式 合成；")
lines.append(" * - mealTypes / priceLevel / flavors / tags 为启发式默认值，便于筛选与随机抽取。")
lines.append(" */")
lines.append("")
lines.append("export const genshinFoods: Food[] = [")
for f in foods:
    meal = '["lunch", "dinner"]'
    lines.append("  {")
    lines.append(f"    id: {f['id']},")
    lines.append(f"    name: '{esc(f['name'])}',")
    lines.append(f"    category: '原神美食',")
    lines.append(f"    description: '{esc(f['desc'])}',")
    if f['image']:
        lines.append(f"    image: '{f['image']}',")
    else:
        lines.append(f"    image: undefined,")
    lines.append(f"    mealTypes: {meal},")
    lines.append(f"    priceLevel: {f['price']},")
    flavors = "[" + ", ".join(f"'{x}'" for x in f['flavors']) + "]"
    lines.append(f"    flavors: {flavors},")
    tags = "[" + ", ".join(f"'{x}'" for x in (['原神'] + ([f['effect']] if f['effect'] else []) + (['特色料理'] if f['isspec'] else []))) + "]"
    lines.append(f"    tags: {tags},")
    lines.append(f"    scenes: ['homeCooking'],")
    lines.append("  },")
lines.append("]")
lines.append("")
with open(TS_OUT, 'w', encoding='utf-8') as fh:
    fh.write("\n".join(lines))

with_img = sum(1 for f in foods if f['image'])
print(f"TOTAL foods (deduped): {len(foods)}")
print(f"With image: {with_img}")
print(f"Images extracted: {len(media_cache)} files in public/genshin/")
print(f"TS written: {TS_OUT}")
print("Sample:", json.dumps(foods[:2], ensure_ascii=False))
