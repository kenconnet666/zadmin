# Avatar与Card展示面生产架构

## 目标

Avatar与Card分别拥有“身份图像”和“内容surface”两类职责。本轮不把它们扩张成图片上传、整卡路由、任意slot DSL或业务数据模型；生产化重点是原生语义、稳定生命周期、可组合区域和明确的失败边界。

## 成熟项目取舍

- [MUI Avatar](https://mui.com/material-ui/react-avatar/)与[Ant Design Avatar](https://ant.design/components/avatar/)都证明图片、文字和图标fallback是基础能力。ZUI采用typed原生img属性与确定fallback，不采用Ant `onError(): boolean`的双重控制，也不新增AvatarGroup、响应式尺寸对象、preview、crop或upload。
- [MUI Card](https://mui.com/material-ui/react-card/)把surface、media、content、actions和ActionArea拆分；ZUI采用稳定内容区域，但本轮不新增ActionArea。整卡主操作继续由真实ZLink表达，避免Card自身变成嵌套button。
- [Ant Design Card](https://ant.design/components/card/)验证outlined、loading、cover和actions的真实需求。ZUI采用outlined/loading/media/actions，不复制tabs、Meta、Grid、hoverable、inner type或无限`styles`映射。

## Avatar合同

1. 根始终是稳定`span`；它只拥有尺寸、形状、fallback和根原生属性。
2. `src`、`srcset`、`sizes`、`loading`、`decoding`、`crossorigin`、`referrerpolicy`与`draggable`只投射到真实`img`。
3. 图片尝试由资源与请求策略组成的identity隔离。旧img的迟到load/error不能修改新尝试，也不能调用公开callback。
4. 当前img失败后保留元素引用但以`hidden`退出视觉和可访问树；fallback在同一固定尺寸根内接管。
5. 非空`alt`在图片与fallback间保持同名；`alt=""`时两条路径都保持装饰性，不创建空名称`role=img`。
6. `imageRef`只引用当前真实img；没有图片源时为`null`。

## Card合同

1. 默认根是中性`div`。`article`只用于可独立分发的单一主题，`section`只用于有真实标题关系的页面章节。
2. DOM顺序固定为`media → header → body → footer → actions`，调用方可以省略任一区域，但不能重排可访问阅读顺序。
3. `elevated`与`outlined`只改变Theme surface视觉，不改变根语义、事件或布局所有权。
4. `loading`只以ZSkeleton替换body，同时把根设为`aria-busy=true`；media、header、footer和actions继续挂载，避免上下文和操作突然消失。
5. Card不公开根`href`或隐式`onclick`。主导航使用真实ZLink，补充按钮放在actions，禁止制造整卡与内部控件重叠的事件区域。
6. Card不会替调用方推断heading level、`aria-labelledby`或文章语义；文档站使用ZHeading建立真实大纲。

## 验收矩阵

- SSR：默认div、显式article/section、原生属性、区域顺序、busy覆盖和装饰性Avatar必须确定。
- 浏览器：Avatar响应式属性落点、旧资源竞态、load/error恢复、imageRef；Card根语义、区域顺序、action、loading替换与非正文稳定挂载。
- 文档：Avatar六个示例、Card五个示例，分别覆盖fallback、native img、竞态、装饰语义、surface、media/actions、loading与语义根。
- 静态：公开入口、metadata、generated API和Changeset必须同步；Docs不得重新手画SVG或用原生交互控件绕开ZUI。
