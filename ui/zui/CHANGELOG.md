# @zadmin/zui

## 0.2.0

### Minor Changes

- b0692db: Flatten ZAccordion's Svelte component props while retaining strict exported single and multiple configuration helper types and runtime value-shape validation.
- c876927: Migrate Accordion and Tabs compound components to the shared typed LogicalCollection,
  MountedElements, and CollectionNavigation runtimes. Add explicit nullable selection and active owners,
  dynamic nearest-enabled recovery, nested Accordion heading/region contracts, and Tabs automatic/manual
  activation with keep-mounted, lazy, and active-only panel lifecycle policies.
- a40b309: Add typed native responsive image attributes, an image ref and load/error callbacks, keyed source-attempt isolation, and explicit decorative fallback semantics to ZAvatar.
- c876927: Replace the ambiguous text-pill Badge with a production count/dot anchor contract, logical RTL placement, overlap, complete accessible counts and reduced-motion-aware updates; move status text to Tag.
- c876927: Add a real size-aware square shape contract to ZButton so icon actions no longer leak an ineffective native `shape` attribute.
- b0692db: Separate Button hierarchy variants from semantic tones, add circular icon shape, replace the mixed danger
  variant with `tone="danger"`, and use an aria-hidden ZSpinner overlay that preserves loading width. Align
  ToggleButton with the shared variant, tone, size, and shape recipe while keeping pressed as its only state.
- a40b309: Make ZCard a neutral div surface by default, add explicit div/article/section roots, elevated and outlined variants, media/footer/actions composition, and an accessible Skeleton-backed loading state.
- 75d8500: Add typed Carousel control, position, jump, and localized role-description messages, while keeping explicit control labels as the highest-priority overrides. Prefer native `aria-label` and retain the camel-case alias as deprecated compatibility.
- 0d4e496: Migrate Cascader to LogicalTree-backed column collections with typed paths, clear and readonly contracts, loaded-path search, abortable lazy branches, fixed-row virtualization, Field ownership, and FormValueBridge reset semantics.
- 75d8500: Add optional fixed-row VirtualList handshakes to authoritative, ungrouped Select and Combobox options while keeping
  their existing listbox- and input-focus ownership, active-descendant, filtering, async orphan, loading, form, and
  readonly contracts. Compound, grouped, dynamic-height, and sticky-group virtualization remain explicit errors.
- b0692db: Add a block-only, localized ZCode copy action with safe Clipboard failure reporting, owner-window feedback cleanup, Lucide state icons, and a typed onCopy result contract.
- a40b309: Use GitHub's high-contrast Shiki themes as the supported ZCode light and dark token palettes so syntax highlighting preserves WCAG contrast in documentation and consumer surfaces.
- 4b6e0d7: Add nullable and clearable ColorPicker values, typed presets, readonly and Field sizing contracts, shared FormValueBridge reset ownership, and a production Popover surface over native color, hex, and alpha inputs.
- 75d8500: Add a localized, overridable Command result-count live status and connect it to the focused combobox through `aria-describedby`.
- aefde2b: Scope `ZCommandPalette` shortcuts to its trigger or portal DOM root, and add an explicit `shortcutTarget` override for Document, Element, and ShadowRoot integrations.
- a0e8f1d: Add the runtime-only DataQuery normalization and fingerprint contract together with AsyncCollectionQuery latest-wins orchestration. These helpers keep fetching, caching, routing, component values and open state outside the component layer while providing strict serializable queries and abortable request state.
- 1bd553c: 统一Calendar、DateField、DatePicker与DateRangePicker的Provider timeZone和类型安全date locale合同，使Picker成为ZField唯一业务owner并隔离内部Calendar，同时补齐select-only combobox与readonly合同；TimeField改为从locale pack继承segment、AM/PM文案和默认hourCycle。
- 0d4e496: Productionize the date and time system around explicit nullable owners, localized editable segments, controlled
  Calendar focus, unavailable-date/time constraints, partial and normalized ranges, owner-realm popovers, typed locale
  copy, Field/FormValueBridge/reset integration, and reusable bare field composition. DatePicker and DateRangePicker now
  combine editable DateField controls with Lucide calendar and clear actions rather than a display-only trigger.
- d149583: Complete modal Dialog focus and ARIA ownership, add generation-safe caller-owned AlertDialog actions with Cancel-first focus, and move Popover Presence/focus restoration fully into the owner realm.
- b0692db: Productionize ZList and ZDescriptionList as real ul/ol/li and dl/dt/dd collections with typed keys, mutually exclusive data/manual composition, bounded rich/action snippets, external ZEmpty/ZSkeleton states, responsive RTL-safe long-content layout, and an explicit ZVirtualList/DataTable boundary.
- 1f1e2c4: Repair component composition, typography, and public API forwarding discovered through real Docs usage.

  - Add explicit utility-layer recipes, button/navigation appearances for native links, Card body padding, and accessible Table scroll-region references.
  - Preserve exact Code source whitespace and line geometry after highlighting; align Tag/Text/Button typography with theme tokens.
  - Register logical border tokens and reject unknown ICSS accessors at type/runtime boundaries; valid unmodeled CSS values remain available through `.raw()`.
  - Unify Select, MultiSelect, and RadioGroup size inheritance, honor local trigger disabling, and synchronize virtual Transfer disabled semantics.
  - Remove menu slots and relationship IDs that were silently overwritten from public types; preserve native lifecycle and hover/focus callbacks alongside internal behavior.

  Docs now consumes shared cards, accordions, navigation links, table scrolling, and code copying instead of duplicating those UI implementations. Test inventories explicitly distinguish authored evidence from executed page-level acceptance.

  Migration: remove child `id` on Root-owned relationship nodes and reserved `leading`/`trailing` slots on menu indicator wrappers. Where supported, set the ID on the Root (`ZPopover.triggerId` or input Root `id`). Invalid fluent ICSS accessors that previously did nothing now throw; replace them with a modeled accessor or `.raw(validCssValue)`.

- 43b3ed4: 收口Drawer生产合同：复用Dialog单一modal内核，增加预设、number与CSS自定义尺寸并修正full
  viewport边界；Dialog统一解析auto/full/reduced动画偏好和Trigger所属Document/ShadowRoot
  Portal边界，并修复Portal、FocusScope、DismissableLayer、inert与scroll lock在iframe realm中的
  ownerDocument判断；补齐嵌套层、焦点恢复、滚动锁、dismiss策略及多示例文档证据。
  新增owner-realm requestAnimationFrame进入帧协调，避免新挂载的Content与Overlay跳过进场；
  将Dialog Presence退出计时绑定到真实内容的owner Window并在销毁、重开时取消；
  自定义尺寸拒绝CSS声明注入，并暴露placement、size与motion语义data state。
- 75d8500: Add typed feedback locale defaults and apply them to alerts, loading indicators, toast viewports, and toast dismiss actions.
- b0692db: Productionize Alert with semantic Lucide tone icons, explicit live-region and localized dismiss ownership; add Spinner tones and aria-hidden composition semantics; and add scoped LoadingBar local/page lifecycle control with determinate, indeterminate, success, error, owner-realm timing, visibility and reduced-motion cleanup.
- 4b6e0d7: Replace the experimental File array upload surface with an immutable typed queue, explicit manual or opt-in automatic application transport adapter, progress/error/abort/retry commands, owner-realm request cleanup, Field readonly/disabled semantics, and a native `formdata` File bridge. Add complete locale labels, production documentation, fixtures, and browser contract sources.
- 75d8500: Add typed FieldPath registration, dependency-aware field validation, a form controller, full Standard Schema issue
  paths, DOM-order error navigation, form-level state inheritance, and warning/success field messages while preserving
  native FormData and reset behavior.
- 3b4536f: Preserve native interaction inside Field label snippets, ignore blank feedback, expose Field anatomy/state metadata, and keep helper/error typography compact and wrapping. Add opt-in feedbackMinLines to Field/FormField so asynchronous feedback can reserve theme-relative space without clipping longer messages. Reject conflicting ancestor/descendant FormData paths consistently without depending on entry order.

  Retire queued change/blur validation when submit or explicit full-form validation takes ownership. Prevent readonly NumberField/PinInput keyboard edits, block incomplete number drafts from native submission, and correctly synchronize PinInput native clear events. Expand executable Docs examples and targeted multi-browser regressions while keeping Unicode segmentation delegated to Intl.Segmenter with an explicit code-point fallback.

- 1ffeb1d: 加固ICSS级联、Theme、已有基础组件和包边界，增加按需Shiki代码展示入口，让Docs直接消费组件单文件metadata；同时删除多余`src/lib`层、集中package entrypoints并移除未被生产代码使用的`@zadmin/zui/core`入口；抽取内部Theme focus ring并门禁全部可见原生input/textarea的focus-visible或focus-within合同；基础原生控件默认生成SSR稳定id，调用方id与Field controlId保持优先；Table、Code与Docs导航使用逻辑start/end文本对齐保持RTL一致。
- 75d8500: Add a typed-key VirtualList controller with dynamic item measurement, scroll anchoring, key/index positioning,
  SSR viewport estimates, owner-realm observers, reduced-motion scrolling, mounted-item/active-descendant
  handshakes, collection semantics, and explicit loading and empty states while retaining the fixed-height fast
  path.
- a40b309: Make ZLink a production native-anchor contract with required href typing, explicit Lucide external-link visuals, secure target=_blank rel merging, localized hidden new-window hints, non-navigable disabled semantics, long-target wrapping, and complete native download/current-page documentation and browser/SSR evidence.
- 75d8500: Move RadioGroup and Segmented to the shared logical collection, navigation, mounted-element, and single-selection runtimes; add typed options, controlled clear and dynamic focus reconciliation, and move Segmented form ownership to FormValueBridge. Deferred nearest-focus recovery now stops at owner teardown instead of reading destroyed Svelte derived state.
- 75d8500: Add the shared `LogicalTree` model and migrate `ZTree` and `ZTreeSelect` to typed hierarchy metadata, container-owned active descendant focus, controlled expansion and selection, strict checkbox selection, lazy child loading with abort/error/retry lifecycle, `FormValueBridge`, and the keyed `ZVirtualList` mount handshake. TreeSelect now supports an explicit `null` empty value, clear, Field ownership, readonly safety, lazy data, and virtual trees without duplicating the Tree state machine.
- 0d4e496: Migrate Mention suggestions to LogicalCollection and ActiveDescendant, add async loading and custom item contracts, and support fixed-row virtual suggestion lists without moving DOM focus from the native textarea.
- 75d8500: Migrate MultiSelect to the shared logical collection, multiple-selection, active-descendant, mounted-element, and
  form-value runtimes; add authoritative typed options, groups, async orphan labels, readonly/loading/empty states,
  tag overflow and clear behavior, optional ungrouped fixed-row virtualization, and the unified
  `value/defaultValue/onValueChange` API while retaining explicit deprecated plural aliases.
- 18b174f: Add recursive structured-member metadata and path-aware lifecycle documentation for nested public data shapes. List, DescriptionList, Timeline, DataTable columns, Select options, and RadioGroup options now expose complete member fields; scoped `id` to `key` migration facts no longer confuse conditional identity branches with unconditional required fields. Caller-owned generics, external protocols and descriptors, and dynamic records now publish explicit opaque ownership metadata instead of fabricated member shapes. Callable metadata now publishes validated parameter order, names, optional/rest semantics, generic payload members, and array boundaries for Form submission and FileUpload transport/rejection callbacks.
- 75d8500: Complete NumberField with explicit external clearing, locale-aware editing and display, precision-safe stepping, parser and formatter hooks, out-of-range policy, typed locale defaults, Field density, FormValueBridge reset, IME handling, and owner-realm motion.
- 75d8500: Resolve `auto` motion from each component's owner Window, share one media-query listener per realm, and apply the final `full` or `reduced` decision consistently to CSS transitions, Accordion Presence, Carousel timers, and feedback animations. Add semantic Theme durations for loading bars, spinners, indeterminate progress, and skeleton pulse animations.
- 87a7c45: 生产化ZPagination：保留totalPages兼容合同，新增互斥totalItems/pageSize计数模式、受控页尺寸与原生选择器、default/simple/compact呈现、Provider类型化locale、RTL方向键与动态焦点恢复，并补齐DataTable外部owner组合和分层契约文档。
- d149583: Productionize ZPinInput around one nullable canonical OTP value, Field ownership, FormValueBridge, external forms, Unicode graphemes, IME composition, paste/autofill distribution, dynamic length, bounded autocomplete and mask semantics; productionize ZInputGroup around exactly one registered business control, complete Field state and focus projection, separated affix/action regions, nested and multiple-owner rejection, responsive RTL layout, and reduced-motion focus styling.
- 0d4e496: Unify Menu, DropdownMenu, ContextMenu, and nested submenu behavior on LogicalCollection, MountedElements, CollectionNavigation, locale-reactive typeahead, and the existing Popover layer runtime. Add controlled checkbox and typed radio items, real link items, RTL-aware submenus, dynamic nearest-focus recovery, ArrowUp/ArrowDown menu-button entry, cancellable cross-submenu actions, pointer/keyboard context anchors, viewport-bounded popup scrolling, and dedicated production documentation and browser contracts. PopoverContent now exposes typed cancellable Escape, focus-outside, and pointer-outside callbacks so nested layers can close the correct menu chain without duplicating document listeners.
- 75d8500: Add a typed default accessible name for Progress through the Provider locale pack while preserving explicit business labels.
- b0692db: Add shared Progress tones and indeterminate text with high-contrast circular geometry, strict native Meter ranges and formatter context, and static or multi-line Skeleton placeholders with reduced-motion ownership.
- 65bf392: 增加共享`ZControlSize`与`resolveControlSize`，让Button、Input和Textarea在未显式指定`size`时继承Provider density，同时保持显式尺寸优先。
- a0e8f1d: Add strict Provider-scoped defaults for Button, Input, Tag, Card, DataTable, and Pagination, plus public Form controller field-state subscriptions. Explicit component props and nearest field contexts remain higher priority, while values, pages, selections, callbacks, DOM, and CSS stay caller-owned; subscriptions observe immutable field state without owning values.
- 22b9269: 建立真实的`unreleased`组件版本事实与可生成的Props API合同；修复可清空绑定的初始fallback、Form reset唯一owner、NumberField本地化reset、Popover等宽定位，以及Field对Combobox和Transfer复合控件的标签、ARIA、FormData与辅助输入所有权。
- 75d8500: Add focusable readonly contracts to Checkbox, Slider, RadioGroup, and Segmented, preserving FormData and owner updates while suppressing user mutation callbacks, enforcing Field/Form safety boundaries, and allowing focus-only collection navigation.
- b0692db: Separate operation Result from collection Empty with real ZHeading levels, decorative Lucide defaults, explicit rich content or description and actions, responsive long-content layouts, and no hidden loading ownership.
- d73776c: 发布`auroraLight`、`paperLight`、`neonDark`、`midnightDark`、`highContrastLight`与`highContrastDark`六套主题预设、独立server-safe Theme入口，以及ZLink、支持语义/装饰模式的ZSeparator、ZVisuallyHidden、ZKbd、ZAspectRatio和ZContainer无状态基础组件；同步扩展ICSS属性合同、组件metadata、Docs真实Demo、可访问性说明和bundle门禁。
- 09db694: 增加无浮层交互基础设施、ZToggleButton、ZCheckbox、ZRadioGroup、ZSwitch、ZSlider、ZAccordion、ZPagination与ZTabs，覆盖稳定ID、Collection、Selection、列表导航、typeahead、Presence、表单值、roving focus、受控状态、混合checkbox、原生表单reset、pointer/RTL交互、locale页码、ARIA语义、reduced-motion过渡和Lucide控制图标；修复多边界分页窗口的省略号身份，并同步复合组件Docs和bundle门禁。
- 2594d05: 增加独立`@zadmin/zui/layer`入口与LayerStack、Portal、DismissableLayer、FocusScope、scroll lock、inert others、Floating UI定位基础设施，以及ZPopover、ZTooltip、ZDialog、强制显式决策的ZAlertDialog、逻辑方向ZDrawer和就地危险操作ZPopconfirm消费者；同时按foundation、collection、form、layer职责重组runtime目录，保持基础runtime不打入浮层依赖；退出Presence依赖inert移出Tab序和可访问树，避免焦点恢复前叠加aria-hidden；FocusScope在cleanup时解析最新Trigger，支持Provider更新期间替换触发节点；Tooltip打开时拒绝交互语义或可聚焦后代并引导使用Popover。
- 7c82e7d: 增加S4集合输入基础能力、菜单与选择组件、ZSegmented、ZTagsInput、严格ARIA ZTree、复用TreeIndex的ZTreeSelect与逐级路径ZCascader、双collection过滤的ZTransfer、光标感知ZMention，以及相关性ZCommand和Dialog组合ZCommandPalette；统一Collection、键盘、共享可取消事件、表单和Popover定位/dismiss能力，并为Select/MultiSelect增加未挂载Item时的`valueLabel`格式化合同。
- f111a68: 增加S5 Form与结构化输入组件，并统一原生表单、受控状态、Field语义、locale解析、验证与资源清理合同；表单reset按同document的结构化form身份、实时关联、DOM包含与显式form id判定归属，不依赖跨WebKit包装不稳定的`instanceof`；在组件root、关联form与document监听非composed事件，节点action在mount微任务检测最终root/form变化并按需重绑，再于原生默认动作后交给Svelte调度状态；Input/Textarea增加`onFormReset`组合回调；补充受控Arrow图标并统一Transfer、DataTable与Docs导航图标合同。
- 16ef2c8: 增加基于CalendarDate与Time值模型的DateField、TimeField、Calendar、DatePicker和DateRangePicker，并统一locale、键盘、Popover和表单合同；Calendar导航、NumberField步进与TimeField周期按钮复用内部动作的hover、disabled和focus-visible合同。
- 1a1e057: 增加Avatar、Badge、Tag、Card、List和DescriptionList，并提供图片回退、调用方持有的移除动作与原生文档语义合同。
- 2208faf: 增加Progress、Meter、Skeleton、Empty、Timeline和Statistic，保留原生范围、列表、时间与数值语义，并共享reduced-motion清理合同。
- fef944d: 增加Alert、Spinner、LoadingBar、Result、Toast和Toaster，以及显式ToastQueue、自动超时、多原因暂停、页面隐藏暂停与reduced-motion生命周期。
- a4365aa: 增加Carousel稳定slide collection、显式rotation control、焦点/hover/reduced-motion暂停和受控值合同。
- c1c7dce: 将DataTable生产化为原生table语义的数据表面：修复受控defaultSort清空，增加client/server排序所有权、
  typed-key LogicalCollection/SelectionModel、选择与展开受控模型、列可见性和可访问列宽调整、逻辑方向sticky、
  保留旧数据的loading/error/empty反馈、服务端分页ARIA位置，以及带动态测量、锚点保持和聚焦控制器的行虚拟化。

  DataTable仍不提供单元格编辑、clipboard、pivot、聚合、Excel式二维焦点或列虚拟化；这些能力保留给独立DataGrid/X轨道。

- 42c1780: 增加原生语义Table、固定项高VirtualList和共享virtualizer范围/滚动定位内核，为DataTable与Tree大数据模式建立可验证基础。
- a4365aa: 增加Tour真实目标解析、四片spotlight遮罩、Floating定位、LayerStack Escape所有权和跨步骤FocusScope恢复合同。
- 2f55246: 为Tree增加固定项高虚拟模式，使五千节点仍保留全局键盘、层级ARIA、稳定选择和受控展开合同。
- 65bf392: 让Select和MultiSelect成为ZField的唯一业务控件owner，统一Trigger标签、描述、无效与必填语义、FormData和reset，并让Select在已有值建立后支持外部`undefined`真实清空。
- 46a8918: Unify semantic interaction colors, typography, and compact disclosure styling across the component system.

  - Add `surfaceHover`, `primarySubtle`, `primarySubtleHover`, `accentSubtle`, `dangerSubtle`, `successSubtle`, `warningSubtle`, `onPrimary`, and `onDanger` color tokens. `extendTheme` derives related colors when their sources change; explicit overrides win.
  - Apply shared colors to buttons/loading indicators, navigation links, choice and menu items, tags, alerts, danger badges, and selected calendar cells.
  - Add the `fontSize.xxlarge` token, support it in Heading/Text/Code, and expose an explicit Code `size` API. Add AccordionTrigger `appearance="inline"` for compact disclosure controls without application-specific trigger CSS.
  - Keep navigation heights consistent with the control size scale, remove implicit bold emphasis from plain List labels, and make Alert text use its own theme foreground and typography.
  - Finish an in-flight Presence exit immediately when reduced motion changes its duration to zero.

  Migration: consumers manually constructing complete themes through `defineTheme` must add the new color and font-size tokens; prefer `extendTheme(defaultTheme, patch)`. Theme duration values are now typed and validated as non-negative millisecond numbers or concrete `ms`/`s` values because JavaScript lifecycle timers cannot resolve `var()`/`calc()`. CSS expressions remain available for dimensional tokens. Invalid token types, blank strings, and out-of-range numeric values fail at theme construction.

- 79b14ed: Darken the default, Aurora light, and Paper light semantic tone tokens so `ZTag` text keeps WCAG AA contrast against its real mixed canvas and surface backgrounds.
- b0692db: Complete the small Separator, VisuallyHidden, Kbd, AspectRatio, and Container contracts with named high-contrast boundaries, strict finite ratios, border-box responsive gutters, and focused documentation evidence without expanding their responsibilities.
- b0692db: Productionize ZStatistic with deterministic Intl locale and precision, pure formatting, bigint machine values, bounded affixes, semantic tone and trend text, and ZSkeleton loading; productionize ZTimeline as a real ol/li typed-key event collection with content/icon/time snippets, status tones, pending/reverse ownership, and responsive RTL-safe alternate layout while keeping timers, number animation, Steps navigation, horizontal mode, and commercial timeline features outside these focused state machines.
- c259613: Mature `ZSwitch` with Provider density, Field readonly semantics, busy loading state, a state-aware indicator snippet, slot-backed visual structure, and system-aware reduced motion while preserving its native checkbox FormData and reset contract.
- d149583: Productionize Tag with typed localized remove labels, finite sizes, semantic tone surfaces, safe long content and explicit standalone versus compound focus/propagation ownership. Add a native responsive Table scroll owner that preserves real caption/table refs, inherits density and becomes a named keyboard region only on measured horizontal overflow.
- 4b6e0d7: Rebuild TagsInput around ZTag, CollectionNavigation, Field ownership, and FormValueBridge; add keyboard tag navigation, optional editing with transform and validation, focus-safe visual overflow, and consistent controlled draft and multi-value reset semantics.
- 4645a38: 生产化ZTextarea：增加有界autosize配置，以ownerDocument/defaultView隔离iframe与ShadowRoot测量，按Document共享单一测量节点，移除不再使用的runed运行时依赖，并补齐宽度、字体、隐藏恢复、卸载清理、Field状态、外部form reset、IME与真实示例合同。
- d6b30da: Expand typed ICSS with native CSS system colors, theme-resolved breakpoint queries, focus-offset and easing tokens, sticky/page-loading roles, and large surface shadows. Add eight explicit light/dark primary palettes and independent ZCard elevation, with shared enter/exit easing for Dialog, Popover and Tooltip.

  Remove pre-release deprecated aliases instead of carrying compatibility branches: use localePack, LogicalTree, IcssDynamicSlot, keyed collection items, native aria-label and form callbacks, value/defaultValue/onValueChange, ZSegmented.options, ZLoadingBar.mode and current date/number-field APIs. Callers, type contracts and docs migrate together; old aliases are no longer accepted.

- df7d006: Add ToastQueue ownership diagnostics and optional debug names, document caller-owned queue replacement, and make dispose an idempotent terminal boundary whose late tasks cannot recreate records.
- 065b0e0: 重构显式ToastQueue和ZToaster生产生命周期：增加FIFO queued/visible/exiting阶段、仅入场后计时、多原因暂停、Presence与reduced-motion退出、Provider Portal边界、稳定id更新及公平maxVisible容量，并补充完整文档示例与浏览器合同。
- c876927: Add explicit partial Toast updates, generation-safe caller-owned task feedback, owner-window timers, Escape dismissal, and centralized de-duplicated polite/assertive Toaster announcements.
- c876927: Add a scoped TooltipGroup coordinator with owner-Window warmup/cooldown timers, one active tooltip per group, immediate keyboard focus behavior, hoverable but strictly non-interactive content, trigger activation dismissal, and an explicit non-tabbable wrapper strategy for native disabled buttons. Add Popconfirm async confirmation ownership with pending duplicate prevention, generation-safe resolve/reject handling, controlled-close invalidation, localized safe error fallback, polite error announcement, and retained Cancel/Escape/outside focus restoration.
- 75d8500: Make Tour production-ready with scoped and ShadowRoot-safe targets, centered steps, close/skip/wait missing-target policies, typed locale defaults, configurable spotlight and scrolling, cross-realm observers, focus branches, RTL, and Presence motion.
- 75d8500: Migrate Transfer to one authoritative typed LogicalCollection with independent source/target views,
  SelectionModels, CollectionNavigation, ActiveDescendant, MountedElements, locale-aware typeahead, async orphan
  preservation, readonly/loading states, repeated FormData/reset, auxiliary filters, and optional fixed-row virtual
  panes while preserving stable item-order moves.
- 65bf392: 增加可继承的类型安全`localePack`与英文/中文默认包，将Pagination、Calendar、DateField、TimeField、选择集合、Command、Transfer、FileUpload、TagsInput和ColorPicker迁移到可动态切换的标量或参数化文案；Provider新增默认UTC的显式`timeZone`，日期组件在SSR与客户端统一使用同一IANA时区，同时保留旧`translations`字符串字典作为有限的渐进兼容层。
- a40b309: Productionize Text with Theme line-height, validated multi-line clamping, and tabular-number support,
  and add a semantic Heading primitive that always renders a real h1–h6 while keeping heading level and
  visual typography tokens independent.

### Patch Changes

- c876927: Fix MenuGroup label-registration reactivity, use native button Menu items, expose DataTable resize handles as focusable ARIA separators, and remove unsupported FileUpload/Transfer ARIA attributes discovered during cold Chrome acceptance.
- b0692db: Preserve the identity actually published through bindable imperative controllers so Tree, DataTable, VirtualList, and FileUpload can clean up without comparing a Svelte state proxy to the original controller object.
- ad45e1f: Defer Table overflow measurement to the owner-window ResizeObserver layout callback instead of forcing layout during mount and reactive DOM updates. Keep a coalesced animation-frame resize fallback when ResizeObserver is unavailable, preserve the one-pixel overflow keyboard-access contract, and reconnect/clean up observers when bound elements or scroll mode change.
- 75d8500: Resolve control size consistently as explicit prop, then Field or Form size, then Provider density across Input, Textarea, Switch, Checkbox, and Slider.
- a01f99a: 统一Select、MultiSelect、Combobox、DatePicker、DateRangePicker与Transfer的隐藏FormData序列化、外部form关联和唯一reset生命周期；无业务值时不再提交空的代理字段。

  将共享form reset回调延后到owner Window的下一任务，确保WebKit原生reset default action完成后再恢复受控segment值，同时保留取消、去重与owner-realm清理语义。

- 894ef6a: Keep text-control Provider size defaults consistent across Input, InputGroup and Textarea; add native disabled/readonly visual states without multiplying disabled opacity inside a group. Make Code.wrap handle unbroken tokens through typed ICSS overflowWrap while preserving source text and intentional scrolling.

  Preserve a complete grapheme in Avatar fallback, harden Badge offset and visual-state inputs, and expose accurate state metadata. Expand interactive Docs demonstrations for provider defaults, code wrapping, avatar shape/size and badge size/tone/placement, with targeted runtime and browser regressions.

- c876927: Keep Mention active-descendant ownership on the textarea and delegate pointer selection through the listbox without duplicate click-only option semantics or invalid ARIA focus relationships.
- 75d8500: Resolve overlay portal roots, resize and mutation observers, delayed tooltip/form work, focus transitions, and virtualized measurement from their owning document, Window, or ShadowRoot instead of ambient browser globals.
- c876927: Treat undefined recipe and slot-recipe selections as omitted so optional component props preserve declared default variants instead of failing at runtime.
- a40b309: Preserve immutable controlled-state identity with raw Svelte state, freeze nested FormData values without mutating pre-frozen arrays, choose the truly nearest virtual alignment, isolate nested Accordion item scope, and project Field control ids through Cascader and ColorPicker popover triggers.
