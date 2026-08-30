# ZUI与文档站生产审计

状态：实现与真实浏览器审计完成；上一轮CI失败已修复，当前推送不等待（2026-08-30）

## 1. 审计范围

本轮不是只检查新增组件，而是覆盖以下边界：

- `ui/zui/src/components`全部公开与内部组件；
- Theme、ICSS、recipe、collection、form、layer、toast和虚拟化runtime；
- `@zadmin/zui`公开入口、metadata、Changesets与包验收；
- `apps/docs`的主题、路由、搜索、API表格、Demo、可访问性与响应式布局；
- Windows WebView2、浏览器矩阵、SSR、外部安装、bundle和生成文件门禁。

## 2. 最终清单

| 项目                    | 结果 | 门禁                                                                                         |
| ----------------------- | ---: | -------------------------------------------------------------------------------------------- |
| Svelte组件文件          |  135 | 133个拥有唯一metadata id；`ZMentionEditor`与`ZTextareaAutosize`是非公开内部实现              |
| 公开组件文档页          |   78 | 每页至少2个不同Demo                                                                          |
| 实际Demo                |  156 | 少于2个、重复id或空源码会在`defineComponentDoc`中直接失败                                    |
| 生产指南                |    8 | Getting Started、ICSS、Theme Lab、Accessibility、SSR/CSP、HMR、WebView和Package              |
| 公开API合同             |  133 | TypeScript AST快照覆盖全部metadata组件与10个package entrypoint；变化必须显式更新             |
| 官方主题                |    6 | `@zadmin/zui/themes`统一导出，文档站真实切换并持久化                                         |
| 带CSS过渡的组件         |   13 | 13/13显式消费Provider motion，reduced时清除过渡                                              |
| Docs全站自建交互控件    |    0 | `apps/docs/src`全部Svelte文件由ZUI表达按钮、链接、Select、Popover、Table、Code和Card         |
| 内联SVG                 |    4 | 2个ZAdmin品牌资源；`ZSpinner`与圆形`ZProgress`为组件自身的数据图形；通用UI图标全部来自Lucide |
| 静态系统审计            |    1 | CI固化metadata唯一性、Demo数量、motion、Docs dogfood、Lucide导入和SVG白名单                  |
| 内部原生按钮文件        |    9 | 必须复用internal action、显式focus合同，或是Tour的隐藏非Tab遮罩                              |
| 可见原生输入文件        |   14 | 非hidden input/textarea必须复用internal focus或显式focus-visible/focus-within                |
| 表单reset action文件    |   26 | 组件必须通过节点action绑定/更新/销毁，禁止直接调用低层listener                               |
| 正tabindex/隐藏Tab点    |  0/0 | ZUI和Docs禁止正tabindex；aria-hidden交互元素必须显式`tabindex=-1`                            |
| 隐式submit/无名图标按钮 |  0/0 | 内部原生button必须显式type；图标按钮必须有aria-label或aria-labelledby                        |
| Svelte遗留事件/动态组件 |  0/0 | ZUI与Docs禁止`on:event`、`createEventDispatcher`和`<svelte:component>`                       |
| TypeScript危险逃生口    |    0 | ZUI与Docs禁止`@ts-ignore`、`@ts-nocheck`、显式`any`断言与注解                                |
| 资源生命周期违规        |    0 | 全部ZUI源码中event/timer/RAF/Observer创建文件必须包含对应释放路径                            |
| 危险动态DOM/XSS sink    |    0 | ZUI与Docs禁止raw HTML、HTML字符串注入、eval/new Function、动态script和javascript URL         |

分类目录的16–26个直接文件属于蓝图允许的真实大分类（5–30），继续保持“分类目录直接包含简单组件文件”；没有为满足计数制造一文件目录。

## 3. 本轮发现并修复的问题

| 问题                                  | 根因                                                            | 修复                                                                         |
| ------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 多边界Pagination出现重复key           | 前后大间隙都被标记为`ellipsis-end`                              | 根据间隙相对当前页的位置生成稳定start/end身份，并加入100页回归               |
| Select/MultiSelect首屏显示原始key     | Content未挂载时没有Item标签缓存                                 | 增加`valueLabel`回退合同，保留自定义Trigger能力                              |
| 负数NumberField步进可能错误舍入       | `decimalPlaces`正则没有接受数值符号                             | 支持正负号并覆盖负小数与负科学计数法                                         |
| 动画合同不一致                        | 早期Button/Input/Textarea/InputGroup/FileUpload只写了transition | 全部接入Provider motion；Accordion指示器也支持reduced-motion                 |
| 可取消事件重复实现                    | Select、MultiSelect、Combobox、Menu和Layer各自维护布尔状态      | 抽取最小`CancelableEvent`基类，保留具体事件公开类型                          |
| 内部微型按钮视觉/焦点重复             | Calendar、NumberField与TimeField各自维护相同基础动作样式        | 统一复用`styleInternalAction`，仅保留尺寸、边框和布局差异                    |
| 可见原生输入焦点依赖浏览器默认        | ColorPicker、TagsInput和DataTable没有统一Theme focus ring       | 抽取内部focus helper并覆盖color/hex/range、编辑框和表格选择框                |
| 表单reset注册存在effect/action双轨    | 组件普遍依赖`bind:this + $effect`，节点生命周期不够直接         | 26个表单组件统一节点action；Textarea提供`onFormReset`供Mention组合复用       |
| 关闭/导航图标不一致                   | 多处使用`×/‹/›/+/-/✓`字符                                       | 统一使用按需Lucide；完整操作复用ZButton，微型内部按钮复用无状态focus样式合同 |
| Transfer、DataTable与主页残留箭头字符 | 早期实现只补了可访问名称，字符范围没有纳入全树图标审计          | 统一使用按需Lucide/ZIcon；Transfer按LTR/RTL交换方向，DataTable复用ZButton    |
| WebView窗口控制仍用字符图标           | WindowControls早于ZIcon manifest扩展                            | 扩展受控manifest并改用`ZIcon`                                                |
| 文档页只展示一个场景                  | 首轮文档以实现证明为主，没有形成特性矩阵                        | 78页全部补为基础+状态/边界/组合Demo，复杂组件覆盖键盘、焦点、表单或生命周期  |
| 文档站自建原生控件                    | 站点框架早于相关ZUI组件                                         | Header、API表、首页、Sidebar、TOC和Theme Lab改为真实ZUI消费者                |
| ZStack Demo遗留原生Select             | 旧Demo在ZSelect完成前直接使用平台控件                           | 改用ZStack、ZText与ZSelect组合，并把dogfood门禁从views扩到全部Docs Svelte    |
| 批量覆盖污染多浏览器状态              | 覆盖率专用的Docs汇总挂载也在Firefox/WebKit运行                  | 汇总限定到Chromium且显式mount/unmount；三浏览器继续跑独立组件行为套件        |
| 高对比主题进入Theme Lab后白屏         | 预设色板按颜色值作为key，`canvas`与`surface`可同为`#ffffff`     | 改用语义token名作为稳定key；全新Chrome标签页重载后六主题全部恢复             |
| 组件大小门禁与完整交互职责冲突        | 3.25 KiB阈值把DataTable、Tour、DatePicker等误当成视觉原子       | CI继续构建并记录gzip、检查依赖边界；仅在产物明显异常时人工分析，不设字节门禁 |
| WebKit表单reset批量失效               | reset不是composed事件，document监听无法跨测试/组件ShadowRoot    | 同时监听组件root、关联form和document，实时按form/包含/id判定并合并重复捕获   |
| Firefox合成paste缺少payload           | 构造参数中的`clipboardData`没有跨引擎落到只读事件属性           | 测试助手显式定义ClipboardEvent payload；真实用户剪贴板逻辑保持不变           |
| 文档站缺少生产使用指南                | 只有组件页与Theme Lab，安装、SSR、HMR、WebView和发布边界分散    | 共享指南注册表与GuidePage补齐七份指南，直接使用ZUI Card/List/Code/Link       |
| 发布包缺少消费者入口说明              | npm tarball没有就地安装、entrypoint与稳定性说明                 | 增加随包README、AST API快照、publish dry-run和仓库外tarball验收              |
| 发布规划没有release PR自动化          | 只有Changesets CLI脚本，没有成功CI后的版本与Changelog PR        | Changesets v2从成功CI的SHA创建PR；仓库允许Actions建PR，默认token仍保持只读   |

## 4. 交互与可访问性审计

- Collection组件统一检查disabled跳过、Home/End、方向键、typeahead、受控/非受控状态和reset。
- Modal与非modal浮层统一检查LayerStack顶层所有权、Escape、outside dismiss、FocusScope、scroll lock、inert和焦点恢复。
- 真实Chrome已验证嵌套Dialog逐层Escape与逐层恢复、Popover初始焦点、manual Tabs焦点/选择分离、Select/MultiSelect首屏标签和Tour焦点合同。
- 自定义视觉不替代原生语义：Table、List、DescriptionList、Timeline、Progress、Meter、Checkbox、Radio、Slider和表单控件继续使用真实平台元素。
- 高对比度是Theme/contrast轴，不给每个组件复制一套实现；reduced-motion会停止WAAPI或把CSS过渡降为0。
- 渐变只保留在ZAdmin品牌标识。组件状态依赖语义token和边界，不用装饰性渐变掩盖状态。

## 5. 文档站真实浏览器证据

- 78/78组件路由均能渲染，且每页DOM中有2个不同Demo。
- 七份新增生产指南在真实Chrome中7/7渲染，均有唯一active导航、3–4个ZUI Card章节和正确页面标题。
- ZStack方向Demo通过ZSelect键盘切换后，Trigger文本、实际`flex-direction`和焦点恢复一致；Docs全站原生交互标签为0。
- DataTable排序头通过ZButton获得统一focus/motion，Enter切换ascending/descending时同步Lucide与`aria-sort`；Transfer完成真实移动并在RTL交换Lucide方向。
- Calendar月导航、NumberField步进与TimeField周期按钮统一internal action；真实Chrome用Enter验证月份、精确数值和AM/PM状态切换并保持可见焦点。
- 移除reset路径的强制`flushSync`后，真实Chrome中ZCheckbox从true恢复indeterminate，ShadowRoot回调为1、无Window detached document回调为0，控制台保持干净。
- ColorPicker三类输入均有2px Theme焦点；TagsInput由容器显示focus-within且Enter提交后保持焦点；DataTable表头选择框用Space同步选中11个可用行。
- 首批`formReset`节点action在真实Chrome中让ZSelect从开发恢复生产、Checkbox从true恢复mixed；action更新回调后分别命中1次，destroy后不再触发。
- 全量action迁移后，RadioGroup、ZForm、Mention/Textarea和Transfer分别恢复默认选择、验证状态、建议浮层与目标集合；26个组件文件禁止绕过action直调listener。
- 六主题最终surface分别为极光`rgb(238, 244, 255)`、纸张`rgb(245, 237, 225)`、霓虹`rgb(5, 9, 20)`、午夜`rgb(11, 18, 32)`、高对比亮色`rgb(255, 255, 255)`、高对比暗色`rgb(0, 0, 0)`。
- 390×844视口无水平溢出，搜索和主题选择保持可用，组件导航使用横向滚动；验收后已恢复默认1920×936视口。
- 10,000项VirtualList、1,000行DataTable与5,000节点Tree均保持有界DOM；选择、排序和End键定位在虚拟化后仍稳定。
- 修复Theme Lab重复key并重新加载后，真实Chrome新增控制台记录为0条error/warning；此前Lighthouse基线为Accessibility、Best Practices、SEO、Agentic Browsing四项100。

## 6. CI结论

最后一次按约回看的门禁：[CI run 33303703620](https://github.com/kenconnet666/zadmin/actions/runs/33303703620)。

- Coverage/packages与Windows C# WebView2 desktop两个job完整成功；新增action回归把branch恢复到90%门禁以上，外部SSR、publish dry-run、Miniapp与WebView验收均通过；
- Workspace类型/Svelte、Lint和静态源码审计成功；Firefox与Chromium组件矩阵成功；
- 首批节点action迁移后WebKit仍是完全相同的18项，证明组件注册时机也不是根因；低层事件、root、task、Svelte调度和action生命周期已分别排除；
- 当前批次完成26组件全量action一致性并为Input增加`onFormReset`诊断计数：下一轮`FieldFixture`的`alice:1:0/1`会直接区分组件回调是否执行，停止继续猜测时序；
- Docs E2E、全构建与生成文件检查因全测试失败被跳过，待下一轮验证。

最终通过后必须同时满足：

- Windows C# WebView2 desktop完整成功；
- Workspace类型、Svelte、Prettier、ESLint、全测试、Docs Playwright/Axe、全构建与生成文件完整成功；
- ZUI覆盖率、bundle构成与依赖检查、publish dry-run、SvelteKit/SSR外部安装、Miniapp与WebView包验收完整成功；
- 全局分支覆盖率不降低90%阈值，组件分支覆盖率不降低85%阈值。

## 7. 结论

S0–S8实现与真实浏览器审计已经收口；CI不阻塞后续工作，只在下一次正常推送时回看上一轮结果并修复明确失败。当前仍在收敛WebKit唯一失败类别，不把“已推送”写成“CI已通过”。任何门禁失败都不能用“本地可运行”替代，也不通过降低覆盖率阈值消除。
