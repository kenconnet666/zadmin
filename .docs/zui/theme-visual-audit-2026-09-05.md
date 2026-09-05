# 主题 API、排版与动画专项审计

基线：`68a3fdc8deddeeba170f2bf1eaf390cddf9170f9`。用户要求继续处理大小、动画、字体、间距和美学问题，并明确允许扩展语义颜色、优先优化组件库、减少文档站定制。

## 发现与处理

| 发现                                                  | 证据                                                                          | 处理归属                                                                                   |
| ----------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 顶栏控件比例不一致                                    | 真实 Chromium：主题与搜索高 32px；显示与 GitHub 高 24px，字号分别 14px / 12px | Docs 改用相同 `size="medium"`，不增加局部高度覆盖                                          |
| 文档标题与正文比例失衡，各页公式不同                  | ComponentPage 60px，Home/Guide/Theme Lab 各自定义 clamp、负字距或文字阴影     | 新增通用 `fontSize.xxlarge=32`；四类页面使用 ZHeading API，移除这些标题定制                |
| 导航 medium 不等于中号控件高度                        | 原 font 14 × line-height 1.5 加上下 padding 16px，实际高 37px                 | ZLink navigation 用分轴间距，small/medium/large 实测为 24/32/48px                          |
| Sidebar 选中表面与背景混淆、重复箭头造成噪声          | Sidebar 与当前项都消费 surface；每行无独立展开行为但都有向右图标              | 组件选中态使用 primarySubtle，Docs Sidebar 使用 canvas，移除重复箭头并调整分组间距         |
| 可访问性说明全部粗体，标题位置不齐                    | ZList 默认数据标签硬编码 strong；Card 内标题相对 API 标题向右偏移             | ZList 默认 span/normal；标题移到卡片外，由 ZStack 统一 16px 间距                           |
| Card 无内边距示例正文贴角                             | bodyPadding="none" 按合同确实为零；横向 Stack 默认 stretch                    | 保留 Card 语义，示例改为铺满表格与有留白正文，显式 align="start"                           |
| 代码字号需靠调用方 CSS 改写                           | inline 默认 small，没有公开字号轴                                             | ZCode 新增 size，默认值兼容；Docs 导入语句使用 medium，API 短类型仍保留 small              |
| Disclosure 需要覆盖 AccordionTrigger 字体、间距和宽度 | DemoBlock 原自定义 trigger recipe                                             | 组件新增 appearance="inline"，Docs 删除对应 CSS，保留真实 Accordion 状态与 ARIA            |
| Theme runtime 接受类型不允许的值                      | color/fontFamily 能接收数字；空字符串和越界数字直到渲染才体现错误             | 构建时校验字符串类型、非空与已建模数字范围                                                 |
| duration 类型和运行时消费不一致                       | Theme 可传 calc/var，但 Presence 只解析具体时间，浮层退出时抛错               | 公开 DurationTokenValue；主题和 Presence 共用纯时间解析器，保留原解析器 number/string 入参 |
| 退出时切换减少动画仍等待旧 timer                      | Presence 在 present=false 不变时直接返回                                      | class 与 reactive controller 都在 exiting + duration=0 时立即取消 timer 并退出             |

字体排查使用 Chromium `CSS.getPlatformFontsForNode`，纸张主题正文和列表实际使用 **Microsoft YaHei UI**。本轮没有证据证明衬线回退，因此未增加字体包或未经验证的 CJK token。

交叉审查还将 404 路径统一为 `ZHeading size="xxlarge"`，共移除五类页面的顶级标题定制。搜索框的 content 宽度规则经真实 DOM 验证：它匹配 ZButton 公共 `data-slot="content"`，只负责搜索工具栏内容布局，不覆盖字号或组件颜色。

## 语义主题合同

保留 16 个主题组，在 color 中增加 9 项；不加入 Docs 专属颜色组。

| Token                                        | 默认关系                          | 实际消费者                                          |
| -------------------------------------------- | --------------------------------- | --------------------------------------------------- |
| surfaceHover                                 | text 6% 与 canvas 混合            | 次要/幽灵按钮、导航、菜单/选择项活动态              |
| primarySubtle                                | primary 8% 与 canvas 混合         | 导航、Select/MultiSelect/Combobox、checked MenuItem |
| primarySubtleHover                           | primary 14% 与 canvas 混合        | 已选中且悬停/活动的导航和选择项                     |
| accentSubtle                                 | accent 8% 与 canvas 混合          | accent Tag、info Alert                              |
| dangerSubtle / successSubtle / warningSubtle | 对应语义色 8% 与 canvas 混合      | Tag、Alert                                          |
| onPrimary                                    | 默认沿用各主题 canvas，可显式覆盖 | 实心主按钮及 loading 指示器、选中日历单元           |
| onDanger                                     | 默认沿用各主题 canvas，可显式覆盖 | 危险按钮及 loading 指示器、danger Badge             |

`extendTheme` 修改源色时重算相应派生颜色；同一次 patch 中的显式派生值优先；无关的 radius/space 修改不会清除既有定制颜色。`primaryHover` 是实心悬停色的独立轴，主题作者应与 primary 协同选择。选中悬停背景较深时，导航/选择项同步使用 primaryHover 前景，避免默认主题只有约 4.25:1 的对比度。

Theme Lab 增加真实 Tag / Alert 展示；ICSS 指南新增语义配色、排版、派生优先级、完整主题迁移及 duration 限制说明。文档不通过额外色值覆盖这些组件。

## 验证证据与边界

- 主题/Presence 单元：24 项通过；包含合法与非法主题输入、派生与显式覆盖、完整冻结、时间解析、退出中切换 reduced motion。
- 默认主题与六个预设的语义前景/背景组合按 4.5:1 门槛检查；发现选中悬停前景问题后修复，不降低门槛。
- 真实组件浏览器：颜色覆盖、不同主题、Badge/Calendar 前景、导航几何、Heading/Text/Code 字号、Accordion inline、List 字重等分别使用定向 fixture/spec 验证。marker 用显式自定义主题，不以默认值碰巧一致冒充覆盖生效。
- Docs Chromium 8 项通过：六主题字号/控件几何、章节间距、可访问性说明对齐、API 滚动区域、主题菜单、Theme Lab axe、窄屏导航。
- ZUI 与 Docs svelte-check 为 0 errors / 0 warnings；本地不跑全库多浏览器或覆盖率，大范围验证交给当前提交对应 CI。
- Docs 构建入口约 313KB，仍低于原有 326KB 限额；79 个文档 chunk 保持懒加载，不调高预算。
- 静态 API 审计仍覆盖 141 组件，当前公开属性事实为 1764 项；这不等于所有主题 × 状态 × 视口组合都已人工验收。

前一基线 `68a3fdc` 的 CI `33939222392` 已全绿，包含 Windows 桌面及三个浏览器。这是前一提交的证据；本次新增修复必须使用新提交的 CI 结果，不能借用旧结果宣称本轮全绿。
