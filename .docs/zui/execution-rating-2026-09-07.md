# E8 Rating 执行记录

日期：2026-09-07。实现对象为 `ZRating` 与对应 SSR、类型和真实 browser 回归。

## 参考与语义选择

通过 Context7 阅读 Mantine v8 Rating 与 Ant Design 6 Rate：两者共同提供受控/默认值、count、分数精度、只读、hover通知与自定义符号。Mantine以 `fractions` 表示每项份数，Ant以 `allowHalf` 表示二分。ZRating只保留通用 `fractions`，精度固定为 `1 / fractions`，避免两套配置冲突。

WAI APG 同时提供 [五分Rating Radio Group](https://www.w3.org/WAI/ARIA/apg/patterns/radio/examples/radio-rating/) 与 [十分Rating Slider](https://www.w3.org/WAI/ARIA/apg/patterns/slider/examples/slider-rating/)。本组件面向常见少量星级与逐项 `itemLabel`，采用真实 `input[type=radio]`；每个fraction都是原生选项，选中radio直接拥有FormData和reset基线，没有隐藏值桥或自定义提交协议。

## 所有权和交互

`value/defaultValue` 由 `ControllableState<number>` 管理，0表示未选择。`count` 与 `fractions` 必须是正安全整数；值必须在0到count内并落在fraction步长，否则拒绝渲染。`clearable` 再次激活当前radio时写0。hover只更新 `data-preview` 和视觉裁剪，离开时报告0，永不写选中值。

ZField提供radiogroup整体label、说明、name、required、invalid、disabled、readonly与size；`itemLabel` 独立命名每个原生radio。Field label通过compound focus owner聚焦当前选中项。左右方向键遵循视觉RTL，上下键按数值方向，Home/End选择边界。readonly仍可聚焦并保留FormData，disabled使用原生radio并继承Field；祖先原生fieldset的disabled由radio的 `:disabled` 判定，因此保留第一legend例外。

视觉使用Theme五档control尺寸、semantic/primary颜色、focus token和disabled opacity。单个评分项按24/28/32/40/48默认尺度提供真实命中区，避免把12px装饰图标尺寸误当作可操作控件。根可换行且限制最大宽度，count较大或窄容器不会制造页面级水平滚动。`item` snippet分别获得冻结的empty/filled项上下文，组件继续拥有radio命中区、ARIA和状态。预览即时反馈，没有独立动画计时器。

## 回归边界

SSR读取 `.body` 验证radiogroup、fraction radio数量、checked值、名称、只读/禁用和无form bridge，并覆盖非法count、fractions、值域、步长和标签。Browser合同使用真实userEvent覆盖hover、click清除、FormData、reset、LTR/RTL键盘、Field状态、原生fieldset第一legend例外、五档几何与自定义snippet。类型资产锁定数字值、tone闭集、itemLabel返回值及只读snippet context。
