# Field / Form / NumberField / PinInput 第二批 API 审计

基线为 `894ef6a4943dab124366681af8eea455b4907422`；中途独立提交 `2dfaba3` 修正 autocomplete 跨浏览器断言。本轮包含四个根组件家族及 FormField 子组件；没有扩大到所有选择器或浮层，不声明全库已经审计完成。

## 已确认问题与处理

| 范围                             | 复现或风险                                                                 | 修复与验证                                                                                                                                              |
| -------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Field label snippet              | 说明链接的 click 被 Field preventDefault，并把焦点转走                     | 普通标签只聚焦 compound owner，composedPath 中的交互元素保留原生行为；确定性测试修复前失败、后通过，Docs 链接实际跳转                                   |
| Field feedback                   | 纯空白 error 被算作 invalid；p 默认 margin 和长消息造成不一致间距/溢出     | 过滤空白消息但不裁剪有效消息原文；共享字号/行高/换行与零 margin；验证 aria-describedby 所有目标存在，清空后没有残留关系                                 |
| Field anatomy                    | label/description/error 等真实结构未公开 Parts；readonly/required 状态缺项 | 补 data-slot 与 metadata，保持已有 label/control ID 和无包装 children 结构                                                                              |
| FormData / Registry              | 同时存在 profile 与 profile.email；一个顺序抛错，反向顺序会构造错误数组    | 注册时提前拒绝祖先/后代冲突；实际 FormData 转换使用 typed prefix 索引检查，两个顺序统一抛明确错误；同路径多实例、正常嵌套值和重复原生值保留             |
| FormField htmlName               | 空名称的字段不能作为成功表单控件提交                                       | 注册阶段明确拒绝空 htmlName，与 FormValueBridge 的既有合同一致                                                                                          |
| Form validation scheduling       | 已排队的 change/blur 微任务在完整校验之后启动，令完整结果 outdated         | 清理调度时递增 generation，旧微任务不得再启动验证或删除新调度记录；submit、controller.validate、reset/destroy 使用一致边界                              |
| NumberField readonly             | readonly/disabled 仍吞掉 step/navigation 键                                | 提前返回，不步进也不 preventDefault；只读复制、原生光标行为保留                                                                                         |
| NumberField partial draft        | 输入 - 或 . 后文本非空但尚无可提交新数值；可能提交空值或旧值               | 不完整非空草稿设置 native custom validity，包括可选字段；value/FormData 保留已提交值但表单不能提交草稿，blur 按既有策略恢复。有效空值仍由 required 决定 |
| PinInput readonly / native clear | Backspace/Delete 修改只读值；原生 input 空字符串又被旧字符填回             | 只读删除不写入且不截获原生删除事件；方向导航仍可用；真正的空 input 事件删除逻辑字符，非法非空输入恢复旧值                                               |
| PinInput Unicode                 | 缺少 Intl.Segmenter 的环境不能保证完整 grapheme                            | 继续使用 owner realm Intl.Segmenter；降级明确为 code point。不引入手写部分 UAX 分段器，也不宣称旧平台具有完整 Unicode 分段支持                          |

Field 的交互边界依据 [HTML label activation](https://html.spec.whatwg.org/multipage/forms.html#the-label-element)：交互后代及其内部内容有自己的激活行为。复合控件普通标签仍只聚焦，不自动展开。

新增 `ZField.feedbackMinLines`（`ZFormField` 透传），默认 0 保留紧凑布局；非负整数按反馈的 `lh` 行高预留空间。大于 0 时空反馈 live region 保持挂载，超长消息仍可增长而不是被裁剪。Form 的异步示例为两个字段各预留一行，减少反馈消失时保存按钮移动；没有在 Docs 单独写一套反馈样式。

## 文档演示

- Field：error/warning/success、清空反馈、标签中的说明链接；description 和反馈使用共享主题 token。
- NumberField：增加真正的提交结果展示，输入未完成草稿后按 Enter 可观察 native validity；重置恢复初值/反馈。
- PinInput：清空值、只读/编辑切换、外部清空；保留 RTL、OTP/paste、动态 length 的现有示例。
- Form：修正 onreset 的时序描述——原生 reset 事件阶段同步回调，可 preventDefault 阻止复位；明确 FieldPath/htmlName 边界，继续使用现有可操作 FieldGraph 示例。

## CI 反馈的分类

- `33953483735` 的 Workspace component tests 有 1627 项通过，唯一断言失败是 Firefox 的 autocomplete IDL 读取。组件 content attribute 保留正确；测试改为同时要求 attribute 正确、IDL 与同一表单内的原生 input 一致，独立提交 `2dfaba3`。
- `33954167673` 后续出现浏览器 RPC/连接关闭，未产生组件断言失败；只重跑该作业后通过，没有放宽门禁或屏蔽 unhandled error。
- 同一 run 的 Docs Firefox 截图显示 submitted=true、errors=0、validating=false、result=none。排查确认了两个独立问题，不能单凭截图或 Playwright 的 click action done 推断第二次 submit 确实发生。
- queued-validation 缺陷由同回合 input → requestSubmit/controller.validate 的确定性回归覆盖；复用现有 validationEpoch，取消先前排队的 blur/零延迟微任务，不额外维护一套相同的生命周期计数。
- 另用最小事件探针复现按钮位移：8 次中 2 次只有第一次 submit，第二次 pointerdown 在保存 span 上，pointerup/click 却落到父 DIV。测试现在先验证 change 错误反馈已清除，再点击；未增加 sleep 或放宽 timeout。组件新增 feedbackMinLines 后示例预留单行反馈，未等待反馈的 4 次探针均收到两次 submit。
- Firefox 原失败用例在语义等待修正后重复 3 次通过；新提交的完整 CI 仍是最终远端验收依据，局部样本不等于消除所有浏览器/布局时序风险。

## 本地证据与边界

- Field 新增两条浏览器回归在修复前均失败，修复后通过；现有 Field size 合同保留。
- Form、Field、NumberField、PinInput 定向浏览器集合此前三浏览器共 12 files / 57 tests 通过；新增反馈空间的 Field 回归另在三浏览器通过，包含操作区坐标稳定和超长消息自然增长。
- feedbackMinLines 的负数、小数、NaN、Infinity SSR 校验：4 tests 通过。
- FormRegistry、validation、PinInput helper、field/form runtime 定向单测：4 files / 23 tests 通过。
- 新增 Docs E2E 三条：Field 反馈/链接、NumberField 部分草稿与实际提交、PinInput 只读切换与删除，Chromium 通过。
- ZUI 与 Docs 项目类型检查均为 0 errors / 0 warnings，生成物和系统审计通过；格式/lint 统一执行。完整工作区、覆盖率、桌面、全部 Docs 状态交给新提交 CI。Svelte MCP 当前未提供，使用项目实际 compiler/svelte-check/Vitest 路径。

本轮不实际发布包、不合并 Release PR，也没有用静态 metadata 数量替代运行时和视觉检查。
