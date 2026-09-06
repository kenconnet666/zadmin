# 输入组件逐项 API 与视觉合同审计

日期：2026-09-06。代码基线：`3b4536f`。本表覆盖 Docs 的全部 27 个输入组件家族，Select、MultiSelect、Combobox、RadioGroup 的 compound 成员归入根组件，FormField 归入 Form。

本轮逐项读取公开 Props、运行时状态消费、Field owner 与辅助输入边界、尺寸 recipe、语义颜色、动画及 Docs 使用点。表中的“源码复核”只代表本轮源码检查；浏览器几何、视觉和交互回归另行列明，不能用旧审计或 metadata 的 stable 标记代替本轮运行证据。

## 本批实施

| 问题                                                     | 修复与可见结果                                                                                                                                                                                         |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Combobox 隔离 Field 后未投影尺寸                         | 根组件新增 `size`，context 显式传递已解析尺寸；输入优先级为 Input 显式 size > Combobox 显式 size > Field size > Provider density。原有 value、inputValue、open 三轴与辅助输入表单边界不变。            |
| Segmented 无尺寸轴，文字依赖浏览器按钮默认样式           | 增加 `size` 与 Field/density 继承；选项使用主题 sans、字号、紧凑行高、高度与水平留白。默认 medium；本批先补已有 small/medium/large，五档扩容由共享尺寸阶段统一实施。                                   |
| Mention 已打开建议未读取 Field 的动态 readonly/disabled  | 根组件读取 Field 状态并贯穿打开、键盘、pointer 选择和输入防线；Field 变为只读或禁用会关闭建议。真实 Textarea 继续拥有 Field，不建立第二个表单值 owner。                                                |
| Mention 接受但吞掉 onFormReset                           | 显式消费回调；重置值、查询和打开状态后调用一次。Docs 受控示例加入 Field 只读/禁用切换和真实原生 form reset。                                                                                           |
| DateField/TimeField 的 onReset 名称模糊                  | 公开回调改为 `onFormReset`；与 Input、Textarea、Mention 的原生表单重置通知一致。内部 FormValueBridge 的 onReset 保留。                                                                                 |
| FileUpload 禁用透明度叠乘                                | 根组件独占 disabled opacity；dropzone 仅保留禁用 cursor；由根精确选择自己队列中的 action button 清除重复 opacity。若主题 disabled=0.4，dropzone 和队列操作不再变为 0.16。                              |
| DateRangePicker 的 Group 与两段 DateField 重复降低透明度 | DateRangePicker 通过自己实际输出的 range-inputs、start-field、end-field part 精确处理直接嵌入的 DateField 和 suffix action，保留 Group 的一次透明度。规则不穿透 Portal，也不修改其他 InputGroup 子孙。 |
| Calendar 和 FileUpload 原生按钮遗漏主题字体              | Calendar 根显式消费主题 sans/medium/normal，日期按钮继承；FileUpload dropzone 显式消费同一主题排版，避免浏览器按钮默认字体绕过 Provider 主题。                                                         |

新增真实 Docs 示例：Combobox 尺寸继承与显式覆盖、Segmented 尺寸和主题排版；Mention 既有受控示例扩展 Field 状态与 reset 计数。DateRangePicker 实际输出既有 start-field/end-field part，并登记共享 range-inputs part。

## 27 个家族台账

| 家族              | 本轮源码结论                                                                                        | 尺寸、主题与后续重点                                                                                                                               |
| ----------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| checkbox          | checked/defaultChecked/onCheckedChange 保持 boolean 或 indeterminate；原生 value 是提交载荷，不改名 | 现有三档 indicatorSize、Field 状态和 accentColor；五档增加指示器尺度，不把其高度误设为整行输入高度。无需为动画添加公共 prop。                      |
| calendar          | CalendarDate 与 focusedValue 分离，range 只负责呈现；locale/timeZone/unavailable 命名明确           | 修复主题字体；五档需同时覆盖 root gap/padding、导航按钮、weekday 和 date cell，日历单元宽度独立于文本控件。                                        |
| cascader          | path value、typed nodes、load context、serializeValue 有明确职责；根已继承 Field size               | 五档由主触发按钮贯穿；搜索输入和虚拟行是辅助 UI，行高不从控件尺寸盲算。searchable 是有意义能力，不为统一改为 filterable。                          |
| color-picker      | value 是标准化颜色或 null；原生 color/range 为辅助编辑器；主表单值明确                              | 根 size 已投影触发控件；presets 是实际业务颜色，不当作 tone。数值范围与透明度语义不变。                                                            |
| combobox          | 修复 Field size 断链；value/inputValue/open 分离、onInputValueChange 与 onValueChange 保留          | 新根 size 和 context；Input 可显式覆盖。候选列表 typography/virtual 行高可单独复核，不等同输入高度。                                               |
| date-field        | value/null 与 partial segments 区分；formParticipation 明确控制辅助嵌入                             | onReset 改为 onFormReset；五档覆盖 root gap/padding、segment 字号和高度，不能遗漏 year 字段宽度与分隔符。                                          |
| date-picker       | trigger、calendar、清空 action 已使用 resolvedSize；CalendarDate 与业务表单桥接明确                 | 五档需保留主触发与日历单元各自度量。invalid 表达校验，不需要另加五种装饰 tone。                                                                    |
| date-range-picker | range start/end 与预览范围的所有权明确；唯一 FormValueBridge 提交                                   | 修复禁用透明度与真实 part；五档作用于两段日期、按钮、日历，窄视口需检查整体宽度而非单个输入高度。                                                  |
| input             | 原生 props 与业务 value/defaultValue/reset 保留；Field/Group/defaults 优先级已有实现                | 共享三档 minimum height、padding、font；五档必须同时扩 recipe 与 defaults 类型。原生 input 字体仍建议纳入全局控件排版阶段复核。                    |
| input-group       | 唯一业务 owner、affix/action 分工明确；Input/Textarea 的禁用视觉已有直接子项规则                    | 五档覆盖 affix 和 action 留白；不向非交互 prefix/suffix 偷塞按钮，也不通过全后代 opacity 覆盖掩盖其他组合错误。                                    |
| mention           | 修复 Field 状态防线及 onFormReset 丢失                                                              | 继承 Textarea size/autosize；建议文本、业务插入值、typed item.key 职责不同，不为了形式把它们都重命名为 value。                                     |
| multi-select      | 主 value/defaultValue/onValueChange 已统一为 typed key 数组；open 独立                              | 根和 Trigger 已继承 size；内嵌 tag/remove/clear 仍需五档比例复核，虚拟列表高度保持独立设置。                                                       |
| number-field      | value 为已提交数字，parser/formatter 处理显示与草稿；空值 undefined；原生 min/max/step 有明确语义   | 五档必须同时扩按钮宽度和输入 recipe；内部输入字体及无边框组合总体高度需浏览器确认。inputId 与 controlId 名称差异可后续统一，但本批不制造无关迁移。 |
| pin-input         | value 是完整串，格子为辅助编辑；length/OTP/readonly 防线明确                                        | 五档覆盖 gap 与每格长宽、字号；字体保持 mono，避免用全局 sans 覆盖用途字体。                                                                       |
| field             | label/description/error/warning/success 是反馈语义；错误派生 invalid                                | size 当前主要影响间距并传入控件；文本层级可独立设计，不能把五种语义色强行变为五种校验状态。                                                        |
| file-upload       | files/defaultFiles/onFilesChange 描述带状态的文件队列，controller/transport 分工明确                | 修复一次禁用透明度和 dropzone 字体；保留 files 名称。尚无公共 size；若后续补密度应同时设计 dropzone、队列和操作区，而不是只改根 padding。          |
| form              | FormField 注册与 schema、controller、errors 分工明确；原生 onsubmit/onreset 保持小写                | size 经 FormField 传至 Field；Form 作为状态容器无独立绘制尺寸和 tone，不需要强塞视觉 props。                                                       |
| radio-group       | typed options 和单选值独立；子 radio 保留原生 FormData/defaultChecked                               | 根已传递 size，Item 可覆盖；五档修改 indicatorSize recipe，普通标签文字应与对应控件密度协调。                                                      |
| select            | value/open/值标签缓存分离；Root 与 Trigger size 优先级明确                                          | 五档自动投影 Trigger，但选项行、Check 图标和长标签需要单独比例复核。                                                                               |
| segmented         | 新增缺失的 size、主题字体与行高，保留 roving focus 和只读浏览合同                                   | 五档扩展单一 recipe；选中使用 primary 前景和 canvas 表面，不因全库 tone 计划强制引入不必要色轴。                                                   |
| switch            | checked/defaultChecked 与原生 value 分开；loading、readonly、disabled 有独立含义                    | 现有 motion 处理 Provider/系统偏好；五档必须成组扩根宽高、thumb 宽高与 travel，不能只扩 root。                                                     |
| tags-input        | value 为标签数组，inputValue 为草稿；transform/validate 属于每个标签的提交策略                      | root/input 已有 size，但 ZTag、overflow 标签默认中号，编辑 input/button 固定 small；五档阶段需成组修复比例，避免外框变大而内容不变。               |
| textarea          | 原生多行、IME、rows、autosize 与 reset 合同明确                                                     | 已消费主题 sans、Provider input defaults 与 Field/Group size；五档同步字体和 padding，autosize 按实际行高测量，不固定总高度。                      |
| time-field        | Time 值、granularity、hourCycle、minuteStep/secondStep 语义明确                                     | onReset 改为 onFormReset；五档覆盖 segment 与 day-period 按钮，保留 mono 数字用途与本地化。                                                        |
| tree-select       | nodes/expandedKeys/业务 value/null 与树加载分工明确                                                 | 根已传递 size；virtualized + height/itemSize/overscan 与选择族 virtual* 命名不同，建议后续独立迁移到统一虚拟化名称，避免仅改一个 prop。            |
| transfer          | 主 value 是目标集合 typed keys；每侧 checked/query 是局部辅助状态                                   | 当前无 size，过滤 input 固定 small。后续可补统一密度，但必须同步列表项、双面板和动作；virtualHeight 不应被 size 重写。                             |
| slider            | 保留原生 range、min/max/step、value 与 readonly 防线                                                | 当前 size 影响 indicatorSize 中的逻辑 block-size，原生 thumb/track 外观仍由平台负责；不要声称五档 thumb 样式已经完全自定义。                       |

## 共享五档与命名边界

推荐使用项目既有拼写 `xsmall / small / medium / large / xlarge`，不再引入 xs 或 extraSmall 这一套别名。保留三档 Provider density，它表达整页疏密策略；五档是显式控件选择，两者无需同数量。Text/Heading/Code 继续使用自己的文字层级，不能把字号机械绑定为控件 size token 数值。

共享扩容必须检查 `control-size.ts`、componentDefaults、Field/Form contexts、组件 recipe、公开 metadata 和 Docs/生成 API 合同。对于 Switch 要同步 travel；对于 Checkbox/Radio/Slider 要检查 `blockSize/inlineSize` 实际映射的 indicatorSize；对于 Calendar 要保留独立日历 cell 宽度。不能只放宽类型而遗漏运行时 recipe。

本轮没有给所有表单控件增加 tone：输入错误状态由 invalid 和 Field 反馈表达；日历选中态、选项选中态使用主题 primary；文件上传的成功、失败与进行中来自真实状态。全局五种语义颜色应先补齐主题前景/背景/悬停合同，再为确有表达需求的组件提供选择。

保留 `value/inputValue/open` 等受控轴及相应回调，不把原生 onchange、oninput、onsubmit、onreset 改为自定义大小写。`files` 是上传队列、`nodes` 是树结构、`items` 是条目集合、`options` 是选择选项，名称应反映语义而非追求全部同名。

## 参考依据

- [Chakra UI Segmented Control](https://chakra-ui.com/docs/components/segmented-control)：根组件提供 size、value、onValueChange、orientation；其当前配色演示也明确默认组件不直接提供完整 colorPalette 设计。这支持先补尺寸与真实状态表达、按组件需要决定色轴。
- [React Aria ComboBox](https://react-aria.adobe.com/ComboBox)：组合输入的输入文本与选中值拥有独立控制方式。ZUI 保留已有 inputValue/value 分离，不照搬 React 的回调参数包装或类名样式系统。
- 既有项目基线：`api-audit-progress-2026-09-05.md`、`form-api-audit-2026-09-05.md`、`theme-visual-audit-2026-09-05.md`、`icss-theme-token-audit-2026-09-05.md`。旧文档记录只用于理解合同，不当作本轮已执行证据。

## 验证与迁移

新增 `InputApiAuditFixture.svelte` 与 `input-api-audit.browser.spec.ts` 四条回归，检查真实几何/字体、动态 Field 状态关闭 Mention、原生 reset 回调次数、FileUpload/DateRangePicker 禁用透明度及 Calendar 字体。测试已编写，本地未运行；完整浏览器执行交给本提交 CI。

WebStorm 已完整检查本批组件、context、Docs 示例与 teaching、新增 fixture/spec，返回 errors=[]。最早一次 context 单独检查曾 timedOut=true，后续同文件完整复验返回 errors=[]。本批文件已定向格式化，git diff --check 通过。当前会话没有 Svelte MCP 工具，未以调用不到的 autofixer 冒充完成；没有运行 svelte-check、TypeScript 全量检查、构建或本地浏览器测试。

迁移：将 `<ZDateField onReset={handler}>`、`<ZTimeField onReset={handler}>` 改为 `onFormReset`。全仓搜索发现手写 Docs 的两个 teaching 项需要同步，当前没有其他真实组件调用方。生成的 API、teaching、token 等合同由共享基础设施批次统一刷新；内部 FormValueBridge/FormResetSignal 的 onReset 与原生 Form.onreset 不改名。
