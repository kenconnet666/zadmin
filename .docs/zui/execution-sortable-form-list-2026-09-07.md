# E18：Sortable、FormList 组合与集合交互收尾

本批沿用完整能力路线，新增 `ZSortable`，并用已有 `ZFormList` 作为首个真实组合消费者。组件保持 `experimental / unreleased`。源码、验收资产和本地浏览器点查与远程执行结果分别记录，不以组件数量或静态标签作为稳定结论。

## 复用与公开合同

`ZSortable` 使用 `ZStack` 布局、`ZButton` 手柄及替代操作、`ZVisuallyHidden` 指令和结果公告；逻辑身份继续由 `LogicalCollection` 管理，真实节点和焦点继续由 `MountedElements` 管理。拖放的 sensor、碰撞、键盘与自动滚动复用官方 dnd-kit 0.5.0，窄适配层只负责 ZUI 所需的样式、几何、身份与生命周期边界。

- `items / itemKey / itemLabel` 定义只读投影，数字 `0` 和字符串 `'0'` 是不同身份；key 必须稳定唯一，label 必须非空。
- `onMoveRequest` 收到冻结的原始 key 顺序、移动起止索引、来源、`nextItems` 与 `AbortSignal`。业务 owner 应用候选并返回 true，组件在 Svelte 更新后核对实际顺序，才报告 accepted。
- `onMoveEnd` 使用 accepted / rejected / cancelled / stale / error。拒绝、异常、Escape、源项禁用、readonly、卸载或外部结构变化不会暗中回写业务数组；业务 owner 已自行写入的数据也不会被组件回滚。
- 鼠标、键盘和可见移动按钮共用同一请求路径。待接受状态保留原数组、禁用再次写入，并提供明确的取消按钮。晚到 Promise 不重复完成请求。原位放下只结束拖动并公告，不发出无意义写入请求。
- `item` snippet 定制内容，`actions` snippet 通过同一个 `moveTo` 定制替代入口。行身份、列表语义、手柄与事务仍由根组件管理。
- FormList 示例直接传入 `rows`，以 `row.id` 为 key，并调用 `operations.move(fromIndex, toIndex)`。没有新增第二份数组模型、表单桥接或字段登记。

本批提取的 `createReorderRequest / applyReorderRequest` 是无 DOM 的快照计算；layout-motion 是不写内联 style 的 WAAPI 布局动画。前者不拥有业务数据，后者不拥有排序结果，便于后续真实消费者复用。

## 主题、动画与依赖边界

行、手柄与操作按钮使用同一五档 control size 和 indicatorSize；行背景、目标边框、阴影、字体、间距、圆角均由现有 Theme / ICSS 提供。新增 `componentDefaults.sortable.size`，局部 size 优先于组件默认与 Provider density。水平布局默认换行，内容允许断行；RTL 仅改变视觉方向和前后操作图标，不改变 key 或业务索引。

结构 readonly / disabled 只阻止重排，不通过行级 aria-disabled 误禁用 FormList 内容。原生 disabled 语义由手柄和移动按钮承担；行内容继续由自身 Field / Form 决定是否可编辑。行使用文字状态色，避免在 Button 自己的禁用透明度之外再次整体叠加透明度。焦点恢复会跳过 disabled / inert 手柄并回退至可用邻项或列表根。

落点反馈使用实际状态 class；业务接受后的布局动画使用共享 Theme duration / easing。Provider 或系统 reduced-motion 变化会立即取消当前动画。动画创建失败也会结束 pending/drop 生命周期并报告 error，避免将视觉异常变成无法继续操作的列表。

适配排除了依赖内置 Accessibility、Cursor、Feedback、PreventSelection 和 OptimisticSortingPlugin，避免双公告、DOM 预排序和 style 写入。保留 AutoScroller 与 SortableKeyboardPlugin。`transition: null` 被官方 Svelte wrapper 合并回默认值的问题在私有 attachment 层显式封住。

真实浏览器发现：仅移除 Feedback 会使 engine shape 为空，键盘方向键无法选择目标。因此增加 geometry-only bridge，使用依赖的 `DOMRectangle` 和经过 modifier 的 transform 维护 engine shape，继续由原碰撞与 sensor 工作。其 cleanup 根据 ValueHistory 实际接受的对象核对所有权；等值 ref 替换和滚动不产生第二套坐标或泄漏 shape。详细证据见[依赖适配边界](./dragdrop-adapter-boundaries-2026-09-07.md)。

## 本地已观察的行为

WebStorm 的受影响文件诊断、Prettier 与源制品生成用于本地快速检查；没有运行本地 Vitest、Playwright suite、全量类型检查或构建。

生成后目录为187公开组件、117文档族；API源审计覆盖2674个props，可操作问题为0。静态资产覆盖为Browser 175、Visual 161、Production 179、SSR 184；这些数量只说明资产存在，不表示远程执行通过。浏览器生命周期快速审计发现旧正则将`MountedElements.mount()`误当成Svelte裸mount，现改为AST区分真实import/调用与注册表方法，并通过独立正反例和全测试源码扫描；没有向焦点测试添加无意义adapter import来绕过审计。

- Chrome 插件实测鼠标第一项拖到末项、Space / 方向键 / Enter 排序、前后移动按钮，均在业务接受后更新顺序。等待确认、明确拒绝、取消及恢复操作也已点查。
- FormList 编辑后重排保留同一个 row DOM 和 input DOM；字段值、email、原生 FormData 的路径及顺序一起移动，reset 恢复默认行顺序和内容。
- 390px 视口下文档有效宽度 380px，两个示例列表宽 314px，纵向及横向 wrap 的页面与列表横向溢出均为 0。五档手柄高为 24 / 28 / 32 / 40 / 48px，行高为 34 / 38 / 42 / 50 / 58px。
- 后续图标改用共享 indicatorSize；medium 手柄为 32px、图标为 16px。改后页面和列表横向溢出仍为 0，无 Vite error overlay。
- 被检查的排序行、手柄和列表没有新增 style attribute。鼠标、键盘和异步操作检查中未观察到控制台 error。

远程资产覆盖 pure reorder、SSR、公开泛型、三浏览器键盘与真实 mouse、五档几何、RTL、接受/拒绝/异常/取消/过期、FormList DOM identity / FormData / dirty / error / warning / reset，以及 geometry 的 iframe、滚动、ref 替换和清理。资产存在不代表当前候选已执行通过。真实 touch、完整跨容器拖放、辅助技术与全部主题组合仍在后续适用矩阵中；没有以合成 PointerEvent 冒充真实触摸验收。

## 上一 E17 远程结果与针对性修正

[E17 CI 34100616043](https://github.com/kenconnet666/zadmin/actions/runs/34100616043) 已完成，workspace builds、Bundles and external packages、Chromium / Firefox Docs、Drizzle 均通过。外部 ZUI + SvelteKit tarball TypeScript / SSR 再次通过，bundle 的依赖字面量误报也已消除。静态检查、组件、覆盖率、Windows 类型步骤和 WebKit Docs 仍失败。

组件日志为 2474 passed、4 failed、2 skipped，并有 4 个未捕获错误与未完成文件；覆盖率为 1398 passed、2 failed，不能以已通过的子集代表整库执行完成。独立 component execution job 已真实完成 compose、verify 和 runtime stability，报告为 partial，三个 Verified 汇总均为 0，保守状态符合证据边界。

本批按该提交的具体失败继续修正：

- 四个日期组件的公开 generic / 判别 API 保留，私有 DOM rest 经 unknown 边界收窄，避免源码生成检查再次展开巨大联合。
- MiniCalendar SSR 断言与真实“名称: 日期窗口”可访问名称一致；日期拒绝用例读取实际 day-number，避免容器格式空白被误认为值变化。
- Toolbar 内 ToggleGroup 的实际按钮必须先满足 `toolbar.owns(button)` 才登记，避免 Portal 子组件在父 ref 未就绪期间错误加入 Toolbar；相关 fixture 调用统一 await 新版 async render。
- 嵌套菜单日志中的 ResizeObserver loop 对应 Floating size middleware 在 resize delivery 内同步回写尺寸。共享 FloatingPositioner 将元素 resize 更新合并到 owner Window 的下一帧，保留 Floating UI 的祖先滚动/resize与 layout-shift 监听；停止时取消排队帧，尺寸变量只在值改变时写入。独立资产验证同一轮多次通知不会同步回写。此项源码修复仍待新候选跨浏览器运行确认。
- WebKit Mention trace 显示异步建议目标真实命中且 active 已更新，click 结束后文本仍未提交。保留 textarea 焦点的取消默认行为移到原生 mousedown，不再取消 pointerdown；专项资产改用真实 mouse click 并检查 mouseup 时 textarea 仍持焦点。Chrome 再次点查得到 `Assign @alan `、光标 13 / 13、浮层关闭与横向溢出 0。WebKit 是否解决仍需新候选执行，未将推断写成通过。

CI 日志与原始 WebKit 诊断 ZIP 保留用于后续追溯；trace 在内存中读取，没有新增解压目录。推送本批后直接进入下一步，不轮询等待新 CI。

## 下一阶段

[E19 的具体文件与 API 边界](./w4-composition-next-2026-09-07.md) 已按当前 Transfer / Tree / DataTable 源码制定。先把 Transfer 现有移动按钮接入专用接受事务，再接跨栏拖放；保持 items、目标 value、临时 checked、active 和 query 的各自所有权。Tree 层级落点、DataTable 排序和虚拟表格结构按独立合同推进，不通过嵌套 Sortable 制造重复数组 owner。W6 / W7 和最终家族一致性复验继续保留在完整目标内。
