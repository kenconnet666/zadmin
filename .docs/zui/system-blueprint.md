# ZUI 主题、基础设施与完整组件系统总蓝图

> 状态：已于2026-08-30批准进入无人值守持续实施。本文是ZUI未来演进总纲；组件表仍是上限蓝图，只有进入对应S阶段并完成前置合同后才获得实现授权。

## 1. 目标与边界

ZUI是面向浏览器与通用桌面WebView的第一方Svelte组件系统。它同时提供：

- 类型安全的ICSS与Theme；
- 原生语义优先的Svelte组件；
- 自研受控/非受控、集合、键盘、焦点、浮层和表单基础设施；
- SvelteKit SSR、CSP、ShadowRoot、HMR和浏览器运行时；
- 组件metadata、文档站、测试工具、package与发布合同。

明确边界：

- 普通Web和桌面WebView共用ZUI；
- Miniapp使用自己的移动端组件与运行时，不复用ZUI DOM组件；
- 不依赖Bits UI、Melt UI、Headless UI、Radix封装、TanStack组件或其他组件库；
- 可以研究这些项目的职责拆分，但Trigger、Content、Item、Collection、FocusScope和Layer由ZUI自己实现；
- `@floating-ui/dom`只负责几何定位，不接管组件状态、焦点或可访问性；
- Lucide是必需peer dependency，用户直接按单图标子路径使用，ZUI不转出整个图标包；
- Shiki保持`@zadmin/zui/code`可选边界；
- 不规划二维码组件；
- 不把图表、富文本编辑器、地图、上传服务端、文件管理器等大型业务系统伪装成基础组件。

## 2. 不可破坏的设计原则

### 2.1 目录和文件

- 同一目录的直接子项尽量全部是目录或全部是代码文件；
- 直接子项通常保持5–15个，真实大分类可放宽到5–30个；
- 不为满足数量创建无意义的一文件目录；
- 简单组件继续在分类目录中使用单个`.svelte`文件；
- Props、公开类型、recipe、metadata和静态常量与组件实现共置；
- 多部件组件出现后统一进入`components/compound/<component>/`，避免在简单组件分类中混入零散目录。

### 2.2 第一方样式

- ICSS builder回调统一命名为`s`；
- CSS标准关键字缺失时，先补属性元数据、类型、序列化和测试，再使用`s.property.keyword`；
- 稳定视觉值必须提升为用途明确的Theme token；
- 结构性`0`、百分比、运行时数据和一次性算法常量不机械token化；
- 第一方组件尽量不保留CSS文件；只有字体导入、reset、根尺寸和浏览器启动前主题等必要全局CSS例外。

### 2.3 原生语义与ARIA

- 能用原生`button`、`input`、`label`、`fieldset`、`table`时不使用`div + role`模拟；
- 复合Widget按WAI-ARIA APG的角色、状态、属性和键盘模式设计；
- APG不是设计系统，视觉和API由ZUI决定，但成熟键盘约定视为实现要求；
- 焦点、选中、激活、展开和当前项是不同状态，不能合并为一个boolean；
- 所有交互同时考虑键盘、鼠标、触摸、屏幕阅读器、RTL、forced-colors和缩放。

### 2.4 API和状态

- 非受控：`defaultValue`或`defaultOpen`；
- 受控：`value`或`open`；
- Svelte绑定：`bind:value`或`bind:open`；
- 用户回调：`onValueChange`、`onOpenChange`；
- 外部更新不触发用户回调；
- 用户操作每次只触发一次回调；
- 原生DOM事件继续透传；
- `disabled`、`readonly`、`required`尽量落到原生属性；
- 复合表单组件负责hidden input、FormData和reset合同。

### 2.5 生命周期

- 每个监听器、Observer、timer、RAF、Portal、样式owner和Floating subscription都必须有明确销毁路径；
- HMR重建资源后清理旧资源，不做隐式原地替换；
- SSR首屏输出必须与hydrate初值一致；
- request-local、Document、ShadowRoot和WebView资源不能共享错误的全局所有权。

## 3. 当前资产与必须优先整改的内容

未来组件开始前，先完成现有基础设施和9个公开组件的整改。不能用新增组件掩盖已有合同问题。

### 3.1 ICSS与Compiler

当前优势：

- class-only公开API；
- 静态结构规则与动态变量分离；
- compiler carrier不增加wrapper；
- Browser、SSR、ShadowRoot和HMR具有统一Registry；
- recipe与slot recipe已经具备稳定分支和bundle门禁。

继续整改：

1. 属性元数据完整性：补齐新组件实际需要的关键字、单位、逻辑属性、scroll、grid、animation和forced-colors能力；
2. Recipe优先级：固定base、variant、compound、用户class和用户style的级联合同；
3. 编译诊断：错误包含文件、组件、callsite、属性、owner和修复建议；
4. 动态结构上限：超限时按owner报告，不静默增长CSS；
5. HMR：模块移除、重命名和recipe分支删除后清理旧规则；
6. SSR：并发request registry不串CSS，CSP nonce/hash与critical CSS保持一致；
7. Source map：发布包定义跳转可以定位到真实源码；
8. Package fixture：根入口、compiler、runtime、internal、metadata、testing和code都从tarball真实导入；
9. `./internal`只允许compiler生成代码和框架适配层使用；
10. 不新增`css`、`sx object`、Emotion兼容层或任意object-style API。

### 3.2 Theme

当前Theme已经具备严格schema、语义颜色、尺寸、间距、字体、阴影、motion和代码表面，但仍需从“单套值对象”演进为完整主题系统：

- 区分基础色板、语义token和组件recipe；
- 增加surface层级、inverse内容、interactive状态和overlay语义；
- `colorScheme`、contrast、density和motion成为Provider上下文；
- 高对比度和reduced motion不是新主题复制，而是独立轴；
- Theme切换需要验证已有class/Registry复用与旧Theme资源回收；
- 主题导入导出未来可对接DTCG格式，但运行时仍使用冻结的强类型对象。

### 3.3 Runtime现状

当前`src/runtime`包含：

```text
compiler-bridge.ts
context.ts
controllable-state.svelte.ts
field-context.ts
form-control.svelte.ts
root-style.ts
```

整改要求：

- `context`补density、contrast、motion、translations、portalContainer和idPrefix；
- `controllable-state`补受控模式变化诊断、reset和只读不变量；
- `field-context`与`form-control`明确视觉Field和表单状态所有权；
- `root-style`减少组件重复接线，但不能隐藏真实DOM root；
- `compiler-bridge`保持最小内部表面，不成为业务工具箱。

当runtime直接文件超过15个时再拆为：

```text
runtime/
  foundation/  context、root、controlled state、presence、ids、compiler bridge
  collection/  collection、selection、navigation、typeahead、virtualizer
  layer/       portal、stack、dismiss、focus、scroll lock、floating
  form/        field、form value、validation、reset、hidden input
```

拆分前要求每个子目录有真实消费者，不预建空目录。

### 3.4 Docs现状

当前Docs已完成：

- `app/content/framework/views`目录收口；
- 组件`doc.ts`与Demo共置；
- metadata驱动通用ComponentPage；
- 亮色与赛博朋克暗色主题；
- 真实Demo源码`?raw`；
- ZCode高亮、复制、展开、TOC、搜索和Axe路径。

继续整改：

- 增加Theme Lab、density、contrast、motion和RTL切换；
- 每个组件页显示键盘矩阵、ARIA合同、data attributes和表单行为；
- metadata增加events、bindings、snippets、parts、CSS states和since；
- 展示bundle增量、SSR支持、HMR资源和依赖边界；
- 增加组件API diff与breaking change报告；
- 长Demo增加fixture而不是在页面文件中堆业务数据；
- `.docs`继续只做内部工程文档，不直接渲染到网页站。

## 4. 现有9个组件整改矩阵

### 4.1 ZProvider

现状：Theme、colorScheme、locale、direction、runtime。

目标：

- 新增`density`、`contrast`、`motion`、`portalContainer`、`translations`、`idPrefix`；
- 嵌套Provider只覆盖显式提供的轴；
- `motion="auto"`尊重`prefers-reduced-motion`，SSR使用稳定fallback；
- `contrast="auto"`可读取`prefers-contrast`，但显式Prop优先；
- `portalContainer`允许Document、ShadowRoot和WebView隔离；
- 提供开发期Context inspector，不进入生产bundle。

### 4.2 ZBox

现状：严格`div`根和ICSS承载。

目标：

- 保持严格`div`容器，不扩张成万能属性或多态组件；
- sectioning语义由调用方使用原生元素或职责明确的组件表达；
- 支持ref、class、style、data/aria和事件完整透传；
- 不增加margin、padding、color等重复快捷Props，样式走ICSS；
- 验证SSR、attachment carrier和自定义元素边界。

### 4.3 ZStack

现状：方向、对齐、分布、gap、wrap。

目标：

- 统一逻辑方向和RTL；
- 数字gap继续走动态变量，token gap走稳定recipe；
- 增加可选`separator` snippet，但不内置Divider状态；
- 不在ZStack中混入Grid、responsive object和Container能力；
- 删除与Svelte/Theme重复的旧类型别名。

### 4.4 ZText

现状：有限语义元素、size、weight、tone。

目标：

- 保持有限`as`集合和真实语义，不用role伪造heading；
- 增加`truncate`、`lineClamp`和`tabularNumbers`；
- truncate不默认写title，避免擅自改变可访问名称；
- tone扩展到success、warning、danger、accent、inverse；
- 长文本、CJK、RTL和用户缩放下保持可读。

### 4.5 ZIcon

现状：Lucide常用图标manifest、Theme尺寸、ARIA和真实SVG ref。

目标：

- 继续保留少量系统常用名称；
- 业务图标直接从`@lucide/svelte/icons/*`导入；
- 增加`strokeWidth`和`absoluteStrokeWidth`透传；
- `label`、外部`aria-label`和装饰模式优先级固定；
- 不接受任意SVG HTML字符串；
- 图标产物继续记录tree-shaken gzip与依赖构成；发现明显异常时人工审计，不设置自动字节上限。

### 4.6 ZCode

现状：独立package入口、可选Shiki、亮暗scheme、embedded、SSR纯文本fallback。

目标：

- scheme默认继承Provider；
- 增加语言label、可选copy slot和长代码折叠能力，但不变成CodeCard；
- highlighter按语言/主题复用并有LRU上限；
- highlight竞态、组件销毁和语言失败回退可证明；
- 代码仍是文本节点，不接受外部HTML；
- `ZCodeCard`如未来出现，放在Docs或Utility组合层，不扩张ZCode核心。

### 4.7 ZButton

现状：primary、secondary、danger、ghost，三种尺寸，loading、disabled、snippet和原生button语义。

目标：

- 增加`start`、`end`、`loadingIndicator`稳定示例和宽度保持；
- icon-only要求显式可访问名称；
- `loading`保持disabled与`aria-busy`，不重复触发点击；
- pressed/toggle语义不塞进ZButton，单独实现ZToggleButton；
- link语义不塞进ZButton，使用ZLink；
- density影响尺寸recipe，但显式size优先；
- destructive与danger命名统一，只保留一个公开术语。

### 4.8 ZInput

现状：文本输入、受控/非受控、Field上下文和原生属性。

目标：

- 明确`value/defaultValue/bind:value/onValueChange`顺序；
- IME composition期间不错误提交中间值；
- reset回到初始defaultValue，受控值由owner同步；
- disabled、readonly、required、invalid和Field上下文优先级固定；
- prefix/suffix/clear不直接塞进原子Input，由未来InputGroup组合；
- number、date、time、textarea分别使用独立组件，不靠`type`无限扩张。

### 4.9 ZField

现状：label、description、messages、required和Field/Input语义连接。

目标：

- label、description、messages支持字符串与Snippet；
- error支持稳定数组，不在每次输入时重复朗读历史错误；
- `aria-describedby`顺序稳定且无重复ID；
- 视觉Field不拥有value、touched、dirty、validating；
- 表单状态由未来ZForm/ZFormField层管理；
- 支持fieldset/legend型分组，但不让单控件Field伪装group。

## 5. Theme系统总设计

### 5.1 主题预设

已提供6套官方预设：

| 预设                | Scheme | 定位          | 主要视觉                       |
| ------------------- | ------ | ------------- | ------------------------------ |
| `auroraLight`       | light  | 默认明快主题  | 蓝、紫、青，多层浅色surface    |
| `paperLight`        | light  | 内容/后台主题 | 暖白、墨色、陶土强调，低阴影   |
| `neonDark`          | dark   | 赛博朋克主题  | 近黑蓝、霓虹青、洋红、黄色焦点 |
| `midnightDark`      | dark   | 专业暗色主题  | 深蓝灰、冷白、低饱和蓝紫       |
| `highContrastLight` | light  | 高对比度      | 纯白、近黑、强边界，少装饰     |
| `highContrastDark`  | dark   | 高对比度      | 近黑、纯白、强焦点，少透明度   |

全部预设统一从一个入口导出：

```ts
import {
	auroraLight,
	paperLight,
	neonDark,
	midnightDark,
	highContrastLight,
	highContrastDark
} from '@zadmin/zui/themes';
```

不为每套主题增加一个package subpath。

### 5.2 主题维度

主题值和使用偏好分离：

```ts
type ColorScheme = 'dark' | 'light';
type Contrast = 'high' | 'normal' | 'auto';
type Density = 'compact' | 'comfortable' | 'spacious';
type Motion = 'full' | 'reduced' | 'auto';
type RadiusStyle = 'rounded' | 'sharp';
```

推荐Provider形态：

```svelte
<ZProvider
	theme={neonDark}
	colorScheme="dark"
	contrast="normal"
	density="compact"
	motion="auto"
	direction="ltr"
	locale="zh-CN"
>
	{@render children?.()}
</ZProvider>
```

不把每种组合复制成新主题，例如不创建：

```text
neonDarkCompact
neonDarkCompactReducedMotion
neonDarkHighContrastCompact
```

### 5.3 Token分层

第一层：基础值，仅Theme作者使用。

```text
palette
dimension scale
font scale
motion curve
```

第二层：语义token，组件只能消费这一层。

```text
canvas
surface / surfaceRaised / surfaceSunken
overlay
border / borderStrong
text / textMuted / textSubtle / textInverse
primary / primaryHover / primaryActive / primarySubtle / onPrimary
accent / accentHover / accentActive / accentSubtle / onAccent
info / success / warning / danger及各自subtle/on色
focus / selection
codeBackground / codeBorder / codeText / codeMuted / codeSelection
```

第三层：recipe决策。

```text
Button primary使用primary/onPrimary
Alert danger使用dangerSubtle/danger
Dialog使用surfaceRaised/overlay
MenuItem highlighted使用primarySubtle/text
```

暂不增加组件专属token，如`buttonPrimaryBackground`。只有至少3套主题证明通用语义token不足时才新增。

### 5.4 DTCG互操作

Design Tokens Community Group格式定义了类型、group、alias/reference和composite token。ZUI未来可以提供build-time导入导出：

```text
DTCG JSON
  → validate
  → resolve references
  → map to ZuiTheme
  → freeze
  → emit TypeScript
```

不在浏览器运行时解析任意Token JSON。DTCG适配属于compiler/tooling，不进入组件bundle。

## 6. 系统基础设施路线

### 6.1 Foundation

| 模块            | 职责                         | 首个消费者             |
| --------------- | ---------------------------- | ---------------------- |
| `ids`           | SSR稳定ID、Provider prefix   | Field、Dialog、Tabs    |
| `presence`      | mounted/unmounted与退出动画  | Dialog、Popover、Toast |
| `direction`     | RTL逻辑方向                  | Tabs、Slider、Menu     |
| `locale`        | 文案与格式能力               | Calendar、DateField    |
| `press`         | pointer/keyboard统一按压语义 | Button、MenuItem       |
| `hover`         | hover能力与触摸过滤          | Tooltip、HoverCard     |
| `focus-visible` | 焦点来源与可见状态           | 全部交互组件           |

### 6.2 Collection

| 模块                | 职责                              | 消费者                          |
| ------------------- | --------------------------------- | ------------------------------- |
| `collection`        | key注册、顺序、动态增删、disabled | Menu、Select、Tabs、Tree、Table |
| `selection`         | none/single/multiple、受控Set     | Select、Listbox、Tree、DataGrid |
| `list-navigation`   | 上下左右、Home、End、wrap         | Menu、Tabs、Listbox             |
| `roving-focus`      | tabindex所有权与焦点进入          | RadioGroup、Toolbar、Menu       |
| `active-descendant` | 容器焦点与活动项                  | Combobox、虚拟Listbox           |
| `typeahead`         | 缓冲、超时、locale比较            | Menu、Select、Tree              |
| `virtualizer`       | 可见区间、overscan、滚动定位      | VirtualList、DataGrid、Tree     |

Selection统一使用稳定key集合：

```ts
type Selection = 'all' | ReadonlySet<Key>;
```

不以数组索引作为业务key。动态加载、排序和虚拟化后仍必须保持选择。

### 6.3 Layer与浮层

| 模块                | 职责                                     |
| ------------------- | ---------------------------------------- |
| `portal`            | Document/ShadowRoot目标、SSR占位         |
| `layer-stack`       | modal层级、Escape归属、pointer屏蔽       |
| `dismissable-layer` | outside pointer/focus、Escape、分支元素  |
| `focus-scope`       | 初始焦点、循环、恢复、嵌套scope          |
| `scroll-lock`       | body/容器锁定、滚动条补偿、iOS策略       |
| `inert-others`      | modal外内容inert/aria-hidden恢复         |
| `floating`          | Floating UI定位、autoUpdate、arrow、size |
| `presence`          | 退出动画后再销毁DOM                      |

Floating UI只使用：

```text
offset
flip
shift
size
arrow
hide
inline
autoUpdate
```

middleware顺序成为ZUI合同；定位与动画transform使用两个DOM层，避免互相覆盖。

### 6.4 Form

| 模块            | 职责                                            |
| --------------- | ----------------------------------------------- |
| `form-control`  | id、name、disabled、readonly、required、invalid |
| `form-value`    | value序列化、hidden input、FormData             |
| `form-reset`    | 默认值快照与owner reset                         |
| `validation`    | Standard Schema、sync/async、竞态取消           |
| `messages`      | error/warning/success、aria-live策略            |
| `form-registry` | 字段注册、提交、首错聚焦、状态聚合              |

Standard Schema保持协议边界，不封装某个验证库。Schema验证不会进入原子Input；由ZForm/ZFormField拥有。

### 6.5 Date与Number

- 日期逻辑使用`@internationalized/date`；
- 日期值保持CalendarDate/ZonedDateTime等明确类型，不混用原生Date猜时区；
- NumberField使用Intl.NumberFormat和locale解析，不用`parseFloat`作为完整输入模型；
- DateField/TimeField先完成segment编辑、方向键、Home/End和输入法合同，再实现Picker；
- Calendar、DatePicker、DateRangePicker共享DateState，不复制日期算法。

## 7. 多部件组件API

ZUI自己实现部件关系，但不复制Bits UI的实现。

公开命名使用平铺的Z前缀：

```svelte
<ZSelect bind:value>
	<ZSelectTrigger>...</ZSelectTrigger>
	<ZSelectContent>
		<ZSelectItem value="a">A</ZSelectItem>
	</ZSelectContent>
</ZSelect>
```

不使用难以tree-shake和补全的运行时namespace对象。

物理目录：

```text
components/compound/select/
  ZSelect.svelte
  ZSelectTrigger.svelte
  ZSelectContent.svelte
  ZSelectItem.svelte
  context.ts
  types.ts
```

简单组件继续保持：

```text
components/gene/ZButton.svelte
components/input/ZInput.svelte
```

部件Context必须：

- 有唯一scope，支持同类组件嵌套；
- 缺少Root时开发环境抛出明确错误；
- 不暴露DOM查询作为主要注册机制；
- Item动态增删时更新Collection；
- Content卸载时清理Layer、FocusScope和Floating资源；
- Root集中拥有open/value等状态，部件只消费合同。

## 8. 公共组件完整规划

以下是上限蓝图，不代表全部进入近期开发。

### 8.1 Gene与基础语义

| 组件            | 状态         | 说明                               |
| --------------- | ------------ | ---------------------------------- |
| ZProvider       | 已有，需整改 | Theme与系统上下文                  |
| ZBox            | 已有，需整改 | 最小多态容器                       |
| ZText           | 已有，需整改 | 有限文本语义                       |
| ZIcon           | 已有，需整改 | 常用Lucide封装                     |
| ZCode           | 已有，需整改 | 安全代码展示                       |
| ZButton         | 已有，需整改 | 原生按钮                           |
| ZLink           | 规划         | 原生anchor、external、disabled语义 |
| ZSeparator      | 规划         | horizontal/vertical语义分隔        |
| ZVisuallyHidden | 规划         | 屏幕阅读器文本                     |
| ZKbd            | 规划         | 键盘按键展示                       |
| ZToggleButton   | 规划         | `aria-pressed`独立状态             |
| ZCopyButton     | 规划         | Clipboard状态组合，不进入ZButton   |

### 8.2 Layout

| 组件         | 依赖                                 |
| ------------ | ------------------------------------ |
| ZStack       | 已有，需整改                         |
| ZGrid        | ICSS Grid属性完整性                  |
| ZContainer   | 尺寸与inline padding token           |
| ZCenter      | 无                                   |
| ZCluster     | wrap与逻辑gap                        |
| ZSpacer      | flex/grid布局                        |
| ZAspectRatio | CSS aspect-ratio                     |
| ZScrollArea  | scrollbar、RTL、键盘                 |
| ZResizable   | pointer capture、方向键、constraints |
| ZSplit       | Resizable、持久化比例                |
| ZSticky      | offset和容器边界                     |

不再新增与ZStack重复的ZFlex/ZSpace；需要行布局时使用`ZStack direction="row"`。

### 8.3 Input与Form

| 组件             | 基础设施                                |
| ---------------- | --------------------------------------- |
| ZField           | 已有，需整改                            |
| ZInput           | 已有，需整改                            |
| ZInputGroup      | prefix/suffix/action组合                |
| ZTextarea        | controllable、autosize                  |
| ZNumberField     | number state、locale、stepping          |
| ZCheckbox        | form-value、indeterminate               |
| ZCheckboxGroup   | collection、selection、form-value       |
| ZRadioGroup      | roving-focus、selection                 |
| ZSwitch          | checkbox语义、form-value                |
| ZSlider          | pointer、keyboard、RTL、form-value      |
| ZRangeSlider     | 多thumb约束                             |
| ZRating          | radio/slider模式决策                    |
| ZSegmented       | 单选selection、roving-focus、紧凑视觉   |
| ZSelect          | collection、selection、layer、form      |
| ZCombobox        | active-descendant、filter、layer        |
| ZMultiSelect     | selection、tags、form                   |
| ZCascader        | 分层collection、路径value、floating     |
| ZTreeSelect      | Tree、Combobox、selection               |
| ZTransfer        | 双collection、selection、filter         |
| ZMention         | Textarea、trigger parser、Combobox      |
| ZTagsInput       | collection、编辑、删除、粘贴            |
| ZPinInput        | 多格输入、paste、autocomplete           |
| ZColorPicker     | color state、popover、fields            |
| ZFileUpload      | 原生file input、drop zone、队列         |
| ZDateField       | date segments、locale                   |
| ZTimeField       | time segments、locale                   |
| ZCalendar        | date grid、range、keyboard              |
| ZDatePicker      | DateField、Calendar、Popover            |
| ZDateRangePicker | range state、双Calendar策略             |
| ZForm            | registry、Standard Schema、submit/reset |
| ZFormField       | 字段状态与ZField组合                    |

### 8.4 Navigation与Collection

| 组件            | 基础设施                              |
| --------------- | ------------------------------------- |
| ZTabs           | roving-focus、selection、orientation  |
| ZAccordion      | collection、single/multiple、presence |
| ZBreadcrumb     | 原生nav/ol                            |
| ZPagination     | page model、locale                    |
| ZSteps          | current/status、可选交互              |
| ZToolbar        | roving-focus、orientation             |
| ZMenu           | collection、layer、typeahead          |
| ZDropdownMenu   | Menu、Trigger、Floating               |
| ZContextMenu    | Menu、pointer坐标、Layer              |
| ZNavigationMenu | collection、layer、延迟状态           |
| ZCommand        | filter、active-descendant、keyboard   |
| ZCommandPalette | Command、Dialog                       |
| ZTree           | tree state、selection、typeahead      |
| ZAnchor         | heading registry、scrollspy           |
| ZBackTop        | scroll container、reduced motion      |

### 8.5 Overlay

| 组件         | 基础设施                                      |
| ------------ | --------------------------------------------- |
| ZTooltip     | hover/focus、Floating、delay、nonmodal        |
| ZPopover     | Trigger/Content、Floating、dismiss            |
| ZHoverCard   | hover intent、Floating、nonmodal              |
| ZDialog      | Portal、Layer、FocusScope、inert、scroll lock |
| ZAlertDialog | Dialog、强制显式操作                          |
| ZDrawer      | Dialog、placement、gesture可后置              |
| ZPopconfirm  | Popover、focus与危险操作                      |
| ZTour        | Layer、Floating、步骤状态、mask               |

ZSheet不单独实现，作为ZDrawer的尺寸和placement变体讨论，避免重复组件。

### 8.6 Data Display

| 组件                   | 说明                                          |
| ---------------------- | --------------------------------------------- |
| ZAvatar / ZAvatarGroup | 图片fallback、名称、group overflow            |
| ZBadge                 | status/count/dot                              |
| ZTag                   | 静态标签、可关闭                              |
| ZCard                  | header/content/footer snippets                |
| ZList                  | 原生list与空状态                              |
| ZDescriptionList       | dl/dt/dd语义                                  |
| ZTable                 | 原生table样式壳                               |
| ZDataTable             | column model、sort、selection、virtualization |
| ZTimeline              | ol语义与状态                                  |
| ZStatistic             | 数字格式与趋势                                |
| ZProgress              | progressbar、line/circle视图                  |
| ZMeter                 | 原生meter或ARIA meter                         |
| ZSkeleton              | reduced motion与shape                         |
| ZEmpty                 | 图标、标题、操作组合                          |
| ZImage                 | loading/error/fallback                        |
| ZCarousel              | collection、roving、autoplay策略              |
| ZCalendar              | 同时属于日期与展示，状态内核唯一              |
| ZVirtualList           | virtualizer公共消费者                         |

ZTable只负责原生表格语义和视觉；ZDataTable才拥有column、sort、selection和virtualization。两者不合并为一个超大组件。

### 8.7 Feedback与服务

| 组件              | 说明                                    |
| ----------------- | --------------------------------------- |
| ZAlert            | inline反馈，info/success/warning/danger |
| ZSpinner          | 加载指示，reduced motion                |
| ZLoadingBar       | 页面级进度                              |
| ZResult           | 状态页组合                              |
| ZToast / ZToaster | 临时消息队列、live region、pause        |
| ZNotification     | 更丰富且可持续的通知卡片                |

Toast、Message、Notification共享同一个队列和live-region内核；不复制三套service基础设施。

### 8.8 Utility

| 组件             | 说明                               |
| ---------------- | ---------------------------------- |
| ZCountdown       | 时间源、暂停、完成事件             |
| ZNumberAnimation | Intl格式、reduced motion           |
| ZMarquee         | overflow检测后启用、reduced motion |
| ZWatermark       | Canvas/SVG生成、observer防篡改可选 |
| ZCodeCard        | ZCode、复制、折叠的组合层          |

明确不规划ZQRCode。

## 9. 实施阶段与依赖顺序

### S0：现有资产收口（已完成，CI run 33269196968）

范围：ICSS、Theme、Runtime、Docs和已有9个组件。

完成条件：

- 本文第3、4章整改项形成明确issue/metadata；
- 现有组件API没有已知文档漂移；
- package、tarball、SSR、HMR和bundle合同稳定；
- Docs展示亮暗主题、RTL、density、contrast和motion；
- 不新增公开组件。

### S1：主题系统与无状态基础组件（已完成，CI run 33269196968）

实现：

```text
auroraLight
paperLight
neonDark
midnightDark
highContrastLight
highContrastDark
ZLink
ZSeparator
ZVisuallyHidden
ZKbd
ZAspectRatio
ZContainer
```

同时扩展Provider轴和Theme Lab。

### S2：无浮层交互（已完成，2026-08-30生产审计）

先实现基础设施：

```text
ids
press
focus-visible
collection
selection
roving-focus
list-navigation
typeahead
form-value
```

再实现：

```text
ZToggleButton
ZCheckbox
ZRadioGroup
ZSwitch
ZTabs
ZAccordion
ZPagination
ZSlider
```

### S3：Layer与简单浮层（已完成，2026-08-30生产审计）

先实现：

```text
portal
presence
layer-stack
dismissable-layer
focus-scope
scroll-lock
inert-others
floating
```

再实现：

```text
ZTooltip
ZPopover
ZDialog
ZAlertDialog
ZDrawer
ZPopconfirm
```

### S4：集合输入（已完成，2026-08-30生产审计）

```text
ZMenu
ZDropdownMenu
ZContextMenu
ZSelect
ZCombobox
ZMultiSelect
ZCascader
ZTreeSelect
ZTransfer
ZMention
ZSegmented
ZTagsInput
ZCommand
ZCommandPalette
ZTree
```

### S5：Form与结构化输入（已完成，2026-08-30生产审计）

```text
ZInputGroup
ZTextarea
ZNumberField
ZPinInput
ZColorPicker
ZFileUpload
ZForm
ZFormField
```

### S6：日期时间（已完成，2026-08-30生产审计）

```text
ZDateField
ZTimeField
ZCalendar
ZDatePicker
ZDateRangePicker
```

日期组件完成后再评估DateTimePicker，不提前把日期和时间状态塞在一个组件。

### S7：展示与反馈（已完成，2026-08-30生产审计）

```text
Avatar、Badge、Tag、Card、List、DescriptionList
Alert、Spinner、LoadingBar、Result、Toast
Progress、Meter、Skeleton、Empty、Timeline、Statistic
```

### S8：大型数据组件（已完成，2026-08-30生产审计）

```text
ZTable
ZVirtualList
ZDataTable
ZTree大数据模式
ZCarousel
ZTour
```

DataTable必须在Collection、Selection、Virtualizer和Table均被真实组件验证后开始。

## 10. 每个组件进入实现前的必备文档

每个组件的`doc.ts`或内部设计记录必须先明确：

1. 使用场景与明确非目标；
2. 原生HTML优先方案；
3. APG pattern与偏离理由；
4. DOM anatomy；
5. Props、bindings、callbacks、snippets；
6. 受控/非受控状态图；
7. 键盘矩阵；
8. ARIA roles/states/properties；
9. data attributes；
10. FormData、hidden input和reset；
11. RTL、locale、density、contrast和motion；
12. SSR、HMR、ShadowRoot和Portal；
13. 销毁清理；
14. browser bundle构成、tree-shaking与重依赖说明；
15. Docs Demo和云端验收矩阵。

缺少其中关键项时不开始编码。

CI实际构建runtime、layer、每个组件和ZCode shell并记录tree-shaken gzip，但不设置自动字节上限。只有发现明显异常的大产物时才人工检查依赖图和重复代码；compiler/server代码、禁用依赖和可选Shiki边界仍是自动失败门禁。

## 11. Metadata扩展

metadata已经扩展为：

```ts
interface ZuiComponentMetadata {
	id: string;
	name: `Z${string}`;
	category: ComponentCategory;
	status: ComponentStatus;
	since: string;
	summary: string;
	source: string;
	importStatement: string;
	props: readonly PropMetadata[];
	bindings: readonly BindingMetadata[];
	events: readonly EventMetadata[];
	snippets: readonly SnippetMetadata[];
	parts: readonly PartMetadata[];
	states: readonly DataStateMetadata[];
	keyboard: readonly KeyboardMetadata[];
	dependencies: readonly string[];
}
```

metadata仍与组件源码共置；Docs只补教学内容，不重新手写事实。

`.docs/zui/api-contract.json`记录全部metadata组件与公开entrypoint的逐项SHA-256和总指纹。`api:contract:check`使用TypeScript AST只提取公开声明，不因私有recipe或实现改动误报；公开API变化必须先审阅，再显式执行`api:contract:update`。发布时用该快照判断：

```text
新增Prop              feature
放宽类型              feature/fix
删除Prop              breaking
修改默认值            breaking或明确migration
新增data-state        feature
删除part/state        breaking
```

## 12. Docs系统页面（已完成，2026-08-30）

指南由`content/guides.ts`单一注册表提供事实数据，通用`GuidePage`统一使用ZUI渲染；Theme Lab保留专用交互页面：

```text
Getting Started
ICSS
Theme Lab
Accessibility Lab
SSR/CSP
HMR
WebView
Package and Tree-shaking
```

每个组件页逐步增加：

- Overview；
- Anatomy；
- 实时Demo；
- 可复制源码；
- Props/Bindings/Events/Snippets；
- Keyboard Matrix；
- ARIA合同；
- data-state/part；
- Theme token与density预览；
- RTL、高对比度和reduced motion；
- bundle增量；
- GitHub源码与since。

Docs目录继续遵守：

```text
app/
content/
framework/
views/
```

组件内容继续使用：

```text
content/components/<category>/<component>/
  doc.ts
  Demo.svelte
```

## 13. 云端验收策略

本地编码阶段只使用WebStorm检查语法和IDE错误；完成阶段后提交并推送，不等待CI。

CI负责：

- TypeScript与Svelte完整检查；
- unit与fast-check状态不变量；
- Chromium、Firefox、WebKit；
- keyboard、focus、screen reader可检测合同；
- Axe与高对比度；
- Docs build与E2E；
- SSR并发、CSP、ShadowRoot与HMR；
- browser bundle构成记录、tree-shaking与未使用依赖排除；
- packed tarball、仓库外安装和npm dry-run；
- changeset与API快照。

每阶段的云端失败在后续任务读取并修复，不阻塞当前修改完成后的交付。

## 14. 依赖纪律

允许并已经确定用途：

| 依赖                      | 用途                                        |
| ------------------------- | ------------------------------------------- |
| `runed`                   | Svelte底层状态辅助，不能隐藏DOM和资源所有权 |
| `@floating-ui/dom`        | 浮层几何和autoUpdate                        |
| `@internationalized/date` | 日期、日历和时区模型                        |
| `@standard-schema/spec`   | Form验证协议                                |
| `tabbable`                | FocusScope候选元素                          |
| `@lucide/svelte`          | 必需peer图标组件                            |
| `shiki`                   | 可选代码高亮peer                            |

可能增加的依赖必须满足：

- 不是组件库；
- 不重复已有runtime能力；
- 有至少一个已批准组件消费者；
- 可tree-shake；
- SSR和浏览器边界明确；
- license、体积和维护状态可接受。

不因“以后可能用”提前安装依赖。

### 14.1 已有依赖API优先复用

ZUI自研的是组件合同、状态所有权和Svelte组合方式，不重复实现已经由当前依赖稳定提供的底层能力。

#### runed

优先评估并直接使用：

| API                                        | ZUI用途                                    |
| ------------------------------------------ | ------------------------------------------ |
| `Context`                                  | 新复合组件的类型安全Context封装            |
| `FiniteStateMachine`                       | 状态确实是有限图且进入/退出动作明确的组件  |
| `Debounced` / `useDebounce`                | typeahead、hover intent、异步搜索          |
| `Throttled` / `useThrottle`                | scroll、pointer move、resize反馈           |
| `ElementRect` / `ElementSize`              | Resizable、Virtualizer、浮层辅助测量       |
| `IsFocusWithin` / `ActiveElement`          | 复合控件焦点状态与FocusScope辅助           |
| `TextareaAutosize`                         | ZTextarea autosize，不重写高度测量         |
| `useEventListener`                         | 可销毁事件监听                             |
| `useResizeObserver`                        | CSS container query无法表达的行为测量      |
| `useIntersectionObserver` / `IsInViewport` | Lazy、Anchor、BackTop、可见状态            |
| `useMutationObserver`                      | 仅动态DOM确实需要观察时使用                |
| `PressedKeys`                              | Command/Shortcut组合键状态                 |
| `ScrollState`                              | ScrollArea、BackTop、滚动阴影辅助          |
| `PersistedState`                           | Docs偏好和显式持久状态，不作为组件隐式默认 |
| `onCleanup`                                | 组合式资源销毁                             |

不直接使用`onClickOutside`替代完整DismissableLayer，因为ZUI还需要Layer顺序、Portal branch、focus
outside和modal所有权；可以把它作为简单非嵌套场景的底层实现候选。

`FiniteStateMachine`只在状态图明显优于直接runes时使用。简单open/value不为了“模式”强行套状态机。

#### @floating-ui/dom

直接使用：

```text
computePosition
autoUpdate
offset
flip
shift
size
arrow
hide
inline
autoPlacement（只有产品允许自动位置时）
```

ZUI只增加Svelte响应式适配、middleware默认顺序、生命周期和Theme/data-state连接，不重写碰撞检测、clipping rect、缩放和RTL几何算法。

#### tabbable

FocusScope直接复用：

```text
tabbable
focusable
isTabbable
isFocusable
getTabIndex
```

ZUI负责scope边界、初始焦点、循环、恢复、nested layer和ShadowRoot策略，不自己维护一套CSS selector猜测所有可聚焦元素。

#### @internationalized/date

日期组件直接复用：

```text
CalendarDate
CalendarDateTime
Time
ZonedDateTime
DateFormatter
createCalendar
parseDate / parseTime / parseZonedDateTime
toCalendar / toZoned / toTimeZone
startOfWeek / endOfWeek / getWeeksInMonth
isSameDay / isToday / minDate / maxDate
```

ZUI负责Svelte state、segment编辑、键盘、ARIA、Range选择和视觉，不重写日历制、时区转换、月份天数和locale格式算法。

#### @standard-schema/spec

ZForm直接消费`StandardSchemaV1`：

```ts
schema['~standard'].validate(value);
```

并使用标准`value/issues/path`结果。ZUI不绑定Zod、Valibot或ArkType，也不复制Schema DSL；只负责竞态取消、字段path映射、错误展示和提交合同。

#### @lucide/svelte

- ZIcon常用manifest直接映射Lucide组件；
- 业务从`@lucide/svelte/icons/*`单图标导入；
- 不复制SVG path；
- 不动态导入整个图标全集；
- ZUI只补Theme尺寸、stroke、ARIA和ref。

#### Shiki

- 使用`createHighlighterCore`与JavaScript regex engine；
- 按需加载允许语言和主题；
- 不自己写语法解析或正则高亮器；
- ZUI负责缓存、竞态、SSR纯文本、安全文本节点和bundle边界。

### 14.2 平台、依赖与自研的决策顺序

实现一个基础能力前按以下顺序决策：

```text
原生HTML/浏览器API/现代CSS
  ↓ 不足
已有依赖的公开API
  ↓ 不足
ZUI薄适配层
  ↓ 仍无法满足组件合同
ZUI自研状态或算法
```

禁止：

- 现有依赖已有稳定算法时复制一份近似实现；
- 为统一命名把依赖完整包裹到无法升级；
- 使用依赖的私有入口或复制源码；
- 同一个职责同时保留依赖实现和自研实现但没有切换规则；
- 因为依赖存在就把组件状态所有权交给依赖。

允许的适配层必须很薄，并记录：

- 使用的依赖API；
- ZUI补充的合同；
- SSR/Browser边界；
- 清理函数；
- fallback；
- bundle影响；
- 依赖升级时的characterization tests。

### 14.3 Svelte 5、Node 24与TypeScript 6基线

#### Svelte 5.56+

组件实现优先使用：

```text
$state
$derived / $derived.by
$effect
$props
$bindable
Snippet / {@render}
attachments
typed context
class数组/对象
事件属性onclick/oninput等
<svelte:boundary>
```

规则：

- 不新增`export let`、`$:`、`on:`、`<slot>`和`$$restProps`旧模式；
- DOM生命周期优先attachment；第三方只提供action时使用`fromAction`转换；
- attachment中昂贵初始化只执行一次，响应数据放在内部`$effect`读取；
- attachments可以穿透props到真实root，优先用于ref、ICSS carrier和DOM增强；
- Snippet参数承担MUI slotProps的一部分能力，不创建VNode/JSX抽象；
- `$effect`不用于可以由`$derived`表达的纯计算；
- Context必须由Root拥有，part缺少Root时抛出开发错误；
- `<svelte:boundary>`用于Docs、异步内容或可恢复区域，不吞掉组件库编程错误；
- 不在声明式组件内部滥用imperative `mount/unmount`。

#### Node 24

Workspace、CI和工具脚本以Node 24为当前运行基线；公开package的`engines`是否从22提升到24，需要在使用Node 24专属API前单独决策。

优先能力：

```text
ESM
import.meta.dirname / import.meta.filename
native fetch / Request / Response / Headers
Web Streams
AbortController
AbortSignal.timeout / AbortSignal.any
structuredClone
crypto.randomUUID
Promise.withResolvers
DisposableStack / AsyncDisposableStack（工具脚本优先）
```

边界：

- Browser runtime不能因为Workspace使用Node 24而导入`node:*`；
- Compiler、pack和CI脚本可以使用Node能力，但入口必须保持Node-only；
- Node原生TypeScript type stripping只适合erasable syntax脚本，不替代Svelte preprocess和package declaration emit；
- 使用`DisposableStack`前确认目标入口只运行于Node或目标浏览器已满足支持矩阵；DOM组件仍优先使用attachment cleanup；
- 网络与异步任务接受AbortSignal，不自造取消token。

#### TypeScript 6

当前Svelte工具链继续使用TypeScript 6。TypeScript 7虽然已经发布，但Svelte等嵌入式语言工具仍需要TypeScript
6的程序化API，待官方工具链明确兼容后再升级。

配置方向：

```text
strict
moduleResolution: bundler（Web/Svelte package）
module: esnext或preserve
rewriteRelativeImportExtensions
verbatimModuleSyntax
noUncheckedSideEffectImports
exactOptionalPropertyTypes（分阶段启用）
noUncheckedIndexedAccess（分阶段启用）
isolatedDeclarations（发布入口评估）
显式types列表
```

TypeScript 6默认`types: []`，Node、Vitest等全局类型必须在对应tsconfig显式声明，不能依赖workspace偶然提升的`@types`。

编码约定：

- 使用type-only import/export；
- 使用`satisfies`校验metadata、Theme和registry且保留字面量类型；
- 使用discriminated union表达互斥Props；
- 使用template literal type约束data-state、source path和CSS变量；
- 使用`NoInfer`控制Theme/Recipe推导边界；
- 使用const type parameters保留variant/slot名称；
- 避免enum、namespace、parameter property等带运行时语义的TS专有结构，保持erasable syntax友好；
- Web使用bundler resolution，纯Node发布工具使用NodeNext，不在一个tsconfig混淆两种宿主模型；
- 不用类型体操掩盖不清晰的运行时API。

## 15. 明确非目标

- 不复刻旧ZUI所有组件和API；
- 不追求组件数量指标；
- 不实现二维码组件；
- 不封装第三方组件库；
- 不在基础组件内集成后端上传、通知推送或权限服务；
- 不用一个万能DataGrid代替Table/List/Tree；
- 不在一个DatePicker中同时塞入所有日期、时间、范围和时区模式；
- 不让Theme preset与density/motion/contrast形成组合爆炸；
- 不把Docs内部组件自动发布为ZUI组件。

## 16. 主流组件库参考与取舍

ZUI需要参考成熟库已经验证过的组件需求和API问题，但不追求它们的组件并集，也不继承框架特有实现。

### 16.1 Naive UI

值得参考：

- 完整但可tree-shake的组件目录；
- TypeScript驱动的Theme override；
- ConfigProvider统一尺寸、locale、主题和组件默认值；
- DataTable、Select、Tree等数据组件共享虚拟列表意识；
- 中文后台项目常用的组件覆盖面；
- 组件文档中Demo与API并列的组织。

选择吸收：

- Provider集中管理全局轴；
- Theme强类型和嵌套覆盖；
- 大数据组件默认考虑虚拟化，而不是完成后补救；
- DatePicker、TreeSelect、Cascader、Transfer等后台高频组件进入远期组件表；
- 组件应按实际引用tree-shake。

明确不照搬：

- 不为每个组件建立几十个颜色/边框Theme变量；
- 不在每个组件上重复`themeOverrides`对象；
- 不让组件级Theme override与全局CSS变量形成两套事实源；
- 不复制Vue injection、VNode和JSX实现；
- 不因为Naive UI组件超过90个就追求数量。

ZUI对应策略：优先使用少量稳定语义token和recipe variant；只有通用token无法表达至少3套正式主题时，才增加组件级token。

### 16.2 Ant Design

值得参考：

- 企业后台场景的完整信息架构；
- ConfigProvider统一locale、direction、theme与component config；
- Form、Table、Select、Cascader、Transfer、TreeSelect、Upload等高频业务基础组件；
- 组件文档对状态、尺寸和组合场景覆盖较完整；
- Design Token与组件token分层；
- Modal、Message、Notification等服务型组件的真实需求。

选择吸收：

- Form、Table、Collection、Date和Overlay作为独立基础设施轨道；
- Cascader、Transfer、TreeSelect、Mentions、Segmented进入中远期规划；
- ConfigProvider级默认值能力映射到ZProvider，但只增加经过验证的全局轴；
- Message、Toast、Notification共享服务内核；
- Table与DataTable分层，简单表格不承担全部企业数据能力。

明确不照搬：

- 不复制全部组件和ProComponents业务抽象；
- 不把Space、Flex、Layout等相近能力重复成多套布局组件；
- 不保留大量历史兼容Props；
- 不把Form Item、Input、Select的隐式魔法耦合成难以单独使用的系统；
- Ant Design包含QRCode不代表ZUI需要二维码组件；
- 不复制静态`Modal.confirm()`等脱离Svelte上下文的全局API，服务API必须有明确Provider owner。

### 16.3 Material UI

值得参考：

- root slot与内部slots的明确结构模型；
- variant作为视觉状态组合，而不是大量互相冲突的boolean；
- ThemeProvider、palette、typography、spacing、breakpoint、zIndex和transition分层；
- component/slots/slotProps对DOM结构替换的思考；
- focus-visible和可访问性状态的系统处理；
- Core与Data Grid等大型能力分层，不要求核心覆盖全部功能。

选择吸收：

- metadata记录parts/slots/data-state；
- 简单组件只允许root多态，复杂组件通过明确part/snippet扩展；
- variant、tone、size、shape使用正交枚举，避免boolean组合爆炸；
- 大型DataGrid晚于基础Table发布；
- 主题预设与组件结构解耦。

明确不照搬：

- 不实现`sx`对象语法，第一方和用户样式继续使用ICSS/class；
- 不引入Emotion/styled runtime；
- 不建立巨大的`theme.components[Component].styleOverrides`对象；
- 不复制React ownerState、forwardRef和slotProps类型复杂度；
- 不允许任意slot替换破坏原生语义和ARIA结构；
- 不绑定Material Design 2或3的视觉规范。

ZUI中的Svelte Snippet和复合部件Context承担MUI slots的一部分职责；ICSS recipe承担variant样式职责。

### 16.4 Element Plus

值得参考：

- 中文后台项目熟悉的API命名；
- `size`、`loading`、`disabled`、原生属性和ref的直接使用；
- Form、Table、DatePicker、Tree、Upload、Pagination的实用场景；
- ConfigProvider对size、locale和命名空间的集中配置；
- 清晰的Attributes、Events、Slots、Exposes文档结构。

选择吸收：

- Docs metadata按Props、Bindings、Events、Snippets、Exposes/Ref分区；
- 常用组件提供直接、低学习成本的默认API；
- Loading slot、图标slot和真实DOM ref保持明确；
- Size使用稳定枚举并支持Provider density，而不是任意倍数；
- 原生HTML属性尽量保持原名。

明确不照搬：

- 不复制Button上的`plain/text/bg/link/round/circle/dashed/color/dark/tag`boolean组合；
- ZButton使用`variant + tone + size + shape`，ZLink与ZToggleButton独立；
- 不允许`tag="div"`后只加role就假装拥有完整button键盘语义；
- 不复制Vue组件实例expose风格，Svelte只暴露必要DOM ref和方法；
- 不为兼容旧版本长期保留重复Props。

### 16.5 统一取舍规则

从任何组件库引入一个候选组件或API前，依次回答：

1. 是否是ZAdmin或通用Web的真实高频场景；
2. 是否已有原生HTML可以覆盖80%以上需求；
3. 是否与现有组件重复；
4. 是否需要新的共享基础设施；
5. 是否能在Svelte中形成更直接的Snippet/binding API；
6. 是否能保持SSR、HMR、ShadowRoot和WebView；
7. 是否能按需tree-shake；
8. 是否有完整键盘、ARIA、Form和销毁合同；
9. 是否能用Theme语义token表达多套视觉；
10. 不实现它时，业务是否仍能用ZBox/ICSS组合完成。

只在答案证明“组件边界有长期价值”时进入路线图。

## 17. 现代CSS与ICSS演进

新CSS能力优先用于减少JavaScript布局和状态代码，但必须有支持度判断、`@supports`
和fallback。ICSS负责把这些能力变成类型安全、可组合、可HMR的class规则。

### 17.1 优先采用

| CSS能力              | ZUI用途                                          | JavaScript减少             |
| -------------------- | ------------------------------------------------ | -------------------------- |
| logical properties   | RTL、书写方向、padding/margin/inset              | 删除左右方向分支           |
| container queries    | Card、InputGroup、Toolbar、DataTable工具栏自适应 | 减少ResizeObserver布局判断 |
| container units      | 可复用组件内尺寸比例                             | 减少视口耦合               |
| `:has()`             | Field focus/invalid、group状态、空内容状态       | 减少父组件状态镜像         |
| subgrid              | Form label、Descriptions、Table辅助布局          | 减少列宽同步               |
| `aspect-ratio`       | ZAspectRatio、Image、Skeleton                    | 删除padding hack           |
| `color-scheme`       | 原生控件、滚动条与表单明暗                       | 减少原生控件覆盖           |
| `accent-color`       | 原生checkbox/radio/progress fallback             | 减少自绘基础状态           |
| `color-mix()`        | hover/subtle色的主题派生                         | 减少运行时颜色计算         |
| OKLCH/relative color | Theme build-time色彩生成                         | 提升跨主题感知一致性       |
| `content-visibility` | 长文档、长列表非虚拟fallback                     | 减少不可见内容渲染成本     |

组件响应式优先看容器而不是全局viewport。Media query仍用于用户偏好和真正的设备/viewport能力。

### 17.2 渐进增强采用

| CSS/API                        | 计划                                                                   |
| ------------------------------ | ---------------------------------------------------------------------- |
| Popover API/top layer          | Tooltip/Popover/Menu可做平台增强；Layer、焦点和嵌套fallback仍由ZUI控制 |
| CSS Anchor Positioning         | 简单浮层可优先；复杂flip/shift/size继续用Floating UI fallback          |
| `@starting-style`              | Presence进入动画；不替代销毁时机管理                                   |
| `overlay`与discrete transition | top-layer退出动画；不支持时立即隐藏或使用Presence                      |
| View Transitions               | Docs路由和少量页面级过渡；不作为基础组件默认行为                       |
| scroll-driven animations       | BackTop、阅读进度、展示效果；必须尊重reduced motion                    |
| scroll-state queries           | Sticky header、ScrollArea阴影；保留普通selector/observer fallback      |
| style queries                  | density/theme自适应实验；当前只依赖custom property能力                 |

Native Popover不自动等于可访问Popover组件。Trigger关系、focus、Escape、outside pointer、modal与nonmodal行为仍需ZUI合同。

### 17.3 ICSS需要补充的能力

按真实消费者逐步增加：

```text
containerType
containerName
anchorName
positionAnchor
positionArea
viewTransitionName
contentVisibility
containIntrinsicSize
scrollbarGutter
overscrollBehavior
interpolateSize
transitionBehavior
overlay
accentColor
colorScheme
```

条件API候选：

```text
s._container('card (width >= 30rem)', ...)
s._supports('(anchor-name: --trigger)', ...)
s._media('(forced-colors: active)', ...)
s._startingStyle(...)
s._layer('zui.recipe', ...)
```

每个新增属性或关键字继续遵守：元数据、类型、序列化、compiler和测试同阶段完成。

### 17.4 Cascade Layers

评估固定层级：

```text
@layer zui.reset, zui.theme, zui.base, zui.recipe, zui.utility;
```

但用户class的优先级不能被ZUI layer意外压低。引入前需要在普通CSS、CSS Modules、Tailwind和用户ICSS组合中验证，不仅因为语法现代就启用。

### 17.5 高对比度与用户偏好

- `forced-colors: active`下不依赖box-shadow或background-image表达唯一状态；
- focus、selected、invalid和expanded使用border/outline/系统色fallback；
- `prefers-contrast`只作为`contrast="auto"`输入；
- `prefers-reduced-motion`控制motion轴，不删除必要状态反馈；
- `light-dark()`只适合平台级简单值，不替代显式Theme preset；
- Docs Theme Lab必须展示forced colors、reduced motion和200%缩放说明。

### 17.6 不应由CSS取代的逻辑

以下仍由Runtime负责：

- 受控/非受控状态；
- Collection顺序和动态注册；
- Selection；
- typeahead文本匹配；
- roving focus/active-descendant；
- FormData与reset；
- Dialog焦点恢复；
- 嵌套Layer的Escape所有权；
- Date/number解析；
- 虚拟区间计算。

CSS负责表现和可由平台可靠表达的关系，不能为了“无JS”牺牲语义与行为。

## 18. 已批准的执行决策

2026-08-30已授权无人值守持续实施，以下决策成为后续编码合同：

1. 六套官方主题统一从`@zadmin/zui/themes`公开，文档站以真实选择器和Theme Lab持续验收；
2. Theme偏好拆为scheme、contrast、density、motion四个主要轴；
3. 多部件组件使用平铺`ZSelectTrigger`等导出，不使用运行时namespace对象；
4. 复杂多部件组件统一进入`components/compound/<component>/`；
5. S1先完成主题和无状态基础组件，不抢跑Select或Dialog；
6. S2先用Checkbox、RadioGroup、Switch、Tabs验证Collection、Focus和FormValue；
7. Toast、Message、Notification共享一个服务内核；
8. ZTable与ZDataTable保持两个职责不同的组件；
9. 二维码、图表、富文本和地图不进入ZUI范围；
10. API snapshot和metadata diff成为发布门禁；
11. 主流组件库只作为需求、职责拆分和API反例参考，不成为依赖或兼容目标；
12. 现代CSS采用“优先平台能力 + `@supports` + Runtime fallback”；
13. Cascader、TreeSelect、Transfer、Mention、Segmented排在Collection基础设施之后；
14. ZButton拒绝Element Plus式boolean组合，继续使用正交枚举；
15. ZUI不实现MUI式`sx`与全局component styleOverrides；
16. ZBox保持严格`div`，不引入多态`as`；
17. 组件状态使用`candidate → approved → experimental → stable → deprecated`，蓝图候选不会自动成为公开承诺；
18. S4按Menu基础、Select/Listbox、Combobox/MultiSelect、层级集合、Command/Tree五个可独立验收批次实施。
19. bundle检查只记录gzip和验证浏览器依赖边界，不设置自动大小预算；明显异常产物由人工审计。

## 19. 与现有蓝图的关系

- [运行时CSS与组件API](./runtime-css-blueprint.md)：ICSS、Recipe、Compiler、Runtime细节；
- [基础设施与已有组件加固](./foundation-hardening-blueprint.md)：当前阶段的具体整改；
- [组件与展示站改进](./component-roadmap.md)：已有审计与中期路线；
- [文档站双主题](./docs-theme-blueprint.md)：当前Docs主题和视觉合同；
- 本文：主题扩展、基础设施依赖图、现有整改和完整组件系统的上层总纲。

旧文档与本文冲突时，待审阅通过后以本文为未来方向；已经落地的实现事实仍以源码和metadata为准。

## 20. 参考原则

- [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/)：组件角色、状态、键盘与焦点模式；
- [Floating UI](https://floating-ui.com/docs/middleware)：定位middleware、platform和autoUpdate，只复用几何职责；
- [React Aria Collection/Selection](https://react-spectrum.adobe.com/v3/collections.html)：稳定key、受控Set和Collection共享模型；
- [Design Tokens Community Group Format](https://www.designtokens.org/tr/2025.10/format/)：token
  type、group、alias与composite；
- [Svelte 5 attachments](https://svelte.dev/docs/svelte/@attach)与[snippets](https://svelte.dev/docs/svelte/snippet)
  ：runes、snippets、attachments、context和bindable；
- [Node 24 TypeScript](https://nodejs.org/docs/latest-v24.x/api/typescript.html)：原生TypeScript边界与erasable syntax；
- [TypeScript 6.0](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html)：现代ESM、bundler
  resolution和TS7迁移基线；
- [Naive UI](https://github.com/tusen-ai/naive-ui)：组件覆盖、类型安全主题、ConfigProvider和虚拟列表意识；
- [Ant Design](https://ant.design/components/config-provider)：企业后台组件谱系、Form/Table/Date/Overlay与ConfigProvider；
- [Material UI](https://mui.com/material-ui/customization/overriding-component-structure/)
  ：slots、variants、Theme分层和Core/X能力边界；
- [Element Plus](https://element-plus.org/en-US/component/button)：中文后台常用API、Attributes、Events、Slots和Exposes文档结构；
- [MDN现代CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries)：container
  queries、Popover/anchor positioning、starting-style、forced-colors和scroll-driven animations。

参考不等于依赖或照搬。ZUI保留自己的Svelte API、ICSS、Theme、Runtime、组件视觉和发布边界。
