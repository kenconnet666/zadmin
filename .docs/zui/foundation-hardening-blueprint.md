# ZUI 基础设施、已有组件与 Docs 加固蓝图

状态：H0–H5已完成实现与自动验收。最终代码提交`a6ea25b`的GitHub Actions run `33256806135`三组job全部通过。制定与完成日期：2026-08-29。

优先级：本文件高于[ZUI组件与展示站改进蓝图](./component-roadmap.md)中的后续组件路线。在本蓝图全部完成并通过验收前，不启动Select、Dialog、Table、Tree、DatePicker等新展示组件。

## 1. 当前阶段目标

本阶段只做三类工作：

1. 加固ZUI的ICSS、Theme、组件共享机制、包出口、SSR/HMR、tree-shaking、测试和npm发布基础设施；
2. 修复和完善已经存在的8个公开组件；
3. 新增Docs展示站确实需要的`ZCode`，并重构Docs的数据源、源码展示、路由、搜索、样式和验收。

完成标准不是组件数量，而是：

- 现有API有单一事实源，组件、类型、Docs和测试不再漂移；
- 已有组件具备清晰的受控状态、表单、Theme、SSR和可访问性合同；
- 新依赖只有使用对应能力时才进入浏览器bundle；
- HMR、ShadowRoot、SSR、CSP和外部安装仍然成立；
- Docs能够准确展示、交互和验收现有组件；
- npm版本、Changesets、pack和仓库外消费链路可重复；
- 后续新增复杂组件时不需要推翻当前底层。

## 2. 范围冻结

### 2.1 当前公开ZUI组件集合

保留并完善：

```text
ZProvider
ZBox
ZStack
ZText
ZIcon
ZButton
ZInput
ZField
```

本阶段唯一允许新增的公开展示组件：

```text
ZCode
```

`ZCode`是Docs真实需要且可被业务复用的代码展示组件。它不扩展为Markdown渲染器、编辑器、Diff、终端模拟器或代码卡片组件。

### 2.2 不新增公开组件的事项

以下需求优先放回现有组件、内部函数或Docs私有组件，不创建新的ZUI公开组件：

- ZButton loading指示器：留在ZButton内部，并允许Snippet覆盖；
- visually-hidden文本：使用内部ICSS recipe或工具，不发布`ZVisuallyHidden`；
- Docs复制按钮：组合ZButton与Clipboard API，不发布`ZCopyButton`；
- Docs状态标签、指标卡、键盘表、Token表：属于`apps/docs`私有展示组件；
- Theme切换、搜索框、侧栏抽屉：属于Docs shell，不进入ZUI公共组件面；
- Spinner、Badge、Separator、Link、Card：当前都不建立公开组件。

### 2.3 明确冻结的新组件

本阶段不实现、不建立空目录、不提前导出占位：

```text
ZCheckbox ZRadioGroup ZSwitch ZTabs ZPagination
ZTooltip ZPopover ZMenu ZDialog ZDrawer ZToast
ZSelect ZCombobox ZListbox ZMultiSelect ZTree
ZForm ZTable ZGrid
ZCalendar ZDateField ZDatePicker ZDateRangePicker ZTimeField
```

可以记录未来合同和验证既有基础设施不阻碍它们，但不得以“基础设施”为名提前实现它们的组件状态机或DOM。

## 3. 已落地依赖的使用纪律

依赖已经安装，不代表必须立即被现有组件引用。

| 依赖                      | 当前阶段允许用途                                | 当前阶段禁止用途                                |
| ------------------------- | ----------------------------------------------- | ----------------------------------------------- |
| `runed`                   | 生命周期清理、Observer、尺寸、节流/防抖、持久化 | 将Runed对象暴露为ZUI公共API；替代ZUI状态合同    |
| `@floating-ui/dom`        | 仅做tree-shaking/外部安装基线验证               | 为未实现的Popover/Select提前写浮层runtime       |
| `tabbable`                | 仅做tree-shaking/外部安装基线验证               | 提前实现Dialog/FocusScope或公开focus API        |
| `@standard-schema/spec`   | 定义内部表单校验边界和type-only测试             | 当前新增ZForm或绑定具体校验库                   |
| `@internationalized/date` | 验证依赖边界、类型和未来locale方向不被阻断      | 当前新增日期组件或把日期类型塞入ZProvider Props |
| `shiki`                   | `ZCode`独立子入口、Docs源码高亮                 | 进入ZUI根入口；在每个实例创建highlighter        |
| `fast-check`              | 已有组件状态、ICSS和内部纯状态工具的属性测试    | 运行时依赖；用随机测试代替明确合同示例          |
| `@changesets/cli`         | 版本、Changelog、publish工作流                  | 浏览器或package运行时依赖                       |

必须新增自动门禁：

- 根入口bundle不包含`shiki`、`@internationalized/date`、Floating UI或tabbable；
- 现有8个组件的bundle不因安装新依赖而增长；
- `@zadmin/zui/code`只带入ZCode和Shiki相关图；
- package tarball不包含测试、Docs、源码缓存和工作区绝对路径；
- optional peer缺失时普通根入口仍可安装、check、build和SSR。

## 4. 架构问题优先修复

### 4.1 API事实源不能继续双写

当前Props定义在`.svelte` module script，Docs又手写一份API表，已经出现：

- `ZIcon.size`实现默认`small`，Docs写`medium`；
- `ZText.weight`实现为`normal`，Docs写`regular`。

目标合同：

- 每个组件独占的Props、类型、默认值、recipe和静态常量仍保留在同一个`.svelte`文件；
- Props字段使用结构化JSDoc描述用途、默认值、是否bindable和可访问性影响；
- Docs build从`.svelte` module script和组件初始化默认值生成API metadata；
- Demo描述、设计建议和长文本仍由Docs catalog人工维护；
- CI比较公开导出、生成metadata、Docs catalog和默认值，任何漂移直接失败；
- 不在网页展示`.docs` Markdown。

实现优先采用仓库已有Svelte compiler与TypeScript能力，不先引入新的文档生成框架。若AST提取无法稳定覆盖Svelte默认值，则先建立显式、同文件导出的`componentMeta`并由合同测试约束，不能继续无约束双写。

### 4.2 Recipe级联顺序必须成为明确合同

当前recipe将base、variant和compound分别生成class。class字符串顺序不会决定CSS优先级，真实结果依赖style rule插入顺序。当前编译顺序通常是base、variants、compound，但缺少完整的公开优先级合同、跨HMR顺序合同和冲突诊断。

本阶段必须选择并固定一种模型：

```text
base < variant declaration order < compound < instance ICSS < consumer authored style
```

要求：

- 同一recipe不依赖首次渲染时选择了哪个variant；
- HMR删除和重建规则后优先级不变化；
- SSR顺序与浏览器首次生成顺序一致；
- ShadowRoot与Document一致；
- 同一属性被多个variant写入时有确定结果和开发诊断；
- 评估cascade layer后再决定是否启用，不能只在文档写`zui.components`而源码没有实现；
- 若启用`@layer`，必须验证无layer的消费者CSS仍能按预期覆盖组件，并评估旧浏览器与CSSOM `insertRule`行为。

这项在继续扩大recipe数量前完成，避免未来通过增加selector specificity修补顺序问题。

### 4.3 Theme必须从“有token”升级为“组件实际使用token”

当前Theme已有`color.focus`，但ZButton和ZInput仍使用：

```ts
outline: 2px solid currentColor
```

本阶段补齐：

- `outlineStyle`系统关键字；
- `outlineWidth`与borderWidth token；
- `outlineColor`与`color.focus`；
- focus ring、danger hover、loading indicator等用途token；
- token、属性元数据、类型、序列化、文档和测试的端到端一致性；
- 亮色、暗色和高对比主题的最小合同；
- 自定义Theme缺失token的编译期约束。

第一方组件继续遵守：标准关键字先补系统元数据，稳定视觉字面量先补语义Theme token；结构性0、百分比、业务值和一次性算法常量不机械token化。

### 4.4 根样式接线应减少重复但不能隐藏所有权

8个组件重复执行：

```text
readIcssCarrier
serializeIcssVariables
mergeStyles
untrack initial style
applyIcssRootStyle
```

允许提取内部attachment/helper，但必须满足：

- 真实根元素仍在组件模板中清晰可见；
- `class`、`style`、ref和rest props合并顺序可读；
- SSR首屏style与hydrate后结果一致；
- authored style变化不会丢失ICSS变量，变量删除不会擦除用户style；
- 外部DOM style修改的支持边界有测试和文档；
- helper不成为公共action/attachment API。

### 4.5 `./internal`必须保持编译器专用边界

当前compiler生成代码需要`@zadmin/zui/internal`，因此manifest必须导出它，但业务代码不应依赖该入口。

本阶段：

- 为internal导出增加不稳定合同和package fixture；
- 保证根入口不重导出internal符号；
- 检查客户端产物不包含compiler、testing和server代码；
- 评估未来命名为`./compiler-runtime`的迁移价值，但本阶段不制造无收益破坏性改名；
- 外部package fixture直接执行编译产物，避免只在workspace软链接下通过。

### 4.6 浏览器、SSR和HMR能力必须有同一资源生命周期

任何新增内部helper都需要定义：

- SSR时是否执行；
- hydrate时如何接管；
- HMR dispose释放什么；
- 组件destroy释放什么；
- Document与ShadowRoot归属；
- 全局listener、Observer、timer和缓存上限；
- 多个Provider和多个runtime之间是否隔离。

Runed可以帮助清理，但不能代替这些所有权决策。

## 5. 基础设施实施轨道

### F0：事实源与门禁

- 修复两个已知Docs API漂移；
- 为8个组件建立导出、Props、默认值和Docs一致性测试；
- 把依赖排除、bundle增量和子入口边界纳入`test:bundle`；
- 将现有本地快速测试与CI完整矩阵写成脚本，而不是只存在于文档；
- 记录当前bundle基线，依赖安装本身不得改变基线。

### F1：ICSS与Theme确定性

- 补outline属性元数据和focus token；
- 固定recipe优先级和HMR/SSR顺序；
- 验证hash、canonicalization和Theme身份缓存；
- 验证style/carrier在动态更新、删除和用户style变化时无泄漏；
- 为开发诊断补充owner、component、recipe branch和冲突属性上下文；
- 不新增public `css`、`cx`、object-style或全局reset API。

### F2：已有组件真正需要的共享状态

当前只实现被已有组件使用的内部模块：

```text
runtime/
  compiler-bridge.ts
  controllable-state.svelte.ts
  field-context.ts
  form-control.svelte.ts
  root-style.ts
  context.ts
```

直接子项保持同类代码文件，目前共6个。Collection、Selection、Layer、Portal、FocusScope、Floating、typeahead和virtualizer只保留在后续架构文档，不在本阶段创建空文件或无消费者实现。

`controllable-state`先由ZInput验证：

- `value`、`defaultValue`和`bind:value`语义；
- 外部更新不触发用户回调；
- 用户输入只回调一次；
- 内部非受控状态可reset回到初始默认值，受控状态由外部owner重置；
- 受控模式不被内部状态写穿；
- SSR初值与hydrate一致。

`form-control`先为ZField/ZInput提供内部合同，不新增ZForm：

- control id、description ids、message ids；
- required、invalid、disabled、readonly；
- name和原生FormData边界；
- reset owner；
- Standard Schema保持type-only边界，暂不运行完整form graph。

### F3：包、版本与npm发布

- 初始化Changesets配置并定义哪些workspace包可发布；
- 确认`private`应用不会进入发布计划；
- 统一公开包的repository、homepage、bugs、license、engines和publishConfig；
- 建立`pnpm pack`内容快照；
- 建立临时目录/frozen lockfile仓库外安装fixture；
- 验证根入口、core、runtime、compiler、testing、internal和code子入口；
- 验证optional Shiki peer的有/无两条路径；
- master push CI完整成功后，`changesets/action/version@v2`从已验证SHA生成或更新release PR与Changelog；仓库已启用Actions创建PR能力但保持默认token只读；实际npm publish仍需要明确发布授权与token；
- 不在源码、Actions或文档写入凭据。

### F4：测试、性能与开发体验

本地快速门禁：

- 受影响package的`svelte-check`；
- 受影响纯状态/组件的focused test；
- 单一Chromium smoke；
- bundle和package边界；
- format、diff和依赖策略。

CI完整门禁：

- unit和fast-check扩大样本；
- Chromium、Firefox、WebKit；
- SSR、hydrate、ShadowRoot和HMR；
- Docs build/E2E/axe/截图；
- 外部tarball安装和Node SSR；
- bundle构成记录、tree-shaking和依赖排除；
- Changesets状态和publish dry-run。

开发体验：

- Docs继续监听workspace ZUI源码并保持组件状态级HMR；
- 修改recipe只替换对应owner规则；
- 修改Demo只刷新对应模块；
- 修改API metadata不要求手工同步第二份类型；
- dependency/package配置变化明确提示重启，不制造多个重复watcher。

## 6. 已有组件改进清单

### 6.1 ZProvider

保留无DOM wrapper和嵌套继承。

改进：

- 明确Theme和runtime的响应式更新合同；
- 增加`locale`与`direction: 'ltr' | 'rtl'`上下文，但不把日期库类型暴露到Props；
- locale默认值必须SSR稳定，不能在server和client分别猜测；
- 本蓝图冻结时Portal容器只定义未来扩展位；S3现已实现Portal、LayerStack、FocusScope、dismiss、inert与scroll lock；
- 增加嵌套locale/direction、ShadowRoot和Theme切换测试；
- 清理未公开的deprecated context别名，或明确保留周期。

### 6.2 ZBox

继续是严格`div`，不增加任意`as`。

改进：

- 使用统一root-style内部helper减少接线重复；
- 补class数组/对象、style对象、ref和carrier动态删除测试；
- 明确用户style与ICSS变量同名冲突时的优先级；
- 不把ZBox扩成Card、Panel或全能多态容器。

### 6.3 ZStack

改进：

- 删除`StackGap/StackDirection/StackAlignment/StackJustification/StackDesignProps`与`ZStack*`的重复公开类型；
- 保留一套ZStack命名类型；
- 数值gap继续作为明确px动态值，不创建Theme token；
- 增加RTL、reverse方向、wrap和numeric gap属性测试；
- 当前不增加响应式Props和Grid能力。

### 6.4 ZText

改进：

- 修正文档中的`regular`/`normal`漂移；
- 为每个允许的`as`校验真实属性透传和ref；
- 保持有限语义集合，不做任意多态；
- truncate增加title不是默认行为，避免擅自改变可访问名称；
- 验证字体大小、字重和tone只影响视觉，不伪造heading语义。

### 6.5 ZIcon

改进：

- 修正文档默认size；
- 保持受控manifest和无任意SVG HTML注入；
- 明确装饰、有label、外部`aria-label`冲突时的优先级；
- 验证非法name的开发错误，而不是静默空图标；
- 使用官方`@lucide/svelte`替换自维护SVG path，并把它声明为ZUI的必需peer dependency；
- 使用项目必须显式安装`@lucide/svelte`，ZUI不复制、不转出第三方图标入口；
- `iconManifest`只登记需要ZIcon统一Theme尺寸、ICSS、可访问性和ref合同的常用图标；其余场景直接从`@lucide/svelte/icons/*`静态子路径导入；
- 禁止把全量图标收集成运行时字符串索引，也不从Lucide总入口导入；业务产物只保留静态引用的组件；
- ZIcon与其他组件统一记录tree-shaken gzip，不设置自动字节上限；明显异常时人工检查manifest与重复依赖；
- 新增ZIcon常用名称时必须显式导入并经过bundle依赖边界检查。

### 6.6 ZButton

改进：

- focus ring使用Theme focus token；
- loading保持原生disabled与`aria-busy`，增加`loadingLabel`和可选loading snippet；
- 内置指示器保留在ZButton文件中，不新增Spinner组件；
- loading切换尽量不改变按钮宽度和可访问名称；
- start/end icon继续通过Snippet支持；调用方可以传入ZIcon或直接按需导入的Lucide组件；
- danger hover使用用途token；
- 验证submit/reset/button、onclick一次、disabled无点击、键盘和form owner。

### 6.7 ZInput

这是本阶段状态合同的主要验证组件。

改进：

- 使用ControllableState明确value/defaultValue/bind/onValueChange；
- 修复默认value可能压过原生defaultValue的边界；
- `defaultValue`映射原生form reset；受控/bind状态不伪造跨组件reset，外部owner负责同步状态；
- focus ring使用Theme token；
- 明确invalid Prop、用户`aria-invalid`和Field上下文的优先级；
- 明确required/disabled/readonly、Field上下文和原生属性优先级；
- 保留原生input类型白名单，不在一个组件里混入number/date/textarea；
- 不新增clear button、prefix/suffix容器等复合结构。

### 6.8 ZField

改进：

- label、description和messages支持string简写与Snippet；
- error从单字符串扩展为稳定消息集合，同时保留单字符串兼容；
- 避免每次输入时对全部错误重复使用`role="alert"`；
- 增加size并让slot recipe真实消费；
- 明确用户id/aria-describedby与上下文合并，而不是简单覆盖丢失关联；
- 与ZInput共享FormControl合同，但本阶段不新增ZForm；
- 验证多个description/message id、SSR稳定id和嵌套Field错误诊断。

## 7. ZCode设计

### 7.1 包边界

源码放在现有同类文件目录：

```text
components/gene/ZCode.svelte
```

当前不为单个组件创建`display/`一文件目录；只有后续出现足够多且已经获准的展示组件时才新增分类。

公开入口：

```ts
import { ZCode } from '@zadmin/zui/code';
```

Shiki保留optional peer和ZUI devDependency。Docs显式安装Shiki。ZUI根入口不重导出ZCode，避免普通消费者解析可选高亮依赖。

需要验证：

- 未安装Shiki时根入口可安装和构建；
- 未安装Shiki却导入`/code`时给出明确依赖错误；
- 安装Shiki后`/code`可在Vite、SvelteKit SSR和WebView使用；
- root bundle无Shiki字符串或动态chunk；
- code bundle按语言/主题拆分，不加载全部Shiki bundle。

### 7.2 初始API

```ts
export type ZCodeLanguage = 'svelte' | 'typescript' | 'javascript' | 'css' | 'json' | 'bash';

export interface ZCodeTheme {
	readonly dark: string;
	readonly light: string;
}

export interface ZCodeProps {
	readonly code: string;
	readonly lang?: ZCodeLanguage;
	readonly theme?: ZCodeTheme;
	readonly inline?: boolean;
	readonly wrap?: boolean;
	readonly lineNumbers?: boolean;
	readonly highlightedLines?: readonly number[];
	readonly ariaLabel?: string;
	ref?: HTMLElement | null;
}
```

首版不加入copy、collapse、filename、tabs、diff、editable、execute或远程加载；这些由Docs组合。

### 7.3 渲染与安全

- SSR默认输出稳定、可读、可复制的plain code；
- client首次hydrate与SSR DOM一致，随后异步增强；
- 优先使用Shiki tokens并由Svelte渲染span，不直接接受外部HTML；
- 如果必须消费Shiki HTML，只允许库自身输出并隔离`{@html}`，不得混入用户HTML；
- 模块级复用一个highlighter，不在组件实例内创建；
- 显式加载允许语言和亮/暗主题；
- code/lang/theme变化使用generation id避免旧异步结果覆盖新Props；
- 缓存必须有数量和字符总量上限；
- 超长代码、未知语言、高亮失败回退plain code，不能让页面崩溃；
- 亮暗切换不重复解析代码；
- 尊重reduced motion，不为高亮增加无意义动画。

## 8. Docs展示站加固

### 8.1 事实源和Catalog

Catalog继续是TypeScript，不读取Markdown。拆分职责：

- 生成metadata：Props、默认值、bindings、events、snippets和源码位置；
- 手写页面数据：summary、设计理由、Demo、关键词、可访问性说明；
- build时合并并校验；
- component status不再硬编码，使用`experimental | stable | deprecated`；
- 搜索索引包含组件名、分类、summary、Props、关键词和能力。

### 8.2 Docs允许的私有组件

可以改进现有：

```text
ApiTable.svelte
ComponentPage.svelte
DemoBlock.svelte
HomePage.svelte
AppHeader.svelte
AppShell.svelte
AppSidebar.svelte
```

只有实际页面出现第二个消费者时才增加私有Docs组件。候选包括PropsControls、KeyboardMatrix、TokenTable和BundleMetric，但不提前创建空文件。

### 8.3 Demo和源码

- DemoBlock使用ZCode显示源码；
- 复制、展开和Demo状态由DemoBlock组合，不扩张ZCode；
- copy timer在重复点击和destroy时清理；
- Demo源码继续使用`?raw`来自真实Svelte文件；
- 控件修改Props后生成可复制的最小Svelte代码；
- 每个组件的`doc.ts`与真实Demo共同放在`content/components/<category>/<component>/`；
- 单Demo组件不再增加`demos/`中间层，直接保留`doc.ts + Demo.svelte`；
- 单组件文件超过15个时再按真实职责拆`demos/`、`fixtures/`，不预建空目录。

### 8.4 路由、导航与可访问性

- 保持自研小型hash router，不引入router组件库；
- 新建纯TypeScript route parser/formatter，支持首页、组件、section和404；
- route state、hash listener与section滚动由main入口的单一runtime/store拥有，组件HMR只替换消费者，不销毁全站导航资源；main模块热替换时通过dispose释放旧listener与RAF；
- route规范化、decode和无效路径必须测试；
- section使用真实anchor和URL深链接，增加scrollspy但不劫持浏览器基本行为；
- 搜索有结果数量、清除动作、无结果状态和键盘焦点合同；
- 窄屏侧栏可以作为Docs私有结构实现，不新增ZDrawer；
- axe从单一Button页面扩展到全部组件页和首页；
- 键盘验收覆盖搜索、侧栏、Demo操作、API横向滚动和section导航。

### 8.5 样式结构

不把689行`styles.css`机械拆成多个CSS文件。Docs局部视觉迁移到现有ICSS、recipe、slot recipe和ZBox/ZStack/ZText等基础组件；样式定义尽量与对应Svelte组件同文件。

只保留一个小型全局CSS入口，用于浏览器级且无法由局部组件可靠拥有的规则：

```text
global.css
  字体包导入
  box-sizing reset
  html/body/#app根尺寸与默认margin
  少量真正全局的selection/scroll行为
```

当前全局CSS为27行，只包含字体导入、box-sizing、根尺寸和原生表单字体继承。任何新增规则都要说明为什么不能由ICSS或组件拥有。Docs私有视觉token通过`defineTheme`表达，不能把展示站Shell布局token误加进ZUI公共Theme，也不能用全局class重新建立第二套样式系统。

### 8.6 Docs新增页面范围

允许新增基础设施页面：

- 组件概览；
- Theme token与状态预览；
- ICSS/runtime/SSR/HMR说明与实时指标；
- bundle和package边界报告；
- 可访问性与键盘测试说明。

这些页面用于解释现有系统，不新增未实现组件的占位演示、假API或效果图。

## 9. 实施批次

### H0：事实修正和保护网

1. 修复ZIcon、ZText文档漂移；
2. 建立Props/default/export/catalog一致性测试；
3. 记录8组件和根runtime bundle基线；
4. 增加禁用依赖和未使用依赖不入bundle断言；
5. 将本蓝图接入Docs索引和开发交接文档。

### H1：ICSS、Theme和根样式

1. 补outline元数据、关键字、类型、序列化和测试；
2. 改造Button/Input focus ring；
3. 决定并实现recipe优先级合同；
4. 验证HMR、SSR、ShadowRoot和用户CSS覆盖；
5. 收敛root-style内部接线。

### H2：已有组件状态和API

1. 新增ControllableState及fast-check不变量；
2. 回填ZInput value/defaultValue/reset；
3. 改进ZField messages、Snippet、size和ARIA合并；
4. 改进ZButton loading、focus和icon snippets；
5. 改进ZProvider locale/direction；
6. 清理ZStack重复类型并补齐其余组件合同测试。

### H3：ZCode和Docs源码链

1. 增加`./code`开发与发布exports；
2. 实现ZCode plain SSR、client增强和Shiki缓存；
3. 建立有/无Shiki外部消费fixture；
4. DemoBlock迁移到ZCode；
5. 增加亮暗、未知语言、超长源码、竞态和HMR测试。

### H4：Docs结构

1. 生成并校验API metadata；
2. 扁平化Demo目录；
3. 将局部CSS迁到组件ICSS并把全局CSS收敛到必要规则；
4. 提取route/search纯TypeScript模块；
5. 改进section深链接、窄屏导航和Props controls；
6. 扩展E2E、axe和截图矩阵。

### H5：发布与交接

1. 初始化Changesets；
2. 补公开包元数据和版本策略；
3. pack内容快照与仓库外安装；
4. npm publish dry-run和release PR工作流；
5. 更新`.docs`当前事实与handoff；
6. 确认CI绿色后形成阶段提交，不因等待全量CI阻塞下一批独立工作。

## 10. 阶段验收

本节记录H0–H5冻结时的基础范围，不是2026-08-30完整组件系统现状；当前133个metadata组件、78个根组件页与S0–S8证据见[生产审计](./production-audit.md)。

### 架构

- 本阶段公开组件为8个原组件加ZCode；
- 没有新增冻结组件、空目录和占位导出；
- components分类目录直接包含Svelte文件；
- shared runtime只实现当前有消费者的5个文件；
- 根入口没有Shiki、日期、Floating UI或tabbable代码；
- Miniapp和WebView平台边界不变。

### 组件

- 本阶段8个组件Props、默认值、Docs和类型一致；
- ZInput受控/非受控/reset合同完整；
- ZField多消息和ARIA关系完整；
- Button loading和focus无布局/语义回归；
- Theme关键字和token规则无例外漂移；
- SSR、hydrate、ShadowRoot、HMR和destroy资源无泄漏。

### ZCode与Docs

- ZCode是单文件组件并通过独立子入口发布；
- 不使用ZCode的bundle不含Shiki；
- Docs源码来自真实Demo并使用ZCode显示；
- API metadata无手工漂移；
- 首页和全部组件页通过axe；
- 三浏览器和窄屏关键路径通过；
- Docs不读取或展示`.docs` Markdown。

### 发布与测试

- focused本地检查保持快速；
- CI承担三浏览器、coverage、属性测试、截图和外部安装；
- Changesets、pack和publish dry-run可重复；
- 无凭据进入Git、日志、文档或产物；
- 所有事实文档区分本地已验证、CI已验证和未执行边界。

## 11. 停止条件

出现以下情况立即停止扩面，先修基础设施：

- Docs与组件API再次漂移；
- recipe优先级依赖渲染顺序；
- 根入口意外带入可选依赖；
- Docs或组件重新积累可由ICSS表达的大段局部CSS；
- HMR后规则、listener、timer或Observer增长；
- SSR与hydrate首屏DOM/样式不一致；
- 一个基础组件需要新建多个一文件目录才能继续；
- 为实现Docs页面而准备新增通用展示组件；
- 复杂组件需求迫使修改已有受控状态或表单合同。

只有本蓝图验收完成并由用户明确开始下一组件阶段，才恢复[后续组件路线](./component-roadmap.md)。
