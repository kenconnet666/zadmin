# E17：真实执行证据与可复用拖放

本批承接E16，不把新能力数量或静态stable声明当作验收通过。两条工作线并行：先让远程CI提供可归因、绑定提交的逐组件执行结果，再以共享拖放能力接入已有集合和表单数组。该文件记录执行范围，未勾选的交付不是已完成事实。

## 依赖决策与组合边界

2026-09-07在线核对官方文档及npm registry：`@dnd-kit/dom`和官方`@dnd-kit/svelte`均为0.5.0、MIT；后者peer为Svelte `^5.29.0`，与当前workspace兼容。官方Svelte层已经提供createDraggable/createDroppable/createSortable的attachment与生命周期，可优先复用，不再自行复制pointer/keyboard sensor、碰撞、自动滚动和实体注册。[Svelte quickstart](https://dndkit.com/svelte/quickstart/)、[传感器](https://dndkit.com/extend/sensors/)、[自动滚动](https://dndkit.com/extend/plugins/auto-scroller/)

官方0.4更新明确移除了Svelte默认OptimisticSortingPlugin，避免和Svelte 5 reconciliation冲突。ZUI最终数组顺序继续由业务owner控制，拖放只提出请求，不在DOM或独立数组中保存第二份顺序。[官方更新记录](https://dndkit.com/changelog/)

StyleInjector支持CSP nonce，但这不能直接证明符合ZUI的class-only/CSP合同。首次集成必须核对Feedback、sortable位移和drop animation实际生成的style、top layer、ShadowRoot和Portal行为；不能只向StyleInjector传nonce就宣称CSP通过。主题时长/easing、reduced motion、owner document和卸载都通过ZUI统一入口传入。[StyleInjector](https://dndkit.com/extend/plugins/style-injector/)

拖放同时提供可见的移动按钮或菜单，复用ZButton/菜单、live公告和移动后焦点恢复；不能要求每个使用者只能完成拖动手势。Atlassian的无障碍指南也把可操作替代入口、结果公告和继续操作列为共同职责。[Atlassian accessibility](https://atlassian.design/components/pragmatic-drag-and-drop/accessibility-guidelines/)

| 职责                        | 复用对象                                  | 本批边界                                         |
| --------------------------- | ----------------------------------------- | ------------------------------------------------ |
| 完整逻辑项、视图、typed key | LogicalCollection / LogicalCollectionView | 拖放DOM不成为逻辑顺序owner                       |
| DOM ref与焦点               | MountedElements                           | 同key替换、跨容器重挂、owner realm和清理         |
| 拖动机制                    | 官方dnd-kit Svelte/DOM                    | sensor、collision、auto-scroll由依赖实现         |
| 数据变更                    | FormArray operations.move及上层owner      | 请求接受后更新；拒绝/取消不写canonical           |
| 样式和动效                  | ICSS / Theme / motion                     | 统一五档、focus、目标指示、落点反馈、动态reduced |
| 移动替代操作                | ZButton / Menu / live region              | 同一移动请求合同，不复制第二条写值路径           |

首个真实消费者选择FormList单容器重排，其FormArray已经有稳定row id与接受/拒绝协议。之后依次承接Transfer跨容器插入、Tree的before/after/inside及后代拒绝、DataTable行/列重排。当前DataTable的sort descriptor与拖放reorder是不同职责。

远程跨页选择另立集合子合同：当前`all | Set`会在toggle时物化为已加载项，不能表示all-filtered和excluded keys。后续用服务端DataTable验证query scope与例外集合，不把它塞进拖动会话。

## 远程执行证据

现有maturity schema3只声明静态合同。E16时Vitest未配置结构化reporter，内置JSON又丢失browser project身份，因此本批新增Reporter记录真实TestModule.project与浏览器配置，保留逐测试的完整名称、定义位置、attempts、跳过、失败、取消和未捕获错误。仅显式配置输出路径时启用，默认本地体验不变。

- report必须有精确revision、run id、run attempt和runner版本。
- Chromium/Firefox/WebKit身份取实际配置，不从数组顺序或同文件出现次数推断。
- composer复用maturity的源码归属事实，不能再维护另一套组件名正则。
- 精确test block失败可以归因；shared file失败只能阻止通过，不能断言其中所有组件都失败。
- 缺报告、skip、todo、取消、flaky和缺环境均不能提升Verified。
- Docs Playwright先作为生产全局gate，不把同一个全站E2E文件粗糙归给全部组件。
- Desktop保留已有结构化证据verifier，不从job成功直接推导DesktopVerified。
- runtime报告只进入CI artifact，checked-in基线继续显示pending；summary重算并校验输入hash、revision、run、组件身份和路径。

## 本批已落盘

- 共享inventory从maturity生成器抽取，静态门槛保持原有语义。直接renderer alias（例如render的窄类型断言）也通过AST识别，不能靠函数名字伪造。当前186组件对应2845份合同，均能归属到具体test block；其中171份为同block视觉合同。AST识别真实render/mount、直接alias及fixture import，字符串和注释不能伪造归属；无法精确归属时仍保留shared-file保守边界，visual不降级。
- Vitest仅在ZUI_EXECUTION_REPORT显式启用时写报告并开启includeTaskLocation，保留default reporter。记录真实runner版本、unit/browser身份、specifications输入hash、完整测试名称/位置、最终失败、重试、expected failure和取消。
- Docs在原line/html reporter之外按CI浏览器增加JSON，config.metadata绑定revision/run/attempt/browser。每个producer上传专用小artifact；声称成功却缺报告必须失败，不能只上传空diagnostics目录。
- 新component-execution-evidence job在现有独立gate结束后组合并复验。成功要求真实输入与当前提交、运行、环境吻合；Production另要求static、build、coverage、packages、workspace及Docs三浏览器通过。参数化同定义位置的所有实例都必须通过。
- runtime输出component-execution.json和component-maturity.runtime.json，随后用显式--maturity/--revision/--out生成artifact内stability-candidates.runtime报告。不会回写checked-in基线或修改组件status。Desktop合并仍留给后续现有verifier接线，本批不从Windows job状态提升DesktopVerified。
- 根代理用独立临时目录跑过实际CLI组合、独立复验和runtime stability：模拟失败producer且无报告时，结果为partial、三个Verified为0、141个stablePendingExecution；模拟成功producer但缺报告时明确拒绝。临时输入及约4.6MB生成报告已按已核对路径清理。这些合成输入只验证报告协议，不代表组件测试已执行。

拖放依赖已核对发布tarball及实际生命周期、plugins、nonce、inline style和owner接受协议，详见[适配边界](./dragdrop-adapter-boundaries-2026-09-07.md)。官方Svelte自定义Sortable plugins可重新带回OptimisticSortingPlugin，必须在窄适配层封住；动态reduced立即生效，默认公告不能先于业务接受结果。

## 推送前读取的E16结果与修复

[E16 CI](https://github.com/kenconnet666/zadmin/actions/runs/34095313140)已经完成：workspace build、Chromium/Firefox Docs、外部ZUI+SvelteKit tarball TypeScript/SSR验收通过，external TS2590问题得到实际复验。静态检查、组件测试、覆盖率、Windows类型步骤及bundle gate仍有失败；WebKit Docs为212通过、1个Cascader搜索点击失败，继续按失败trace定位，不用重试或延长timeout遮盖。

本批按日志修正日期转换helper与mode/period泛型边界、私有HTML rest展开、nullable preset、Vitest Browser异步render与fixture导出取法、SSR null match及非法derived副作用；TimeGrid在受控value进入slot比较前规范化，非法字符串报告明确Time边界错误。bundle检查改看实际module/import metadata：日期组件合法打包internationalized/date，基础runtime仍不得引入这些领域依赖，浏览器包不得泄漏未解析基础包或compiler/server代码；不会再把错误提示中的包名字面量误认为依赖。没有运行本地bundle/build或完整suite，实际候选仍待新CI。

Cascader trace确认搜索input持焦点时pointer动作已命中option，但强制移焦列表的路径未完成提交。候选修复抽出focusCollectionForPointer，Cascader、Transfer和TimePicker列共用：读取owner realm/ShadowRoot中的真实active element，保留通过aria-controls拥有该列表的搜索输入，其他路径仍聚焦列表。原有键盘/controller focus不变；Cascader与Transfer专项使用真实pointer输入，ShadowRoot焦点另有资产。提取trace文件已清理，原始CI压缩包保留；WebKit修复须由下一候选执行确认。

本地Chrome插件已实际fill desktop并pointer click对应路径：输出platform/native/desktop，浮层关闭，trigger恢复焦点，横向溢出0、控制台无error。该点查只证明当前Chromium路径，不能代替新候选WebKit执行。

## 交付次序

1. Vitest结构化reporter及独立序列化自测；远程运行报告。
2. 共享测试归属inventory、composer/verifier和严格负例；Playwright JSON与最终CI evidence job。
3. dnd-kit最小集成与CSP/样式/生命周期验证；确认能符合ZUI边界后公开便利API。
4. FormList重排与按钮替代操作，共用业务请求和FormArray操作。
5. Transfer/Tree/DataTable真实消费；主题、动画、控制、键盘/RTL和虚拟化按族验收。

本地仅做IDE诊断、快速脚本验证和必要浏览器点查；长suite、跨浏览器、构建和包验收由CI执行，不在本任务轮询等待。
