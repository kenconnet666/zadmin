# 通用、布局、展示与反馈组件逐族审计

基线：`3b4536f`，2026-09-06。范围是 Docs 对应的 36 个根组件家族；Toast 包含 ZToaster 和内部 QueuedToast。本轮核对当前公开类型、recipe、Theme 消费、相关状态逻辑与 Docs，不把静态阅读等同于全状态浏览器验收。

已阅读现有 API 审计台账、Docs dogfooding、主题视觉、Typography、Button/Toggle、展示面、Statistic/Timeline 和 Alert/Spinner/LoadingBar 架构。旧报告已修复的 Code 换行、Tag 字号、Link 导航高度、List 字重等不重复登记为新缺陷。

并行主任务已确定后续颜色合同为 `ZSemanticTone = neutral | info | success | warning | danger`，品牌 `primary` 独立。下表记录审查基线的现状；其中旧颜色词的迁移建议将以该已定合同执行，尚未在本批修改组件颜色 API。

## 本批确定修复

- **Badge**：CSS 时间字符串先转换为毫秒；无计数变化时切换 reduced motion 立即取消现有动画；恢复完整动画不会重播旧数量；进入曲线消费 Theme `easing.enter`。详见 [Badge 专项](./badge-motion-audit-2026-09-06.md)。
- **Skeleton**：三个默认宽高分支原先把 `size.medium` / `size.skeletonLine` 无条件拼接 `px`，合法的 `2rem` 会成为 `2rempx`。现在使用内部 `cssLength`，数字转 px，CSS 字符串原样保留。显式 `width` / `height` 的校验与优先级不变。
- **Timeline**：轴宽 CSS 变量原先把 `size.small` 无条件拼接 `px`，合法 CSS 长度会使 grid 列定义无效。现在使用同一个 `cssLength`。
- `cssLength` 放在已有 `theme/units.ts`，仅承担序列化；Theme 输入校验继续由 `defineTheme` 拥有，不增加新的公开 entrypoint API。
- 新增小型 `ThemeLengthProductionFixture` / browser spec，使用数值、自定义属性、rem 和 calc 作为真实尺寸 marker，断言 Skeleton 圆形/矩形/多行的几何尺寸、显式尺寸覆盖、Timeline 轴实际宽度。用例已编写，未在本地执行。

## 36 族完整状态

表中“保留”表示本轮在所查视觉/API 边界未发现明确的新缺陷；不表示全部行为、平台或视觉组合已验收。“建议”等待共享合同定案，不属于已经实现。

| 家族 | 当前尺寸/颜色/排版/动画合同 | 本轮结论与后续动作 |
| --- | --- | --- |
| Provider | 无 DOM；density、motion、Theme、componentDefaults | 保留独立偏好轴；共享五档尺寸定案后同步 defaults 的类型和运行时白名单，不把 density 改为五档 size 别名。 |
| Box | 中性 div；原生属性与 ICSS | 保留；无有意义的 size/tone/motion API。 |
| Text | 五个 fontSize、四个 tone、Theme weight/lineHeight、truncate/lineClamp | 语义与排版分离合理；补齐共享语义色，避免 success/warning 正文只能自行写 CSS。 |
| Heading | level 1–6 与视觉 size 独立；共享文字轴 | 保留 level；与 Text 同步语义色和字号命名，不能将字号档位等同 heading level。 |
| Icon | 三个具名 size + full + number；颜色继承 | 具名 size 消费控件尺寸 24/32/48px，Docs 大量改用数字 16/18；建议独立 icon 比例 token 和五档命名，保留 numeric/full 真实使用场景。 |
| Code | 五档文字 size，inline/block，wrap，复制与延迟恢复 | 本轮未发现新明确缺陷；保留代码配色，不能强制使用普通文本 tone。 |
| Button | 三档控件 size；variant primary/secondary/ghost；tone default/danger；Provider reduced | 优先统一尺寸和语义色；variant 可改 solid/outline/ghost，让强调形式与 tone 独立；小号按钮的默认 Spinner 当前也为 24px，需随图标比例一起调整。 |
| ToggleButton | 复用 Button 视觉，新增 pressed 单一状态 | 随 Button 迁移；保留独立 pressed/onPressedChange，不复制第二套色盘或组选择运行时。 |
| Link | text/button/navigation；文字 tone primary/muted/danger；按钮复用 Button | 保留原生 anchor 与 href；同步 Button 变体/尺寸和正文语义色，Docs 明确各 appearance 的有效轴，避免将文本字号与控件高度混用。 |
| Separator | orientation、decorative、label；1px 横/竖线 | 保留语义；固定 1px 可改为现有 hairline 边框 token，不增加五档 size/tone。 |
| VisuallyHidden | 视觉隐藏，保留辅助技术内容 | 保留；不得添加视觉规模、色彩或动画轴。 |
| Kbd | 原生 kbd，固定 small 字号与紧凑内边距 | 保留当前语义；若实际工具栏需比例变化，优先复用文字 size，不能把它当可点击控件强套高度。 |
| Stack | direction、align、justify、gap、wrap；gap 支持 Theme/number | 保留布局职责；gap/space 命名随共享 token 同步，不添加 tone/motion。 |
| AspectRatio | 原生 aspect-ratio；positive number 或 width/height pair | 保留；比例不能与五档尺寸混为一轴。 |
| Container | size small/medium/large/full，最大宽 40/64/80rem；gutter | 建议 size 语义改成 maxWidth 或明确文档为容器宽度；固定断面宽度可用专用 Theme token，不能映射控件高度 token。 |
| Avatar | 三档独立 size，circle/rounded/square，原生图片与 fallback | 可扩展同名五档、保留独立头像几何比例；不为统一加入业务状态 tone；grapheme 修复已有证据，不重复处理。 |
| Badge | 两档 size；default/accent/success/warning/danger；计数强调动画 | 本批修复 duration/reduced/easing；后续尺寸、tone 命名随共享合同迁移，保持 count/dot 语义。 |
| Card | outlined/elevated、elevation、bodyPadding、固定分区 | 保留；bodyPadding 只控制正文是明确合同，不改成含混 size，也不让 Card 变成整卡按钮。 |
| DescriptionList | dl、数据或手动模式、responsive、loading | 保留；term 小号、description 正文的层次清晰，先通过 Theme 排版调整，不强塞控件 size。 |
| List | ol/ul、数据或手动模式、loading、有限 item/action snippet | 保留；前轮 label normal 字重已修，不重复；密度需求应有真实用例再加。 |
| Tag | 两档 size；default/accent/success/warning/danger；可移除 | 五档若应用于 Tag，需同时定义移除按钮与文字的几何比例；当前移除按钮最小 24px，使 small 可移除 Tag 比静态 Tag 更高，必须作为明确组合合同验证。 |
| Progress | line/circle；四 tone；专用 progressLine/progressCircle 尺寸 token | 保留范围、原生 progress 和 reduced；补齐共享语义色时保持 circle 与 line 一致；size 如新增应解释为进度条厚度/圆直径，不能复用控件高度。 |
| Meter | 原生 meter、low/high/optimum、状态派生 | 保留；颜色由量程语义拥有，不添加可随意覆盖含义的 tone。 |
| Skeleton | shape、width/height、lines、animated；Theme pulse/reduced | 本批修复默认 CSS 长度；animated 是组件开关，motion 是用户偏好，两者继续独立。 |
| Empty | title、description/children、actions、headingLevel | 保留默认无状态语义；不因为 Result 有 tone 就给 Empty 强加成功/失败状态。 |
| Timeline | start/alternate、status/tone、time、pending；图标可组合 | 本批修复 Theme 轴长度；保持时间顺序与纯展示；tone 用词待统一，不把 status 改成颜色。 |
| Statistic | number/bigint、Intl、precision/formatter、静态 trend、固定 value xlarge | 建议 valueSize（文字规模）和独立 trendTone：当前上升恒 success、下降恒 danger，无法表达错误率下降为好事；无需加入数字动画状态机。 |
| Table | 原生 table；三档 density；caption、单一 scroll owner | 保留 density 职责；不改成控件 size，header small 与正文层次按 Theme 验证。 |
| VirtualList | itemSize/estimateSize/height/overscan；按 key controller；reduced smooth scroll | 保留几何和虚拟化 API；这些尺寸是测量值，不能换成五档控件 size。 |
| DataTable | Table density、列宽/行高、选择/排序/展开、virtualized | 保留；尺寸统一应作用于内嵌控件与密度，不把 rowHeight 数值改成 size；API 命名后续可考虑 onExpandedChange→onExpandedKeysChange 以呼应实际值。 |
| Carousel | items/key/value、loop、autoplayInterval、焦点/悬停/隐藏/reduced 暂停 | 保留轮播职责；autoplayInterval 是节奏，不是 Theme 转场速度，不机械改为五档 motion。 |
| Alert | 四状态 tone、title/body/action/dismiss、live | 增加中性说明状态有实际价值；与 Badge/Tag 的 accent/info 统一词汇，仍保留非颜色图标和显式 live。 |
| LoadingBar | local/page、active/state/value、完成延迟与 controller | 保留；state 代表生命周期、finishDelay 是展示驻留，不能与 tone/动画时长混为一轴。 |
| Result | 四 tone、title/content/actions、headingLevel | 与 Alert 同步状态语义；Result.content 与 Empty.description 是相近内容命名，保留 children 主路径，文档避免双选；不需要为统一再加第三个别名。 |
| Spinner | 三档 size；primary/muted/inherit；Theme spinnerSpin/reduced | 建议独立五档图标比例；保留 inherit 以适配 owner 前景，不把等待图标强制扩成成功/错误业务反馈。 |
| Toast | 四 tone、有限通知内容；queue、priority、暂停、进入/退出 | 状态色统一，但 timeout/priority 与 motion 继续独立；QueuedToast 曲线仍写死 ease，可后续改为 enter/exit Theme 曲线。 |

## 优先建议与具体源码落点

1. **控件高度与图标大小分离**：`gene/ZIcon.svelte` 的 size recipe、`feedback/ZSpinner.svelte` 的 size recipe、`gene/ZButton.svelte` 的 spinnerSize。默认控件 small/medium/large 为 24/32/48px，图标完全复用该尺度不适合较小按钮；不能仅扩枚举而忽略内容比例。
2. **语义色命名分离强调形式**：Button 的 `variant="primary"` 和 `tone="default"` 均指向 primary 色；Tag/Badge 称 accent，Alert/Toast/Result 称 info（实际同样消费 accent），Typography/Progress/Statistic/Timeline 又称 primary。共享合同应先明确五个语义词及中性/继承文字角色，再改类型、recipe、验证白名单、componentDefaults 和 Demo。
3. **排版规模避免混淆**：`gene/typography.ts` 仅允许四 tone；Text/Heading/Code 已有五档字号，但档位是 small/medium/large/xlarge/xxlarge，不能与控件 extraSmall→extraLarge 生搬硬套成相同像素。Container.size、Statistic valueSize、Progress 的厚度/直径也需分别命名或明确含义。
4. **趋势方向不等于好坏**：`data-display/ZStatistic.svelte` 的 trend recipe 将 up 固定 success、down 固定 danger；新增有限 trendTone 比要求业务覆盖内部 CSS 更直接。默认策略可保留兼容，但应展示“错误率下降为成功”的真实 Demo。
5. **运动参数保留边界**：Badge 本批先修正确性；Skeleton pulse 仍写死 ease-in-out，QueuedToast 仍写死 ease。后续 Theme 曲线矩阵应区分 pulse 与进入/退出，不用通知驻留 timeout 或轮播间隔充当转场时长。

## 验证边界

WebStorm 对 `units.ts`、Badge/Skeleton/Timeline、Badge fixture/spec、ThemeLength fixture/spec 八个实现与测试文件，以及 Badge Docs `doc.ts` 的最终 errors-only 诊断均为零错误且没有超时；`git diff --check` 通过。本批未运行本地 svelte-check、Vitest、Playwright、完整构建或长测，新增浏览器回归等待 CI。36 族表是本轮 API/样式源代码审计记录，不宣称 36 族所有交互和主题视觉都已通过浏览器。
