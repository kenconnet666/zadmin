# N1 / F4：类型安全的组件视觉默认值，首批执行

日期：2026-09-06。关联：[完整能力路线图](./full-capability-roadmap-2026-09-06.md)。本文件记录已落盘的首批实现和待执行合同；不是全组件覆盖声明，也不是 CI 通过声明。

## 实现范围

`runtime/foundation/component-defaults.ts` 从 6 个手写类型与规则并行维护的分组，改成 16 个分组共用一份 typed `COMPONENT_RULES`。运行时允许值、公共默认值接口、继承结果类型均从该规则来源派生。五档控件尺寸复用 `controlSizes`，五档语义色复用 `semanticTones`，文字字号、行高和字重复用 Theme schema 的键。

规则层不导入 Svelte 或组件，不注册浏览器资源。运行时仍拒绝未知分组、未知字段、访问器、symbol key、非普通对象、非有限数字及函数；合并结果与各分组冻结。新加入的配置全部为有实际消费者的视觉默认值。

| 分组         | 本批允许字段                                                                    | 实际消费者与边界                                                                        |
| ------------ | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| avatar       | shape、size                                                                     | ZAvatar 外形和头像专用尺寸；alt/src 不可默认                                            |
| badge        | overlap、placement、size、tone                                                  | ZBadge 几何与语义色；count/dot/showZero/max 不可默认                                    |
| button       | fullWidth、shape、size、tone、variant                                           | 保留既有 ZButton 支持；Button 内部 Spinner 继续显式使用按钮尺寸和 inherit 色            |
| card         | elevation、variant                                                              | 保留既有 ZCard 支持                                                                     |
| dataTable    | density、overscan、rowHeight、selectionMode、stickyHeader、striped、virtualized | 保留既有结构/性能默认值，避免本批破坏迁移；rows/columns/selection 状态不进入默认值      |
| dialog       | size                                                                            | ZDialogContent 的标准面板及 AlertDialog 组合；Drawer 使用自己的面板尺寸，不消费该默认值 |
| heading      | lineHeight、size、tone、weight、wrap                                            | ZHeading 的视觉排版；level 仍由调用方决定文档层级                                       |
| icon         | size、strokeWidth                                                               | ZIcon 的五档尺寸/full/正有限数字，以及正有限描边宽度；name/label 不可默认               |
| input        | size                                                                            | 保留既有 Input/InputGroup/Textarea 上下文与显式优先级                                   |
| link         | appearance、size、tone、underline、variant                                      | ZLink；size 用于按钮/导航外观，variant 只用于按钮外观；href 与导航状态不可默认          |
| pagination   | mode、size                                                                      | 保留既有 ZPagination 支持；页码和总页数仍属调用方                                       |
| spinner      | size、tone                                                                      | ZSpinner；tone 仅 inherit/muted/primary，label 仍来自显式值或 localePack                |
| tag          | size、tone                                                                      | 保留既有 ZTag 支持；移除行为、标签内容不进入配置                                        |
| text         | lineHeight、size、tone、weight                                                  | ZText 排版；文本、截断行数等内容相关决定仍属调用方                                      |
| toggleButton | fullWidth、shape、size、tone、variant                                           | ZToggleButton 专属视觉配置；pressed/defaultPressed/disabled 不可默认                    |
| tooltip      | size                                                                            | ZTooltipContent 字体与间距；open、延迟和内容不进入默认值                                |

未加入一个泛化的 `typography` 分组：Text 与 Heading 共用规则，但分别消费 `text` 与 `heading`，避免跨组件视觉优先级不明确。也未给无视觉根增加 size/tone。

## 确定的优先级与迁移

1. 普通消费者使用显式 prop → 对应 `componentDefaults` 分组 → 组件原有默认值；只有 `undefined` 表示继承请求，显式 `false`、`0` 不被真假判断吞掉。
2. Toggle 使用显式 prop → `toggleButton` → `button` → Toggle 原有内置值；未配置时仍是 outline/primary。提供共享 `button.variant` 后，未指定自身 variant 的 Toggle 现在会继承它。这是本批刻意扩充的组合合同；需要维持独立外观时设置 `toggleButton.variant` 或显式 prop。
3. Link 先解析 `appearance`。只有 `appearance='button'` 时，其 size/tone/variant 才额外继承 Button。文本和导航外观不受共享 Button 尺寸影响，保持原生 anchor 和调用方 href。
4. 嵌套 Provider 对同组字段做浅合并；单组 `null` 移除该组，整个 `componentDefaults={null}` 清空默认值轴。删除 `toggleButton` 分组仍保留共享 `button` 回退；需要同时取消时一并将两组设为 null，或清空整个轴。
5. Provider 更新只改变视觉配置，不写业务 value/open/pressed、不会调用用户事件，也不改变 Heading 层级或 Link 目标。Portal 后代仍读取原 Svelte 作用域中的默认值。

现有六个分组及公共接口名称保留，没有新增必填字段。现有默认值缺省时的表现不变。公共接口继续使用 `interface`，其字段来自规则映射；只对当前文件将 `@typescript-eslint/no-empty-object-type` 的 `allowInterfaces` 设为 `with-single-extends`，保留公开声明形式，不放宽空对象或无继承空接口。任意声明合并新增字段仍不构成运行时授权，严格白名单始终拒绝它们。

需要由根整合的新增公共类型导出：`AvatarComponentDefaults`、`BadgeComponentDefaults`、`DialogComponentDefaults`、`HeadingComponentDefaults`、`IconComponentDefaults`、`LinkComponentDefaults`、`SpinnerComponentDefaults`、`TextComponentDefaults`、`ToggleButtonComponentDefaults`、`TooltipComponentDefaults`。现有类型导出保留。内部 `resolveComponentDefault` 是消费者共享的小函数，不需要加入包级导出。

## 文档与验证合同

Provider 文档已同步 16 分组以及 Toggle/Link 的组合继承说明，保留原输入/数据默认值示例，新增 `VisualDefaultsDemo.svelte` 展示动态宽松/紧凑配置、显式 Text 覆盖、单组 null、选中状态保留和 Dialog/Tooltip Portal 继承。组件自身 metadata 的默认值说明也注明对应 Provider 路径。

本批新增或扩充以下合同，交由后续 CI 执行：

- `component-defaults.spec.ts`：所有新增分组允许值、嵌套合并、冻结、undefined/null 边界、明确拒绝业务状态/语义层级/内容/不支持枚举。
- `component-defaults-types.ts`：正确配置可满足公共类型；无效字号、Heading level、Dialog open、Link href 等触发 `@ts-expect-error`，确保类型与运行时规则相符。
- `component-defaults-visual.browser.spec.ts` 与 `ExtendedComponentDefaultsFixture.svelte`：断言真实字号、行高、字重、图标尺寸/描边、头像/徽标/按钮几何与主题色，显式值、嵌套覆盖、null 截断、Button 内部 Spinner 的隔离，更新视觉配置后保留实际用户选择及事件次数，Portal 尺寸实时更新而显式面板尺寸不变。
- `component-defaults-extension-ssr.spec.ts`：无浏览器全局时可渲染，保留 h3/href/业务状态，关闭的浮层不输出。

本地只进行允许的 WebStorm 局部诊断、Node Prettier 与 diff 空白检查；未运行测试、构建、完整类型检查或生成器。当前代码落盘不等于浏览器/SSR/CI 已通过，主代理的后续真实页面验证及 CI 结果需独立记录。

## 后续覆盖边界

这是 N1/F4 第一批可验证增量，尚未声称所有组件支持 defaults。后续按真实视觉根扩展导航、复杂输入和反馈组；每新增一组必须同步运行时规则、组件消费、显式/null/动态覆盖与真实视觉证据。业务初值、状态、语义层级、任意 DOM/CSS 不进入 defaults。主题 token、recipe 外观和组件配置各自承担已有职责，不再增加无实际需求的全局配置层。
