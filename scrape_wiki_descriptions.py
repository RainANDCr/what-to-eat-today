#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""爬取 BitTopup Wiki 原神食物详情页的 ld-item JSON-LD，提取 name + description + image。

输出：genshin_wiki.json  ( { name: {id, desc, image} } )
增量保存，遇到 429/5xx 自动退避重试。
"""
import urllib.request, re, json, time, random, sys, os

BASE = "https://wiki.bittopup.com/zh-CN/genshin/food"
UA = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml",
    "Accept-Language": "zh-CN,zh;q=0.9",
}
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "genshin_wiki.json")

def fetch(url, retries=5):
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=25) as r:
                return r.read().decode('utf-8', 'replace')
        except urllib.error.HTTPError as e:
            code = getattr(e, 'code', None)
            if code in (429, 500, 502, 503, 504):
                wait = 8 * (attempt + 1) + random.uniform(0, 3)
                print(f"  [retry] {url} HTTP {code}, sleep {wait:.0f}s", flush=True)
                time.sleep(wait)
                continue
            raise
        except Exception:
            wait = 4 * (attempt + 1)
            time.sleep(wait)
    raise RuntimeError(f"failed: {url}")

def load():
    if os.path.exists(OUT):
        with open(OUT, encoding='utf-8') as f:
            return json.load(f)
    return {}

def save(data):
    tmp = OUT + ".tmp"
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    os.replace(tmp, OUT)

def main():
    data = load()
    html = fetch(BASE)
    ids = sorted(set(re.findall(r'/zh-CN/genshin/food/(\d+)', html)), key=int)
    print(f"index ids: {len(ids)}", flush=True)

    todo = [i for i in ids if not any(v.get('id') == i for v in data.values())]
    # also allow re-scrape of ids already saved but missing desc
    print(f"already have: {len(ids) - len(todo)}, to scrape: {len(todo)}", flush=True)

    count = 0
    for i, fid in enumerate(todo):
        url = f"{BASE}/{fid}"
        try:
            page = fetch(url)
            m = re.search(r'<script type="application/ld\+json" data-hid="ld-item">(.*?)</script>', page, re.S)
            if not m:
                print(f"[skip] {fid}: no ld-item", flush=True)
                continue
            obj = json.loads(m.group(1))
            name = obj.get('name')
            desc = obj.get('description')
            image = obj.get('image')
            if not name:
                print(f"[skip] {fid}: no name", flush=True)
                continue
            # key by name (name may collide across ids? rare) — keep first with desc
            existing = data.get(name)
            if existing is None or (not existing.get('desc') and desc):
                data[name] = {"id": int(fid), "desc": desc, "image": image}
            count += 1
            if count % 20 == 0:
                save(data)
                print(f"  ...{count} done, total entries {len(data)}", flush=True)
        except Exception as e:
            print(f"[err] {fid}: {e}", flush=True)
        time.sleep(random.uniform(0.30, 0.55))

    save(data)
    print(f"DONE. entries={len(data)}  out={OUT}", flush=True)

if __name__ == '__main__':
    main()
