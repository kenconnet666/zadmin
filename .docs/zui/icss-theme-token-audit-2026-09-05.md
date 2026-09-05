# ICSS、主题 token 与未发布 API 清理

审计基线：`ad45e1f2a0863dd8c3f73fdc928e5f8e3fe92856`。范围包含 ZUI components/runtime、ICSS 属性与主题定义、Docs 使用点和生成合同。按尚未正式发布的要求直接删除废弃别名，迁移调用方，不添加兼容包装。

## 发现与处理

| 问题                                     | 处理                                                                                                           | 实际消费/验证                                                                                                                            |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| breakpoint 已定义但媒体查询仍复制字符串  | `_media({ min, max }, factory)` 接入主题断点；类型要求至少一个有效边界，运行时拒绝未知键和非法对象             | Timeline 和 Docs 中对应 30/48/64rem 的断点迁移；自定义 breakpoint 的真实 CSS 宽度、compiler 的 client/SSR 动态槽位测试                   |
| 焦点偏移和缓动曲线散落为固定值           | 新增 `focusOffset.outer/inner/tight/none` 与 `easing.standard/enter/exit/linear`                               | Button/Input/选择器等共享焦点，常规过渡；Dialog/Popover/Tooltip 接入状态缓动。验证自定义 outline-offset、timing-function 与退场 Presence |
| CSS 系统颜色缺少安全访问器               | 补齐现代 Canvas/CanvasText/Field/Highlight 等关键字，支持颜色、边框、SVG fill/stroke 等属性                    | `backgroundColor.canvas` 是浏览器系统色；`backgroundColor._canvas` 是主题 token，类型与浏览器测试区分二者                                |
| 可选主色缺少统一前景/悬停/浅背景联动     | 八组 light/dark palette，`withPrimaryPalette(base, name, mode)` 联动 primary/primaryHover/onPrimary 与派生淡色 | Docs ZSelect 直接切换实际 Provider theme、保存偏好；按钮和当前导航真实 computed color 断言                                               |
| 调色覆盖高对比专用颜色                   | Docs 在解析后的主题为高对比时锁定 palette，而非只检查用户 contrast 选项                                        | 覆盖直接选择高对比预设、contrast=high、恢复普通模式与刷新持久化                                                                          |
| 表面效果只有小/中阴影，Card 无独立选择轴 | 新增 `shadow.large`、`ZCard.elevation` 四档与 Provider componentDefaults                                       | Card 示例和 Theme Lab 使用真实 ZCard；高对比预设所有阴影为 none                                                                          |
| Docs 固定导航/LoadingBar 页级层次写数字  | 新增 `zIndex.sticky/pageLoading`                                                                               | Docs Header 与 ZLoadingBar 使用语义层级；表格内部局部 z-index 不改为全局角色                                                             |

主色为 blue、violet、teal、green、amber、orange、rose、slate。组合测试发现初始绿色/橙色在 paperLight.surface 上低于 4.5，已调暗；当前八组在四套普通官方预设的 canvas/surface/选中浅背景上，以及实心前景/悬停组合均达到测试的 4.5 下限。此结论不覆盖任意用户自定义画布，也不表示整个页面通过所有无障碍要求。高对比预设不参加普通 palette 重着色。

`withPrimaryPalette` 只重配主色轴，不改变状态色、焦点色、阴影、density 或 colorScheme。应用负责显式传入 light/dark，并选择高对比处理策略。文档站没有另造一套颜色控件或 Card 展示实现。

## 废弃 API 已直接删除

| 删除的 API                                                                                                     | 当前 API                                         |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Calendar.isDateDisabled                                                                                        | isDateUnavailable                                |
| TagsInput/MultiSelect.values、defaultValues，MultiSelect.onValuesChange                                        | value、defaultValue、onValueChange               |
| Segmented.items、SegmentedItem                                                                                 | options、ZSegmentedOption                        |
| NumberField.clampOnBlur                                                                                        | allowOutOfRange                                  |
| Form.onSubmit/onReset                                                                                          | 原生 onsubmit/onreset                            |
| TreeSelect、ComboboxContent、ContextMenuContent、MenuSubContent、Carousel、VirtualList 的 deprecated ariaLabel | 原生 aria-label；Carousel 为必填名称             |
| List/DescriptionList/Timeline item.id                                                                          | 稳定 typed key                                   |
| Timeline.item snippet                                                                                          | content                                          |
| LoadingBar.fixed/page                                                                                          | mode="page"                                      |
| Provider.translations、ZuiTranslations、legacyOverrides、旧主题 context helper                                 | typed localePack、当前 provideZui/useZui 上下文  |
| IcssRuntimeSlot、createTreeIndex                                                                               | IcssDynamicSlot、LogicalTree                     |
| Docs 旧 themeMode/zui-docs-theme 读取/写入                                                                     | 当前 preferences-v1；新增 palette 字段并校验回退 |

组件/运行时/入口源码已无 `@deprecated`。类型负例、原运行时兼容测试、metadata、示例、手写 teaching 与 API 生成物同步调整。真实业务示例里的 `legacy` 数据、IME keyCode 229 处理、有效的手动 compound 模式不是废弃 API，未盲目删除。通用 metadata 生命周期验证器及其合成测试保留，但当前组件文档禁止存在 deprecated 行。

## 不机械 token 化的清单

运行 `pnpm --filter @zadmin/docs tokens:audit` 查看摘要，`tokens:update` 写入 `icss-token-usage.json`，`tokens:self-test` 已加入 CI 的 `audit:system`。扫描 731 个源文件，141 个属性定义，18 组/119 个主题 token；识别 1513 个主题 accessor、779 个系统关键字访问、113 个直接被引用的 token。

这是一份 AST 源码清单，不是运行时覆盖率。数值相等只标记候选；动态索引、helper 返回的 raw CSS、模板内联样式等仍需人工判断。

- 156 处结构零值、37 处 0/100% 与 4 处局部堆叠不需要额外 token。
- 8 处设计值复核项为五处圆形 50%、Drawer 的 -3px 局部内缩和两处 ZCode 高亮 CSS 变量桥接，保留用途。
- 唯一数值匹配候选是 DataTable 的 12px resize 命中区；它不能借用同值但不同用途的 timelineMarker/skeletonLine 尺寸。
- 剩余 8 处特殊媒体查询为 Docs 的 36/68/78/80rem 布局阈值，不伪装成已有通用断点。
- 六个未识别到直接引用的 token：borderWidth.progress、easing.linear、color.accentHover、duration.slow、focusOffset.none、opacity.muted。未直接引用不等于无效或死 API；包括新提供的关闭焦点偏移/线性曲线选项，不因此删除。

## 验证与边界

- 组件聚焦单元测试：12 files / 148 tests 通过；之后扩充 palette 预设组合校验，palettes.spec.ts 的 4 tests 通过。
- Docs theme 单测 9 tests、catalog/router 19 tests 通过；校验过程实际拦截并修复 Timeline/Segmented 的旧 teaching 与 Carousel 旧 required 断言。
- Chromium 组件测试 4 files / 8 tests 通过：Card elevation、Presence easing、ICSS 主题与系统色、自定义断点、MultiSelect。
- Docs Chromium E2E 2 tests 通过；执行生产 build，检查主色持久化、明暗与高对比恢复、Theme Lab 实际阴影；查看了真实截图。
- ZUI 与 Docs 类型检查均为 0 errors / 0 warnings；本轮全部改动 Prettier 检查通过。ESLint 找出的两处 each key 已补齐并复验；格式化导致的类型负例注释错位也已修正并完成 ZUI 类型复验。Svelte MCP 本会话未提供，使用项目 compiler、svelte-check 和浏览器验证。
- `zui:artifacts:update` 与 `audit:system` 通过；静态 API 扫描 141 components / 1746 generated props / 0 actionable issues。它不代表重新人工审查了所有组件的全部视觉状态。
- 基线主 CI [33946095284](https://github.com/kenconnet666/zadmin/actions/runs/33946095284) 已全绿；新提交的完整多浏览器、桌面与构建矩阵交给 CI。
- 另发现基线自动生成的 Release PR 分支 CI 失败，包含 versioned Docs artifacts stale；这是另一 revision 的发布链路状态，不能用主 CI 绿色替代，也未在本轮声称发布完成。本轮不发布 npm、不合并 Release PR。

CSS 系统颜色依据 [CSS Color 4](https://www.w3.org/TR/css-color-4/#css-system-colors)；媒体边界遵循 [Media Queries 4](https://www.w3.org/TR/mediaqueries-4/) 的 min/max 包含语义。
