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

| 项目                   | 结果 | 门禁                                                                                         |
| ---------------------- | ---: | -------------------------------------------------------------------------------------------- |
| Svelte组件文件         |  135 | 133个拥有唯一metadata id；`ZMentionEditor`与`ZTextareaAutosize`是非公开内部实现              |
| 公开组件文档页         |   78 | 每页至少2个不同Demo                                                                          |
| 实际Demo               |  156 | 少于2个、重复id或空源码会在`defineComponentDoc`中直接失败                                    |
| 公开API合同            |  133 | TypeScript AST快照覆盖全部metadata组件与10个package entrypoint；变化必须显式更新             |
| 官方主题               |    6 | `@zadmin/zui/themes`统一导出，文档站真实切换并持久化                                         |
| 带CSS过渡的组件        |   13 | 13/13显式消费Provider motion，reduced时清除过渡                                              |
| Docs视图层自建交互控件 |    0 | 能由ZUI表达的按钮、链接、Select、Popover、Table、Code和Card均直接dogfood ZUI                 |
| 内联SVG                |    4 | 2个ZAdmin品牌资源；`ZSpinner`与圆形`ZProgress`为组件自身的数据图形；通用UI图标全部来自Lucide |

分类目录的16–26个直接文件属于蓝图允许的真实大分类（5–30），继续保持“分类目录直接包含简单组件文件”；没有为满足计数制造一文件目录。

## 3. 本轮发现并修复的问题

| 问题                              | 根因                                                             | 修复                                                                         |
| --------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 多边界Pagination出现重复key       | 前后大间隙都被标记为`ellipsis-end`                               | 根据间隙相对当前页的位置生成稳定start/end身份，并加入100页回归               |
| Select/MultiSelect首屏显示原始key | Content未挂载时没有Item标签缓存                                  | 增加`valueLabel`回退合同，保留自定义Trigger能力                              |
| 负数NumberField步进可能错误舍入   | `decimalPlaces`正则没有接受数值符号                              | 支持正负号并覆盖负小数与负科学计数法                                         |
| 动画合同不一致                    | 早期Button/Input/Textarea/InputGroup/FileUpload只写了transition  | 全部接入Provider motion；Accordion指示器也支持reduced-motion                 |
| 可取消事件重复实现                | Select、MultiSelect、Combobox、Menu和Layer各自维护布尔状态       | 抽取最小`CancelableEvent`基类，保留具体事件公开类型                          |
| 关闭/导航图标不一致               | 多处使用`×/‹/›/+/-/✓`字符                                        | 统一使用按需Lucide；完整操作复用ZButton，微型内部按钮复用无状态focus样式合同 |
| WebView窗口控制仍用字符图标       | WindowControls早于ZIcon manifest扩展                             | 扩展受控manifest并改用`ZIcon`                                                |
| 文档页只展示一个场景              | 首轮文档以实现证明为主，没有形成特性矩阵                         | 78页全部补为基础+状态/边界/组合Demo，复杂组件覆盖键盘、焦点、表单或生命周期  |
| 文档站自建原生控件                | 站点框架早于相关ZUI组件                                          | Header、API表、首页、Sidebar、TOC和Theme Lab改为真实ZUI消费者                |
| 批量覆盖污染多浏览器状态          | 覆盖率专用的Docs汇总挂载也在Firefox/WebKit运行                   | 汇总限定到Chromium且显式mount/unmount；三浏览器继续跑独立组件行为套件        |
| 高对比主题进入Theme Lab后白屏     | 预设色板按颜色值作为key，`canvas`与`surface`可同为`#ffffff`      | 改用语义token名作为稳定key；全新Chrome标签页重载后六主题全部恢复             |
| 组件大小门禁与完整交互职责冲突    | 3.25 KiB阈值把DataTable、Tour、DatePicker等误当成视觉原子        | CI继续构建并记录gzip、检查依赖边界；仅在产物明显异常时人工分析，不设字节门禁 |
| WebKit表单reset批量失效           | effect执行时`control.form`可能尚未建立，后续关联不会触发响应更新 | 共享runtime监听ownerDocument，在reset发生时按实时`control.form`判归属        |
| Firefox合成paste缺少payload       | 构造参数中的`clipboardData`没有跨引擎落到只读事件属性            | 测试助手显式定义ClipboardEvent payload；真实用户剪贴板逻辑保持不变           |

## 4. 交互与可访问性审计

- Collection组件统一检查disabled跳过、Home/End、方向键、typeahead、受控/非受控状态和reset。
- Modal与非modal浮层统一检查LayerStack顶层所有权、Escape、outside dismiss、FocusScope、scroll lock、inert和焦点恢复。
- 真实Chrome已验证嵌套Dialog逐层Escape与逐层恢复、Popover初始焦点、manual Tabs焦点/选择分离、Select/MultiSelect首屏标签和Tour焦点合同。
- 自定义视觉不替代原生语义：Table、List、DescriptionList、Timeline、Progress、Meter、Checkbox、Radio、Slider和表单控件继续使用真实平台元素。
- 高对比度是Theme/contrast轴，不给每个组件复制一套实现；reduced-motion会停止WAAPI或把CSS过渡降为0。
- 渐变只保留在ZAdmin品牌标识。组件状态依赖语义token和边界，不用装饰性渐变掩盖状态。

## 5. 文档站真实浏览器证据

- 78/78组件路由均能渲染，且每页DOM中有2个不同Demo。
- 六主题最终surface分别为极光`rgb(238, 244, 255)`、纸张`rgb(245, 237, 225)`、霓虹`rgb(5, 9, 20)`、午夜`rgb(11, 18, 32)`、高对比亮色`rgb(255, 255, 255)`、高对比暗色`rgb(0, 0, 0)`。
- 390×844视口无水平溢出，搜索和主题选择保持可用，组件导航使用横向滚动；验收后已恢复默认1920×936视口。
- 10,000项VirtualList、1,000行DataTable与5,000节点Tree均保持有界DOM；选择、排序和End键定位在虚拟化后仍稳定。
- 修复Theme Lab重复key并重新加载后，真实Chrome新增控制台记录为0条error/warning；此前Lighthouse基线为Accessibility、Best Practices、SEO、Agentic Browsing四项100。

## 6. CI结论

最后一次按约回看的门禁：[CI run 33299490925](https://github.com/kenconnet666/zadmin/actions/runs/33299490925)，检查时仍在运行，不等待完成。

- Coverage与packages job已完整成功：全局分支覆盖率90%，bundle构成、SvelteKit/SSR、Miniapp、WebView及外部包验收全部通过；
- Workspace已完成类型与Svelte合同，检查时正在执行Lint，尚未进入全测试；
- Windows job已完成C# core、desktop TypeScript/Svelte和前端测试，检查时正在执行Release构建；
- 前一轮`33298460787`的WebKit reset与Firefox合成paste失败已在`42545fc`修复；
- 本批新增ZUI发布dry-run门禁；推送后不等待CI，下一次正常推送时回看结果。

最终通过后必须同时满足：

- Windows C# WebView2 desktop完整成功；
- Workspace类型、Svelte、Prettier、ESLint、全测试、Docs Playwright/Axe、全构建与生成文件完整成功；
- ZUI覆盖率、bundle构成与依赖检查、publish dry-run、SvelteKit/SSR外部安装、Miniapp与WebView包验收完整成功；
- 全局分支覆盖率不降低90%阈值，组件分支覆盖率不降低85%阈值。

## 7. 结论

S0–S8实现与真实浏览器审计已经收口；CI不阻塞后续工作，只在下一次正常推送时回看上一轮结果并修复明确失败。当前已修复上一轮唯一失败类别，但不把“已推送”写成“CI已通过”。任何门禁失败都不能用“本地可运行”替代，也不通过降低覆盖率阈值消除。
