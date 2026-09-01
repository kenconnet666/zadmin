# ZBadge生产语义与迁移边界

状态：已实现，等待统一生成事实与远程浏览器矩阵（2026-09-02）

## 1. 单一职责

`ZBadge`只表达附着于对象的通知数量或紧凑圆点。原来的“任意短文本pill”语义迁移到`ZTag`：

- Badge：计数、max摘要、showZero、dot、anchor角落、overlap与offset；
- Tag：状态文字、分类、筛选条件、可移除实体；
- Status：当前没有足够独立需求，不为迁移制造一个只有一处使用的新组件。

这次是`0.x`阶段的有意API收口。继续兼容`<ZBadge>在线</ZBadge>`会让组件名称、文档与可访问数量合同永久冲突，因此没有保留含混的文本模式。

## 2. 成熟实现对标与取舍

参考：

- [Ant Design Badge](https://ant.design/components/badge/)：`count`、`overflowCount`、`showZero`、`dot`、offset与standalone；
- [MUI Badge](https://mui.com/material-ui/react-badge/)：`max`、`showZero`、`variant=dot`、`anchorOrigin`与circular/rectangular overlap；
- [MUI Badge API](https://mui.com/material-ui/api/badge/)：root/indicator slot边界和invisible状态；
- Naive UI的Badge包结构与主题化实践，但不复制Vue渲染/transition内部实现。

采纳：

- 数值`count`与`max=99`；
- `showZero=false`；
- `dot`和显式`invisible`；
- 有children时锚定，无children时standalone；
- circular/rectangular overlap；
- 四个逻辑角落与像素offset；
- Theme tone、Provider direction/motion和owner-realm WAAPI。

有意不采纳：

- 任意ReactNode/Snippet count：视觉摘要和真实数量容易分叉；
- status text模式：由`ZTag`负责；
- ribbon：是独立布局组件，不应塞入计数指示器；
- 任意颜色字符串：继续使用Theme语义tone；
- slot/classNames/styles对象DSL：ZUI已有根原生属性、ICSS变量与`data-slot`；
- 内建live region：计数变化的重要性与节流属于业务通知策略。

## 3. 值与可访问性合同

- `count`必须是非负安全整数；`null`和`undefined`均表示没有计数。
- `max`必须是正安全整数，只改变视觉摘要。
- 视觉显示`99+`时，indicator内的`ZVisuallyHidden`仍保留格式化后的完整count；不在无语义generic span上滥用`aria-label`。
- dot没有count且没有label时按装饰处理并从可访问树隐藏。
- dot承载在线/更新等信息时必须提供非空label，且界面不能只依靠颜色。
- Badge不会自行创建`aria-live`。动态业务需要公告时，应由调用方提供独立、可节流的status区域。
- Button/Link如果自己提供`aria-label`，该名称会覆盖后代文本；业务必须把完整数量写进anchor名称。

## 4. 定位与RTL

公开placement使用：

- `top-start`
- `top-end`
- `bottom-start`
- `bottom-end`

CSS锚点使用`inset-inline-start/end`。translate的物理符号由Provider direction解析，因此RTL会真正交换start/end，而不是只改data属性。

`offset=[inline, block]`的正值表示沿当前角落向外移动。它是运行时布局数据，不写入Theme token。`overlap=circular`只降低基础重叠百分比，不猜测anchor DOM的真实几何形状。

## 5. 动画与资源所有权

- count变化在完整动画下使用短WAAPI scale/opacity反馈；
- reduced motion不创建动画；
- Action由真实indicator节点拥有，更新前取消旧Animation，destroy时取消；
- Window/matchMedia连接通过根节点owner realm和`ReducedMotionState`管理；
- 显隐不安装timer，也不创建全局registry。

## 6. 迁移范围

以下Docs消费者从Badge迁移到Tag：

- DataTable状态列；
- List健康状态；
- Timeline时间/阶段文字；
- Stack在线状态；
- MultiSelect typed-key类型标签。

Badge页面改为五类真实场景：anchor、standalone/max/showZero、具名dot、逻辑placement/circular overlap、动态完整/减少动画。

## 7. 明确后置

- Ribbon若出现至少三个真实消费者，单独设计布局与可访问语义。
- 自定义格式化只有在数值单位、国际化缩写等真实需求明确后再增加；当前固定数字与`max+`合同更可预测。
- Badge不会变成按钮、链接或Tooltip。交互和补充说明由外层ZUI组件拥有。
