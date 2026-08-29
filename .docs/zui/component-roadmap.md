# ZUI 组件与展示站改进蓝图

状态：后续组件候选路线，当前暂停。依赖基线已落地，审计日期：2026-08-29。当前实施以[ZUI基础设施、已有组件与Docs加固蓝图](./foundation-hardening-blueprint.md)为准；该蓝图验收完成并由用户明确开始下一组件阶段前，本文P3–P8不进入实现。

## 1. 范围与决策

本蓝图承接已经完成的8个ZUI基础组件和ICSS runtime/compiler。下一阶段继续由ZUI自行拥有DOM、状态机、键盘、ARIA、Portal、表单桥接、集合、选择和虚拟化，不包装第三方组件、headless组件或表格引擎。

允许第三方依赖提供职责单一的通用API或算法：

- `runed`：Svelte 5生命周期、Observer、尺寸、节流、防抖和持久化；
- `@floating-ui/dom`：浮层坐标和碰撞算法；
- `tabbable`：focusable/tabbable元素判断；
- `@standard-schema/spec`：校验协议；
- `@internationalized/date`：日期、时间、时区和日历值模型；
- `shiki`：`ZCode`的可选语法高亮引擎；
- `fast-check`：开发期状态机属性测试；
- `@changesets/cli`：多包版本、Changelog和npm发布。

明确禁止：

- Bits UI、Melt UI、Zag.js或其他组件/headless组件库；
- TanStack Table、TanStack Virtual或其他表格/虚拟列表引擎；
- 全部`@svelte-put/*`；
- 二维码组件和二维码依赖；
- Emotion、VueUse、Vicons、async-validator、color2k；
- 将Miniapp组件、DOM runtime或第三方跨端runtime带入ZUI。

## 2. 已落地依赖边界

`@zadmin/zui`直接依赖：

```text
@floating-ui/dom
@internationalized/date
@standard-schema/spec
runed
tabbable
```

`shiki`采用可选peer，同时作为ZUI开发依赖供类型检查、构建和测试使用。实际使用`ZCode`的应用显式安装Shiki；Docs作为首个真实消费者声明Shiki依赖。`fast-check`只属于ZUI开发依赖，`@changesets/cli`只属于仓库根开发依赖。

普通ZUI根入口不得因为Shiki加载高亮器、WASM、语言或主题。`ZCode`应使用独立公开子入口，例如`@zadmin/zui/code`；根入口和不使用代码高亮的bundle必须保持无Shiki引用。

## 3. 当前实现审计

### 3.1 已有优势

- 8个组件都直接落到真实语义元素，没有样式wrapper；
- Props继承Svelte原生元素类型，`class`、`style`、事件、`data-*`和`aria-*`可以继续透传；
- Provider支持嵌套Theme、显式runtime、SSR和ShadowRoot隔离；
- recipe、slot recipe、ICSS变量carrier、HMR和SSR已有独立测试；
- ZButton使用原生`button`，默认`type="button"`；
- ZIcon区分装饰图标和具名图像；
- ZField与ZInput已经建立稳定ID、label、description、error和required关系；
- ZInput已有用户输入回调、表单reset同步和浏览器测试；
- 单组件增量和runtime gzip已有自动预算。

这些基础合同继续保留，后续复杂组件不得为了复用而增加无意义DOM层。

### 3.2 已确认缺口

#### 文档元数据已经漂移

Docs的API表由手工TypeScript对象维护，已经出现可复现差异：

- `ZIcon.size`实现默认值是`small`，Docs写成`medium`；
- `ZText.weight`实现类型和默认值是`normal`，Docs写成`regular`。

现有catalog测试只检查“每页有API数据”，没有比较组件真实Props、默认值和导出。组件越多，手工双写越容易继续漂移。

#### 共享组件runtime不足

`component-runtime`当前只有：

```text
field-context.ts
root-style.ts
zui-context.ts
```

它可以支持基础组件，但不能统一承载后续复杂组件需要的：

- controlled/uncontrolled状态；
- Trigger、Content和Item注册；
- Collection排序与动态增删；
- 单选、多选和范围选择；
- roving focus、Home、End和方向键；
- typeahead；
- FocusScope与焦点恢复；
- Portal；
- Layer stack、outside pointer/focus和Escape；
- 浮层坐标生命周期；
- hidden input与表单reset；
- 自研虚拟区间。

在这些机制出现前直接写ZSelect、ZMenu或ZDialog，会在多个组件中复制相互不兼容的实现。

#### Theme和第一方ICSS仍有可收口项

ZButton和ZInput的focus-visible使用原始`outline: 2px solid currentColor`，而Theme已经拥有`color.focus`。属性元数据尚未提供完整的`outlineStyle`和`outlineWidth`强类型入口，导致第一方组件不能以token化长属性表达焦点环。

后续应：

1. 补充outline系统关键字、属性元数据、类型、序列化和测试；
2. 使用`outlineColor._focus`、边框宽度token和`outlineStyle.solid`；
3. 为危险按钮补充用途明确的hover token，而不是让danger hover与静态danger完全相同；
4. 为复杂浮层增加surface、overlay、shadow、motion和layer用途token，不能在组件内散落视觉字面量。

#### ZInput没有明确的受控/非受控合同

当前`value`始终以`$bindable('')`存在并写到原生input，因此组件没有显式区分：

- `value`受控；
- `defaultValue`非受控；
- 仅原生FormData；
- 外部更新；
- 用户输入回调；
- reset回到初始默认值。

基础文本输入目前可以工作，但该模型不能直接扩展到Select、Checkbox、Radio、DateField和多选集合。需要先建立共享`ControllableState<T>`合同，再回填ZInput。

#### ZField仍是单一字符串展示容器

当前label、description、error都是字符串，error只有一个，size固定为medium，Field不注册name、value、touched、dirty、validating或form owner。它适合作为v1语义样本，但不是完整表单基础。

后续应将“视觉Field”和“Form字段状态”分离：

- ZField负责label、description、messages和control语义；
- ZForm/FormControl负责注册、schema、校验、提交、reset和首错聚焦；
- error支持稳定消息数组，不在每次输入时用`role="alert"`重复朗读所有历史错误；
- label、description和message允许Snippet，但保留字符串简写；
- hidden input由拥有表单值的复合控件生成。

#### 组件API还有局部冗余或过窄

- ZStack同时导出两组表达相同概念的旧类型，增加上下文噪声；
- ZButton loading只显示省略号，缺少可替换loading内容、稳定spinner和加载文案策略；
- ZIcon只允许内置manifest，尚未形成项目扩展注册表与自定义路径边界；
- ZText的有限`as`集合和HTMLElement通用Props不能为每一种元素提供完全精确的属性类型；
- ZProvider尚未提供复杂组件需要的locale、direction和Portal容器策略；
- 所有组件重复根style/carrier接线，虽然行为正确，但需要评估Svelte attachment能否在不隐藏DOM所有权的前提下降低模板噪声。

### 3.3 Docs展示站缺口

- 源码仍为纯`pre/code`，没有ZCode和Shiki高亮；
- API数据手工双写且已经漂移；
- 没有Props控制台、可复制的实时组合代码和受控/非受控演示；
- 页面状态固定写成`stable`，catalog没有planned/experimental/stable/deprecated生命周期；
- 搜索只匹配组件名和summary，不搜索Props、category、关键词或能力；
- 当前页目录使用按钮滚动，没有深链接、scrollspy和可恢复的section URL；
- hash路由只识别单一精确格式，没有集中route模型、规范化和参数解码；
- `styles.css`为689行单文件，Shell、Docs、Demo、API表和响应式规则所有权混在一起；
- 8个组件Demo被拆成多个一文件目录，目录层级收益低；
- DemoBlock复制状态的timer没有销毁清理，多次点击可能形成竞态；
- E2E只有4项：真实交互主要覆盖Button/Input/Field，可访问性只扫描Button页面；
- 没有三浏览器组件全矩阵、窄屏导航、亮暗Theme、键盘路径和视觉截图合同；
- 没有展示runtime、SSR、HMR、bundle budget和Theme token等ZUI特有能力的页面。

## 4. 共享组件runtime规划

`component-runtime`保持直接子项全部为TypeScript代码文件，并控制在15个：

```text
component-runtime/
  collection.svelte.ts
  controllable-state.svelte.ts
  dismissable-layer.svelte.ts
  field-context.ts
  floating.svelte.ts
  focus-scope.svelte.ts
  form-control.svelte.ts
  layer-stack.svelte.ts
  list-navigation.svelte.ts
  portal.svelte.ts
  root-style.ts
  selection.svelte.ts
  typeahead.svelte.ts
  virtualizer.svelte.ts
  zui-context.ts
```

职责：

| 文件                 | 所有权                                               |
| -------------------- | ---------------------------------------------------- |
| `controllable-state` | `value/defaultValue/onValueChange`统一合同和外部更新 |
| `collection`         | Item注册、DOM顺序、稳定key、disabled和textValue      |
| `selection`          | none/single/multiple、toggle、range和受控值          |
| `list-navigation`    | 方向键、Home/End、loop、orientation和roving tabindex |
| `typeahead`          | `Intl.Collator`前缀匹配、缓冲、循环和disabled跳过    |
| `layer-stack`        | 嵌套浮层顺序、modal和父子关系                        |
| `dismissable-layer`  | capture阶段pointer/focus、Escape和外部交互策略       |
| `focus-scope`        | 使用`tabbable`完成初始焦点、trap、暂停和恢复         |
| `portal`             | SSR安全挂载、目标容器、销毁和嵌套Provider            |
| `floating`           | 使用Floating UI计算坐标并严格管理`autoUpdate`清理    |
| `form-control`       | name、hidden input、FormData、reset和Standard Schema |
| `virtualizer`        | 自研固定/可变尺寸区间、overscan和ARIA总数/索引       |

这些模块只返回ZUI自有类型，不把Runed、Floating UI、tabbable或Standard Schema实现对象泄漏到组件公共Props。

## 5. 已有8个组件的改进顺序

### P0：先修合同和文档漂移

- 修正ZIcon和ZText文档默认值；
- 删除ZStack重复类型；
- 为所有Props补用途、默认值和可访问性JSDoc；
- 建立组件导出/API metadata与Docs catalog一致性测试；
- 补outline属性元数据并把focus ring提升为Theme token写法；
- 为每个组件记录真实bundle增量，不因安装新依赖改变未使用组件产物。

### P1：ZCode与Docs源码能力

- 新增单文件`ZCode.svelte`；
- 使用独立`@zadmin/zui/code`子入口和可选Shiki peer；
- 模块级复用highlighter，按语言/主题动态加载；
- 支持plain fallback、light/dark、wrap、line number和highlight lines；
- 限制源码长度、缓存项数和高亮竞态；
- Docs的所有源码、安装命令和API类型统一使用ZCode。

### P2：回填基础状态合同

- ZInput迁移到共享ControllableState；
- 明确`value`、`defaultValue`、bind、用户回调、外部更新和reset顺序；
- ZButton增加loading snippet/label、稳定spinner和避免布局跳动的策略；
- ZField允许Snippet label/description/messages并增加size；
- ZProvider增加locale、direction和Portal容器合同；
- ZIcon增加受控项目图标注册接口，但不接入整套第三方图标库。

## 6. 新组件阶段

### P3：无浮层的交互组件

先验证共享状态机：

```text
ZCheckbox
ZRadioGroup
ZSwitch
ZTabs
ZPagination
```

必须覆盖受控/非受控、disabled、表单reset、hidden input、键盘和ARIA。

### P4：Layer和浮层组件

```text
ZTooltip
ZPopover
ZMenu
ZDialog
ZDrawer
ZToast
```

统一使用Portal、LayerStack、DismissableLayer、FocusScope和Floating。不得由每个组件自行监听document并维护互不兼容的outside-click。

### P5：集合与输入组件

```text
ZSelect
ZCombobox
ZListbox
ZMultiSelect
ZTree
```

统一验证Trigger、Content、Item、方向键、Home/End、typeahead、roving focus、焦点恢复、Portal、Escape、滚动到选中项、disabled、单选/多选、ARIA、hidden input和受控/非受控。

### P6：表单

```text
ZForm
ZFormField状态层
ZFormMessage
```

Standard Schema只提供校验协议，ZUI自行实现字段图、异步竞态、提交、reset、首错聚焦和原生FormData桥接。

### P7：自研数据Grid

```text
ZTable
ZGrid
```

DOM由`div`构成时必须实现`grid/row/columnheader/gridcell`、单一Tab stop、二维方向键、Home/End、Ctrl+Home/End、编辑模式、`aria-rowcount/colcount`和虚拟行索引。排序、筛选、分页、选择、列宽和虚拟区间都由ZUI自己的纯TypeScript模块提供。

### P8：日期组件

```text
ZCalendar
ZDateField
ZDatePicker
ZDateRangePicker
ZTimeField
```

`@internationalized/date`只负责CalendarDate、CalendarDateTime、Time、ZonedDateTime和日期算法；ZUI自行实现Calendar grid、Field segments、Popover、键盘、locale、ARIA和表单值。

## 7. Docs重构规划

### 信息源

- 组件Props和类型仍位于各自`.svelte`的module script；
- Props JSDoc成为API名称、说明和默认值的主要事实源；
- Docs build使用Svelte/TypeScript AST生成可校验API metadata；
- Demo、长说明、可访问性建议和示例仍由Docs catalog维护；
- catalog测试比较真实组件导出、生成metadata和手工页面，缺失或多余都失败。

### 页面能力

每个组件页逐步具有：

1. 状态、版本和分类；
2. 安装与import；
3. 实时Demo；
4. Props controls；
5. 生成的可复制代码；
6. ZCode高亮源码；
7. Props、events、bindings、snippets和CSS data-state表；
8. 键盘交互矩阵；
9. ARIA合同；
10. Theme token与recipe说明；
11. bundle增量；
12. GitHub源码链接。

### 目录和样式

- 将一文件Demo目录扁平化为`demos/`下约5–15个具名Svelte文件，组件增多后再按大类拆分；
- Docs局部视觉使用ICSS/recipes与基础组件，只保留字体、reset和根尺寸所需的极小全局CSS；
- Docs Svelte目录继续按catalog、demos、docs和shell等职责分组；
- 不把`.docs` Markdown读取或展示到网页。

### 路由和搜索

- 保持无第三方router，但建立强类型route parser/formatter；
- 支持首页、组件页、section深链接、404和规范化；
- 搜索索引包含name、summary、category、Props、关键词和能力；
- 导航支持键盘、窄屏抽屉、当前section和可恢复URL。

## 8. 验收与测试策略

本地保持快速门禁：

- 受影响package的`svelte-check`；
- 新增状态机的少量focused unit/property case；
- 受影响组件的单浏览器smoke；
- `git diff --check`和依赖解析。

CI运行完整门禁：

- unit、fast-check扩大样本；
- Chromium、Firefox、WebKit组件矩阵；
- Docs build与E2E；
- 每个组件页axe扫描；
- 键盘路径、焦点恢复、nested layer和表单reset；
- 窄屏与桌面视觉截图；
- ZCode有/无Shiki消费fixture；
- bundle budget、tree-shaking和未使用依赖排除；
- packed tarball、仓库外安装、npm publish dry-run和Changesets状态。

每个新组件必须先有API、ARIA模式、状态图、bundle预算和Docs Demo，再进入实现；不得用“组件能显示”代替键盘、屏幕阅读器、表单和销毁清理验收。

## 9. 下一实施批次

第一批只处理现有资产，不并行铺开大量新组件：

1. API metadata一致性和两个已知Docs漂移；
2. outline元数据、focus token和已有组件视觉状态；
3. ZCode、Shiki可选子入口和Docs源码替换；
4. ControllableState、Collection、Selection、ListNavigation和fast-check不变量；
5. ZInput、ZField、ZButton、ZProvider回填共享合同；
6. Docs目录、样式、路由、搜索和E2E矩阵整理。

完成这批并保持现有bundle、SSR、HMR和浏览器合同后，再进入P3交互组件。
