# 导航与浮层逐族审计及首批修复

日期：2026-09-06。源码基线为 `3b4536f`。用户授权逐组件审计、直接修复及适当调整 API 命名。

本记录覆盖导航 9 族、浮层 7 族。它补充 [逐项台账](./api-audit-progress-2026-09-05.md)，不将此前的 maturity 标记当成本轮浏览器验收。当前证据是源码复核、明确缺陷修复、WebStorm 文件诊断与提交给 CI 的定向回归源码；多主题、视口、交互和动画的真实浏览器执行另行记录。

## 首批修复

- **Tree / Command disabled 视觉**：此前 root 与所有 item 同时消费 `opacity.disabled`，默认全局禁用为 `0.5 × 0.5 = 0.25`。现在行为 `disabled` 仍完整传播，局部 `dimmed` 只在 root 未禁用时施加。全局禁用 root=0.5、item=1；局部禁用 root=1、对应 item=0.5。
- **真正的入场过渡**：迁移 Drawer 私有入场控制器为 `runtime/foundation/presence-entry-motion.svelte.ts` 的 `PresenceEntryMotion`，由 DialogContent、DialogOverlay、DrawerContent、PopoverContent、TooltipContent、AccordionContent 使用。新挂载表面保留一个 painted closed frame，再进入 open 样式。`Presence` 继续独立管理挂载与退出 timer。
- **生命周期边界**：默认打开内容在 SSR / hydration 保持 entered；关闭中重开且 DOM 仍保留时直接反转过渡；reduced motion 立即进入并取消帧；调度归属元素的 owner Window，换 realm、关闭、销毁均取消旧帧，并用 generation 忽略已出队的迟到回调。组件 recipe 同时检查逻辑 open，避免关闭前已有 entered 值造成闪帧。
- **Drawer 唯一 owner**：DrawerContent 的 `appearance="unstyled"` 使 DialogContent 不接管它的视觉入场；DrawerOverlay 改为透传至 DialogOverlay，移除第二套 rAF 与 inline opacity。基础 Overlay 输出 `data-motion-state="entering|entered|exiting"`，保留 Drawer 的既有状态合同。
- **长内容边界**：PopoverContent 与 TooltipContent 消费 Floating 的 available width 并使用 `overflow-wrap:anywhere`；Tooltip 补 `box-sizing:border-box`。长 URL / 无空格 token 保留原文，由排版换行。
- **命名迁移**：Tooltip 与 TooltipGroup 的 `delay` 改为 `openDelay`，对称于 `closeDelay`；Tour 的 `closeOnEscape` / `closeOnMaskClick` 改为 `dismissOnEscape` / `dismissOnMaskClick`。组件类型、runtime、metadata、Docs teaching / demos 与已有 fixtures / types 同步。

## 首批 16 族记录（后续落实见第二批）

| 家族           | 已审查的合同                                                                                  | 本批处理与后续边界                                                                                                                    |
| -------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Accordion      | typed key、single/multiple、独立 active、non-collapsible、disabled、动态删除焦点恢复、region  | 本批修 Content 入场；五档 trigger size / indicator 传播留到共享尺寸合同批次；保留 inline appearance 的用途。                          |
| Tabs           | automatic/manual、orientation/RTL、active/selected 分离、panelMount                           | 待补 enabled hover 与五档 trigger size；长标签在横向滚动列表中的 flex 收缩/换行需浏览器补证。Panel 不强加 tone。                      |
| Menu           | button/anchor、可取消 action、checkbox/radio、typeahead、子菜单动作链                         | 行 size 应由 Menu 传 Item/Label/Indicator，并在 SubContent 的新 Menu 中继承；danger→tone 暂不扩大改名范围。                           |
| DropdownMenu   | Popover + bare Menu、first/last 焦点策略、取消后保持打开                                      | 自动获益于 Popover 入场；后续 Content/Menu 行尺寸与 Trigger 的 Button size 分别拥有。                                                 |
| ContextMenu    | fixed 坐标锚点、ContextMenu/Shift+F10、menuRef 与焦点恢复                                     | 自动获益于 Popover 入场；默认名称仍硬编码 Context menu，后续纳入 localePack。                                                         |
| Command        | query/defaultQuery、filter/shouldFilter、maxResults、分组、active-descendant、可取消 Action   | 本批修全局 disabled 叠乘；后续输入/行/说明/shortcut 的尺寸关系、active surface 与 Menu 一致性、长标题/快捷键窄屏排版。                |
| CommandPalette | 快捷键作用域、open/query owner、Action 取消与 query reset                                     | 自动获益于 Dialog 入场；后续考虑选择性透传 Command 的 filter/shouldFilter/maxResults/loop/resultsLabel，避免封装阻断必要搜索控制。    |
| Pagination     | totalPages 与 totalItems/pageSize 判别、受控夹紧、simple 输入、RTL                            | 后续新增五档视觉 size，统一按钮、input/select/icon/status；数据 pageSize 保持原语义。                                                 |
| Tree           | parentKey、懒加载 AbortSignal/generation、controller、虚拟化、表单桥接                        | 本批修 disabled 叠乘；后续默认虚拟 itemSize 与视觉 size 联动，显式 itemSize 优先；固定 icon/switcher 尺寸需传播。暂缓 keys 事件改名。 |
| Dialog         | 名称校验、Title/Description、FocusScope、inertOthers、scroll lock、outside/Escape、exit inert | 本批修 Content/Overlay 入场；后续 Content 可有五档面板宽度 token，不能复用按钮像素值；无 DOM Root 不增加 size/tone。                  |
| AlertDialog    | 显式决策、Cancel 初始焦点、pending、失败保持打开、generation                                  | 自动继承 Dialog 入场；保留 onAction 的动作语义。pending/错误/重开组合留待浏览器验证。                                                 |
| Drawer         | 逻辑 start/end、RTL、预设/number/CSS size、full、入场                                         | 本批共享 helper、清除 Overlay 重复 owner；后续补 xsmall/xlarge 专用宽高 token，full 仍独立。                                          |
| Popover        | Floating/Portal、modal、manageFocus、restoreTarget、exit inert                                | 本批修入场与长词宽度；当前 translateY(-4px) 不跟实际 flip 方向，后续先公开 resolved placement 再决定方向动画。                        |
| Popconfirm     | onConfirm、错误格式化、reject status、generation-safe async                                   | 自动继承 Popover 入场与长词处理；面板尺寸与内部 Action size 需明确区分。                                                              |
| Tooltip        | focus 即时、pointer warmup、hoverable、disabled wrapper、group、非交互约束                    | 本批 openDelay 命名、入场、长词边界；后续 Content 五档字体/间距及独立 inverse 主题用途，Trigger 继续跟 Button。                       |
| Tour           | targetRoot/ShadowRoot、missing target、centered、modal branch、scroll reduced motion          | 本批统一 dismiss 命名；mask/spotlight/content 的入场与 enter/exit easing、内部 small 按钮尺寸另列后续工作，不宣称已完成。             |

## API 迁移

| 旧接口                   | 新接口                     | 保持的行为                                                              |
| ------------------------ | -------------------------- | ----------------------------------------------------------------------- |
| `ZTooltip.delay`         | `ZTooltip.openDelay`       | 单位仍为 ms；仅 pointer 首次打开延迟，keyboard focus 即时。             |
| `ZTooltipGroup.delay`    | `ZTooltipGroup.openDelay`  | Group 默认 500ms；局部 Tooltip 的显式值优先，warmup/cooldown 协调不变。 |
| `ZTour.closeOnEscape`    | `ZTour.dismissOnEscape`    | 默认 true；控制顶层 Layer 的 Escape 关闭。                              |
| `ZTour.closeOnMaskClick` | `ZTour.dismissOnMaskClick` | 默认 true；仅控制 mask click，不等同任意 pointerOutside。               |

这些是 unreleased API 的集中改名，不提供旧名称双轨兼容。全局 entrypoint 与自动生成 API/catalog 合同由同批集成步骤统一再生成。`PresenceEntryMotion` 是私有 runtime 类，不新增全局 public export。

共享尺寸统一使用 `xsmall / small / medium / large / xlarge`。控件尺寸、面板尺寸、虚拟行几何与文字大小可共享名称但必须保留各自用途和 token；无视觉尺寸意义的 Root 不扩容 API。语义色按组件职责选择，不为菜单、导航或无 DOM Root 强制凑齐五色。

## 第二批：五档尺寸与视觉落地

基线 `bf1e01c`。控件实际目标高度为 24/28/32/40/48px，控件字级为 11/12/14/16/16px，indicator 为 12/14/16/20/24px。统一复用 `controlSizeStyles` / `controlSizeMetrics`，不为每个家族复制高度/字级表。

| 家族           | 第二批落实                                                                                                            | 保留理由与职责边界                                                                                                                              |
| -------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Accordion      | Root size → Trigger 字体、间距、最小高度、indicator；block/inline 保留独立布局                                        | Content 正文布局由内容拥有，不随控件行高强制缩放。                                                                                              |
| Tabs           | Root size → Trigger；补 enabled hover、border-box、不可压缩/不换行的完整长标签                                        | 横向列表负责滚动；Panel 不增加 tone 或控件高度。                                                                                                |
| Menu           | Root size 通过 context 传 Item/Label/indicator；新子菜单默认继承父 size                                               | MenuItem 的 danger 布尔语义明确，暂不增加五色或破坏性改名；单选点保持相对 indicator 的小标记比例。                                              |
| DropdownMenu   | Content.size 传内部 bare Menu；Trigger 的 Button size 独立                                                            | 无 DOM Root 只管理打开与定位，不添加冗余 size。                                                                                                 |
| ContextMenu    | 同 DropdownMenu；默认名称改为 localePack.collection.contextMenu，补中英文                                             | 保留原生 aria-label 覆盖；坐标锚点不拥有控件大小。                                                                                              |
| Command        | 输入与命令行消费共享五档；说明/快捷键分层字级，标签可断长词；active 背景统一 surfaceHover                             | 原 query、filter、active-descendant 与行动职责不改变。                                                                                          |
| CommandPalette | size 传 Command/内置 Trigger/Close；panelSize 传 DialogContent；透传 filter/shouldFilter/maxResults/loop/resultsLabel | `shouldFilter=false` 直接展示外部搜索结果，仍受 maxResults 截断；不新增网络请求 owner。                                                         |
| Pagination     | size 统一按钮、原生 input/select、icon、状态文字；显式值 → Provider pagination.size → density                         | pageSize 始终表示每页条数，不重命名为视觉 size。                                                                                                |
| Tree           | 节点文字、图标、switcher 五档；默认虚拟 itemSize 来自同档主题高度                                                     | 数字直接消费；rem/calc 在实际 owner DOM 测为 px，SSR 暂用默认主题同档数字；显式 itemSize 优先且取消虚拟 item 的冲突 minHeight。事件命名不扩迁。 |
| Dialog         | Content.size 消费 dialogXsmall/Small/Medium/Large/Xlarge：320/400/512/640/768                                         | Root 无 DOM，保留状态职责；Title 使用独立 xlarge=20px 字级。                                                                                    |
| AlertDialog    | Content 自动继承 Dialog 五档；Action 默认 solid danger，Cancel 默认 outline neutral                                   | onAction 仍表示业务动作，不机械改为 onConfirm；pending/generation 合同保持。                                                                    |
| Drawer         | 五档专用尺寸 256/320/400/560/720；full/custom 与逻辑 placement 保留                                                   | size 属于沿滑入轴的面板宽/高，不等同内部按钮尺寸。                                                                                              |
| Popover        | 使用 Floating 实际解析后的 data-placement 选择朝向锚点的缩放原点，删除固定向上偏移                                    | 通用内容不存在统一行高，保留业务内容自行组合尺寸；不向无 DOM Root 强塞 size。                                                                   |
| Popconfirm     | 自动继承 Popover 新入场/定位原点；Action solid danger、Cancel outline neutral，按钮继承五档 API                       | 确认面板继续使用专用 popconfirm 宽度 token；不把行尺寸误当面板宽度。                                                                            |
| Tooltip        | Content.size 五档字级/高度/内边距，垂直留白与 compact 行高联动；inverseSurface/inverseText/tooltipMaxWidth            | Trigger 保持 Button 的独立尺寸；内容严格非交互，不添加无意义 tone。                                                                             |
| Tour           | size 同步正文、面板留白、按钮；首次入场使用 PresenceEntryMotion；opacity 使用 enter/exit，步骤位置几何仍 standard     | 目标定位和遮罩几何由步骤内容拥有；不以按钮尺寸改变 target 或 spotlightOffset。                                                                  |

13 个相关 Docs 页面新增 `ControlSizesDemo.svelte`。Menu/Dropdown/Context 展示尺寸继承；Tree 同时展示普通/虚拟树；Palette 展示外部结果与 maxResults；Dialog/Drawer 展示专用面板尺寸；Tooltip/Tour 展示内容与动画。第一方导航/浮层 Button 消费者完成 primary→solid、secondary→outline 迁移，Action metadata 同步；取消操作明确使用 neutral。

新增 `NavigationSizesFixture.svelte` / `navigation-sizes.browser.spec.ts`，为 CI 验证五档真实高度/字号、两类面板宽度、Tree rem 解析与显式 itemSize、Tooltip 自定义 inverse/宽度 token、Palette 搜索透传与边界键盘行为。原 disabled audit fixture 补齐 Tree 可访问名称。没有在本地执行这些测试；第二批分小组 WebStorm errors-only 未返回问题。

## 验证

- 三批 WebStorm `lint_files(min_severity="error")` 分别检查行为/改名源文件、共享动画及其消费者、新增定向回归，返回空问题列表；首个 Tooltip `get_file_problems(errorsOnly=true)` 独立 smoke 也为空。
- `navigation-overlay-audit.browser.spec.ts` 与专属 fixture 为 CI 检查真实 opacity、cursor、首帧、中间帧、最终进入、退出保留、默认打开、reduced motion 与长词布局。
- `presence-entry-motion.spec.ts` 为 CI 检查 owner Window、重复 update、迟到帧、退出重开、减少动画、SSR 初态及跨 realm / destroy 清理。
- 既有 `drawer-production.browser.spec.ts` 的 entering/entered 断言保持适用；既有 Tooltip/Tour fixtures 与类型用例已迁移新命名。
- 本地没有运行这些测试、构建或全量类型检查。Svelte MCP 未在本会话注册，不能执行 svelte-autofixer；用已验证可达的 WebStorm 文件诊断提供本地证据。浏览器及完整 CI 结果由后续集成记录补齐，不能从静态检查推断通过。

## 前一提交 CI 失败复核

在下一次 push 前读取已完成的 [run 34006402280](https://github.com/kenconnet666/zadmin/actions/runs/34006402280)，确认 head 为 `bf1e01c4f1c4e040ef42ec8aa3fd46aac922abb4`。没有等待或轮询新 CI。

- Static contracts 与 Windows desktop 都被 `apps/desktop/src/routes/+page.svelte:235` 遗留的 Tooltip `delay` 属性阻断；已补成 `openDelay`。
- ContextMenu / modal Popover / Mention 的几何断言立即读取进入帧：Popover 宽 73.8828125 对期望 75.390625、Mention 高 254.8 对期望 260 均恰好是 `scale(0.98)`；ContextMenu x=122.26 对期望 120 也是原中心缩放造成的偏移。现在组件测试和 Docs ContextMenu E2E 先等待表面 opacity=1 且自身 transition 无 running/pending，再保持原有精确坐标和宽高断言；不改成宽松误差或关闭实际动画。
- 本批 `NavigationOverlayAuditFixture` 的 Tree 缺少可访问名称导致禁用视觉回归提前抛错，已补 aria-label。
- 三个 Docs 浏览器的两个 Theme Lab 检查仍固定期待 29 个颜色，前一提交实际 41 个；由集成步骤迁移为当前 schema 合同。
- `input-api-audit.browser.spec.ts:76` 在三个浏览器都得到 reset 后 data-state=open，而期望 closed；前一行 value=Initial 已通过，后续事件计数尚未执行。已把精确证据转交输入组件代理。
- Workspace 另有 `transfer-production.browser.spec.ts` 的浏览器连接关闭错误，没有组件源码 stack 能证明 Transfer 功能错误。Workspace 最终报告 14 断言失败、1444 通过、2 skipped，同时有该未处理的执行中断；不能认为剩余计划用例已全部执行。Coverage 为 5 断言失败、816 通过，失败归属如上。

上述定向修复仅完成 Prettier、逐文件 WebStorm errors-only 与 diff-check；没有在本地执行测试，不借用旧 CI 宣称当前改动通过。
