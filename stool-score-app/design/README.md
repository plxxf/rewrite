# 拉了么 · Figma 交接资料

目标 Figma 文件：<https://www.figma.com/design/GZ8mGE6cHXJwRGqEpkHqv4/PoopStart?node-id=0-1>

本目录是根据交互原型 `stool-score-app/index.html` 整理的全部设计资料，用来在 Figma 里搭出可编辑的设计稿。

## 目录

| 路径 | 内容 |
|---|---|
| `screens/` | 40 张页面截图（2 倍图，宽 390），按 11 个分类分文件夹；长页面是整页截图 |
| `screens/screens.json` | 截图清单 |
| `tokens/colors.light.tokens.json` | 浅色模式颜色（W3C 设计令牌格式，可导入为 Figma 变量的 Light 模式） |
| `tokens/colors.dark.tokens.json` | 深色模式颜色（同上，Dark 模式） |
| `tokens/typography-and-layout.json` | 文字样式、圆角、间距、阴影、图标规范 |

## Figma 文件建议结构

| Figma 页面 | 内容 | 对应截图文件夹 |
|---|---|---|
| 00 封面 | 名称、版本、更新日期 | — |
| 01 设计规范 | 颜色变量（Light / Dark 两个模式）、文字样式、圆角、间距、阴影、图标 | `tokens/` |
| 02 组件 | 按钮、卡片、标签、开关、分段控件、评分圆环（大/小）、迷你圆环、进度条、提醒卡片、底部导航、刻度盘、滚轮 | 从各页面提取 |
| 03 新手引导 | 欢迎、登录、手机号登录、基本信息（含数值不常见提示）、评分说明、隐私与提醒 | `01-新手引导` |
| 04 首页 | 周趋势、月趋势 | `02-首页` |
| 05 记录 | 拍照前、拍照后、填写完成、编辑、补记 | `03-记录` |
| 06 评分结果 | 分析中、结果（含就医提醒与用药询问）、记录详情、达成成就弹窗 | `04-评分结果` |
| 07 日历 | 本月、上个月 | `05-日历` |
| 08 报告 | 周报、月报 | `06-报告` |
| 09 成就 | 我的成就（20 个，5 组） | `07-成就` |
| 10 我的 | 我的、刻度盘、用药天数选择、从我的打开登录 | `08-我的` |
| 11 协议 | 用户协议、隐私政策、医疗免责声明 | `09-协议` |
| 12 深色模式 | 首页、记录、结果、日历、我的、刻度盘 | `10-深色模式` |
| 13 多语言 | 繁体中文、英文、法文、马来文首页 | `11-多语言` |

所有颜色都绑定到变量，所有文字都使用文字样式，所有重复元素都做成组件。这样以后改一个颜色或字号，全部页面会一起变。

## 怎么搭进 Figma

**方式一：让 Claude 直接搭（推荐）**

需要一个能连上 Figma 的新会话：

1. 在 claude.ai 的连接器设置里确认 Figma 已连接，并允许它的工具。
2. 新建会话，选择名为「Figma」的云环境。这个环境已允许访问 `mcp.figma.com`。
3. 发给 Claude：

   > 读取仓库 `plxxf/rewrite` 分支 `claude/vigilant-hopper-cvyhre` 里的 `stool-score-app/design/README.md`，按里面的结构，在 Figma 文件 https://www.figma.com/design/GZ8mGE6cHXJwRGqEpkHqv4/PoopStart 里搭出可编辑的设计稿：先建颜色变量和文字样式，再建组件，最后按分类搭页面。以 `stool-score-app/index.html` 原型为准。

**方式二：自己先导入参考图**

把 `screens/` 里的截图拖进 Figma 对应页面当参考。截图是图片，不能直接改文字。颜色变量可以用 Figma 的变量导入功能，或 Tokens Studio 插件导入 `tokens/` 里的文件。
