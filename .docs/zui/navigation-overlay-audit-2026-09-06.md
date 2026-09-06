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

## 16 族记录

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

共享尺寸后续统一使用 `xsmall / small / medium / large / xlarge`。控件尺寸、面板尺寸、虚拟行几何与文字大小可共享名称但必须保留各自用途和 token；无视觉尺寸意义的 Root 不扩容 API。语义色按组件职责选择，不为菜单、导航或无 DOM Root 强制凑齐五色。

## 验证

- 三批 WebStorm `lint_files(min_severity="error")` 分别检查行为/改名源文件、共享动画及其消费者、新增定向回归，返回空问题列表；首个 Tooltip `get_file_problems(errorsOnly=true)` 独立 smoke 也为空。
- `navigation-overlay-audit.browser.spec.ts` 与专属 fixture 为 CI 检查真实 opacity、cursor、首帧、中间帧、最终进入、退出保留、默认打开、reduced motion 与长词布局。
- `presence-entry-motion.spec.ts` 为 CI 检查 owner Window、重复 update、迟到帧、退出重开、减少动画、SSR 初态及跨 realm / destroy 清理。
- 既有 `drawer-production.browser.spec.ts` 的 entering/entered 断言保持适用；既有 Tooltip/Tour fixtures 与类型用例已迁移新命名。
- 本地没有运行这些测试、构建或全量类型检查。Svelte MCP 未在本会话注册，不能执行 svelte-autofixer；用已验证可达的 WebStorm 文件诊断提供本地证据。浏览器及完整 CI 结果由后续集成记录补齐，不能从静态检查推断通过。
