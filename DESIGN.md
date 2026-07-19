# Design System

## Style Prompt

以 xAI 式研究实验室界面为视觉参考，服务于圣农企业架构评审。页面使用近黑单一画布、白色主信息、轻量字重和克制的描边交互。它应像一份由工程团队发布的可执行研究蓝图，而不是彩色仪表盘或营销网站。保留产品所需的信息密度、表格、状态、证据与八节点滚动导航。

## Colors

- Canvas: `#0a0a0a`
- Canvas Soft: `#1a1c20`
- Canvas Card: `#191919`
- Canvas Mid: `#363a3f`
- Hairline: `#212327`
- Ink: `#ffffff`
- Body: `#dadbdf`
- Muted: `#7d8187`
- Active / Sunset: `#ff7a17`
- Active Soft: `#ffc285`
- Dusk: `#7c3aed`
- Twilight: `#c4b5fd`
- Breeze: `#a0c3ec`

白色负责主要层级。橙色只用于当前节点、关键责任门和少量操作反馈。蓝色与紫色只用于区分必要的能力状态，不形成彩色卡片墙。

## Typography

- Display and body: Inter 400，中文回退为 PingFang SC、Microsoft YaHei。
- Technical labels and code: Geist Mono 400，回退为 JetBrains Mono、SFMono-Regular、Consolas。
- 所有角色默认 400 字重，依靠字号、留白和明度形成层级。
- 技术眉题使用大写或代码式标签，字号 12-14px。
- 出于当前产品规范，字距保持 0，不使用负字距。

## Scale

- Hero: 72/72 desktop，48/52 tablet，40/44 mobile。
- Section title: 48/52 desktop，36/40 tablet，32/36 mobile。
- Cluster title: 32/36。
- Body large: 18/28。
- Body: 16/24。
- Secondary: 14/20。
- Mono caption: 12/16。

## Layout

- 页面使用单一近黑画布，内容最大宽度约 1200-1280px。
- 桌面章节上下内边距 64-96px，移动端 48-64px。
- 顶部保留八节点粘性进度导航，当前节点由文字、序号、颜色和 `aria-current` 同时表达。
- 每个节点正文完整展开，不依赖隐藏标签页或右侧详情。
- 高密度表格允许横向滚动，页面本身不得横向溢出。

## Components

- Interactive: 1px 半透明白色描边胶囊，透明背景，最小触控高度 44px。
- Card: `#191919` 实体背景、`#212327` 细边框、8px 圆角、无阴影。
- Panel: 与页面同色或轻微深灰，不使用玻璃模糊与投影。
- Table: 表头使用 Geist Mono，行分隔使用 hairline。
- Status: 小型胶囊；文字必须说明状态，颜色不能成为唯一依据。

## Motion

- 150-250ms 状态过渡，缓动 `cubic-bezier(0.16, 1, 0.3, 1)`。
- 只动画 opacity 与 transform。
- 滚动节点变化用于表达当前阶段，不进行滚动劫持、视差或无限循环。
- `prefers-reduced-motion` 下关闭平滑滚动和章节进入动画。

## What Not To Do

- 不使用阴影、玻璃拟态、渐变文字、霓虹光晕或装饰性背景网格。
- 不把页面变成营销落地页，不隐藏架构细节。
- 不用粗体堆叠层级，不使用大量填充按钮。
- 不使用纯装饰色块，不让多种强调色争夺注意力。
- 不改变现有业务事实、能力边界和验收结论。
