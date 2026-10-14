# 今天吃什么？（What To Eat Today）

一个有趣、精美的随机美食推荐网站。选择困难症的终极解决方案——把今天吃什么，交给一点点随机性。

## 功能特性

- 🎲 **真实随机推荐**：基于 `crypto.getRandomValues` 的无偏随机，杜绝固定顺序循环，并基于抽取历史优先避免重复（候选数大于 1 时绝不连续重复）
- 🎛️ **个性化筛选**：用餐时段（早餐/午餐/晚餐/夜宵）、预算（经济/适中/丰盛）、口味（清淡/香辣/酸甜/鲜香）、用餐形式（堂食或外卖/自己做饭），所有条件同时生效
- 🔎 **无匹配友好提示**：筛选无结果时不擅自放宽条件，明确提示并支持一键重置；修改筛选后若当前结果不再符合条件，会清晰提示需要重新抽取
- 🍳 **92 种常见美食**：覆盖中式家常菜、面食、米饭与盖饭、火锅与麻辣烫、小吃、早餐、快餐、地方特色与素食九大分类，另有 416 道原神联动料理
- ⏰ **用餐时段问候**：根据当前时间显示早餐 / 午餐 / 下午茶 / 晚餐 / 夜宵的贴心问候
- ✨ **抽取动画**：约 1 秒的名称轮播动画，落定结果弹性弹出；尊重系统 `prefers-reduced-motion` 偏好，自动跳过动画
- 📱 **移动端优先**：奶油白背景 + 暖橙主色调的大圆角卡片设计，移动端与桌面端均有良好体验
- 🛡️ **健壮的空态处理**：数据池为空时展示友好提示
- ❤️ **收藏夹**：收藏/取消收藏推荐结果，独立的收藏查看页，刷新后保留；可一键「仅从收藏中抽取」
- 🕘 **历史记录**：保存最近 30 次成功抽取（含时间戳），按时间倒序展示，支持清空，并用于减少近期重复推荐
- ✍️ **自定义食物**：可添加/编辑/删除/启用禁用自定义食物，表单带错误提示与取消操作；内置食物不可删除，但可加入排除清单
- 🚫 **排除清单**：把不想吃或需避免的食物加入排除清单，抽取时自动跳过
- 🎡 **幸运大转盘**：独立的转盘玩法，使用当前筛选后的候选食物；候选过多时随机抽样展示（保证可读性），且结果只从展示扇区中抽取，指针落点与公告结果严格一致；可在「随机抽取 / 幸运转盘」之间切换
- 😄 **趣味文案**：为每个推荐结果生成一句简短有趣的中文文案，纯本地模板生成，不调用任何 AI / 外部 API
- 🌗 **浅色 / 深色主题**：默认跟随系统主题，可手动选择浅色 / 深色 / 跟随系统并持久化；两种主题均保证良好可读性，并在首屏渲染前应用（无闪烁）
- ⚔️ **原神联动美食**：508 道美食中含 416 道原神料理（307 道普通料理 + 109 道特色料理），均带官方图标与原版游戏文案；特色料理带专属徽标
- 📖 **美食图鉴**：独立图鉴板块，支持按名称 / 描述 / 标签实时搜索；全部食物按拼音首字母 A–Z 分组排序；「原神」子类一键筛选
- 🗂️ **十大分类**：中式家常菜、面食、米饭与盖饭、火锅与麻辣烫、小吃、早餐、快餐、地方特色、素食，以及原神美食

## 技术栈

| 技术 | 说明 |
| --- | --- |
| React 19 | UI 框架（Context + Hooks 状态管理） |
| TypeScript | 类型安全 |
| Vite 8 | 构建工具（`@vitejs/plugin-react`） |
| Tailwind CSS 4 | 官方 Vite 集成（`@tailwindcss/vite` 插件） |
| Lucide React | 图标库 |
| pinyin-pro | 中文拼音转换（图鉴首字母分组） |
| Vitest | 单元测试 |

无后端、无数据库、无登录、无付费 API——纯前端静态应用，数据通过 `localStorage` 持久化。

## 快速开始

```bash
# 安装依赖
npm install

# 启动本地开发服务器（默认 http://localhost:5173）
npm run dev

# 类型检查 + 生产构建
npm run build

# 预览生产构建产物
npm run preview

# 代码检查（oxlint）
npm run lint

# 运行单元测试（Vitest）
npm run test

# 监听模式运行测试
npm run test:watch
```

## 目录结构

```
src/
├── components/          # UI 组件
│   ├── Header.tsx           # 顶部 Logo（含主题切换入口）
│   ├── GreetingBanner.tsx   # 随机欢迎语 + 日期 + 时段问候
│   ├── TabNav.tsx           # 顶部标签导航（抽取/收藏/历史/图鉴/我的）
│   ├── FoodCard.tsx         # 中央美食结果卡片（含趣味文案/收藏/排除操作）
│   ├── FoodThumb.tsx        # 食物缩略图（加载失败静默回退）
│   ├── FoodDex.tsx          # 美食图鉴（搜索 + 首字母分组 + 原神子类）
│   ├── SpinControls.tsx     # 帮我决定 / 再来一次 按钮
│   ├── WheelPicker.tsx      # 幸运大转盘（SVG 扇区 + 缓动旋转 + 结果卡）
│   ├── ThemeToggle.tsx      # 主题切换按钮（系统/浅色/深色循环）
│   ├── FilterPanel.tsx      # 筛选面板（时段/预算/口味/形式）
│   ├── FavoritesPanel.tsx   # 收藏夹查看页 + 仅从收藏抽取开关
│   ├── HistoryPanel.tsx     # 历史记录查看页 + 清空
│   ├── FoodLibrary.tsx      # 自定义食物管理 + 排除清单
│   ├── FoodEditor.tsx       # 自定义食物新增/编辑（对接 store）
│   ├── FoodForm.tsx         # 表单（校验/错误提示/取消）
│   └── Footer.tsx           # 页脚及项目说明
├── data/
│   ├── foods.ts             # 内置美食数据池（92 条）+ 原神数据合并 + 欢迎语池
│   └── genshinFoods.ts      # 原神联动美食（416 条，含图标与原版文案）
├── hooks/
│   ├── useFoodSpinner.ts    # 抽取动画状态机（接入持久化历史 + reduced-motion）
│   ├── useFoodStore.ts      # 读取全局持久化状态
│   └── useTheme.ts          # 主题管理（跟随系统/手动/持久化）
├── store/
│   ├── foodStoreContext.ts  # Context 定义与值类型
│   └── FoodStoreProvider.tsx# Provider（localStorage 持久化）
├── lib/
│   ├── random.ts            # 随机工具（无偏随机、历史优先避免重复、洗牌）
│   ├── filters.ts           # filterFoods 纯函数 + 口味分组映射
│   ├── pool.ts              # computePool 候选池计算（排除/收藏/自定义）
│   ├── storage.ts           # localStorage 存取（版本化/容错/校验）
│   ├── storeActions.ts      # 收藏/历史/自定义/排除的纯函数
│   ├── options.ts           # 表单选项与中文标签常量
│   ├── wheel.ts             # 转盘纯函数（候选展示策略 + 目标旋转角）
│   ├── copywriting.ts       # 趣味文案（本地模板，确定性生成）
│   ├── pinyin.ts            # 拼音首字母工具（图鉴 A–Z 分组）
│   └── datetime.ts          # 日期与相对时间格式化
├── types/
│   └── food.ts              # 全部类型定义
├── App.tsx                  # 页面组装、标签导航与筛选状态
├── index.css                # Tailwind 入口与主题定制
└── main.tsx                 # 应用入口（含 Provider）

test/
├── filters.test.ts          # 筛选逻辑测试
├── random.test.ts           # 随机抽取测试
├── storage.test.ts          # 数据存储测试
├── storeActions.test.ts     # 收藏/历史/自定义操作测试
├── pool.test.ts             # 候选池计算测试
├── wheel.test.ts            # 转盘扇区策略与旋转角一致性测试
├── copywriting.test.ts      # 趣味文案确定性测试
├── theme.test.ts            # 主题解析与容错测试
└── pinyin.test.ts           # 拼音首字母分组测试
```

项目根目录另有原神数据管线的可复现脚本（非构建必需，仅用于更新数据）：

```
extract_genshin.py               # 从《原神食谱.xlsx》提取食物与内嵌图标
scrape_wiki_descriptions.py      # 从 BitTopup Wiki 抓取原版游戏文案
update_desc.py                   # 将 wiki 文案按名称匹配写入 genshinFoods.ts
genshin_wiki.json                # 抓取到的 451 条原版文案缓存
public/genshin/                  # 随站打包的原神食物图标
```

## 数据结构

每种美食（`Food`）包含以下字段：

```ts
{
  id: number          // 唯一标识（内置为正数，自定义为负数）
  name: string        // 美食名称
  category: string    // 分类（九大类之一）
  description: string // 一句话简介
  mealTypes: []       // 适合的用餐时段
  priceLevel: 1|2|3   // 价格档位（对应经济/适中/丰盛）
  flavors: []         // 口味标签
  tags: []            // 趣味标签
  scenes: []          // 适用场景：eatOut / homeCooking
}
```

自定义食物 `CustomFood` 在 `Food` 基础上增加 `enabled` 开关。持久化状态 `FoodStoreState` 包含收藏、历史、自定义食物、排除清单与「仅从收藏抽取」开关。

## 筛选与推荐算法

- `filterFoods(foods, filters)`：纯函数，所有已启用的条件以 AND 组合同时生效；无匹配返回空数组，不擅自放宽条件
- 口味分组口径：香辣 = 香辣/麻辣/酸辣；鲜香 = 咸鲜/浓郁
- `pickRandomFood(candidates, history)`：优先从最近未抽过的候选中选；全部抽过时重新开始；候选数 > 1 时避开最近一次结果
- `computePool(foods, customFoods, favorites, exclusions, favoritesOnly)`：先应用排除清单与自定义启用状态，再按收藏模式过滤

## 数据存储（localStorage）

- 统一存取工具 `lib/storage.ts`，存储键 `what-to-eat:data`
- 版本化结构：写入时携带 `version` 字段，升级时在 `sanitizeStore` 中迁移
- 容错处理：JSON 解析失败、字段类型错误均回退为安全默认值，绝不抛出异常
- 数据验证：id 需为整数、分类/口味/时段/场景需在合法枚举内、历史按时间倒序并截断到 30 条

## 无障碍与动效

- 所有交互按钮均带 `aria-label`，切换类控件带 `aria-pressed`/`aria-checked`
- 抽取结果通过 `role="status"` + `aria-live="polite"` 播报
- 全局尊重 `prefers-reduced-motion: reduce`：关闭自定义动画，抽取直接出结果
- 清空历史、删除自定义食物均采用二次确认交互，避免误触
- 所有可交互元素提供一致的 `focus-visible` 焦点环，支持键盘完整操作

## 幸运大转盘

- 与「随机抽取」模式可切换（抽取页顶部的分段选择器）
- 使用当前筛选后的候选池；候选超过 12 种时随机抽样展示，结果只从展示扇区中抽取，因此指针落点与公告结果严格一致
- `lib/wheel.ts` 提供纯函数：`buildWheelSegments`（候选展示策略）、`computeTargetRotation`（目标旋转角，含扇区内自然抖动）、`nextRotation`（累计多圈旋转）
- 旋转期间按钮禁用，杜绝重复触发；`prefers-reduced-motion` 下直接定位到结果，无动画

## 主题切换

- 默认跟随系统 `prefers-color-scheme`，可手动选择「浅色 / 深色 / 跟随系统」
- 偏好持久化到 `localStorage`（键 `what-to-eat:theme`），并在 `index.html` 内联脚本中于首屏渲染前应用，避免主题闪烁
- 深色模式通过 `<html>.dark` 类驱动 Tailwind `dark:` 变体，两种主题均保证文本对比度与卡片层次

## 部署

本项目是纯前端静态应用（构建产物为 `dist/` 目录，无服务端、无客户端路由），可直接部署到任何静态托管平台，推荐 Cloudflare Pages（免费、自动 HTTPS、支持预览部署）。

### 部署到 Cloudflare Pages

1. 将代码推送到 GitHub 仓库（见下节）
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**，按提示授权 GitHub 并选择本仓库
3. 构建配置填写：

   | 配置项 | 值 |
   | --- | --- |
   | Production branch | `main` |
   | Build command | `npm run build` |
   | Build output directory | `dist` |

4. 点击 **Save and Deploy**，等待构建完成即可获得 `*.pages.dev` 域名

> 之后每次推送到 `main` 分支，Cloudflare 会自动重新构建部署；Pull Request 会生成独立的预览部署。

### 推送到 GitHub（Windows PowerShell）

首次初始化并推送（在项目根目录执行）：

```powershell
# 1. 初始化 Git 仓库
git init

# 2. 将默认分支命名为 main（与 Cloudflare 的 Production branch 一致）
git branch -M main

# 3. 暂存所有文件（.gitignore 会自动排除 node_modules、dist 等）
git add .

# 4. 检查将提交的内容，确认没有不该提交的文件
git status

# 5. 创建首次提交
git commit -m "feat: 今天吃什么？随机美食推荐网站（含原神联动与美食图鉴）"

# 6. 先在 GitHub 网页上创建一个【空仓库】（不要勾选 README / .gitignore 等初始化选项），
#    然后替换下方 <你的用户名> 与 <仓库名> 后执行，关联远程仓库
git remote add origin https://github.com/<你的用户名>/<仓库名>.git

# 7. 推送到 GitHub（首次推送会弹出浏览器，要求登录 GitHub 完成授权）
git push -u origin main
```

后续更新只需三步：

```powershell
git add .
git commit -m "描述本次改动"
git push
```

> 提示：若已安装 GitHub CLI（`gh`）并完成 `gh auth login`，第 6、7 步可合并为一条命令：
> `gh repo create <仓库名> --public --source=. --push`
> 它会自动创建远程空仓库、关联 origin 并完成首次推送。
