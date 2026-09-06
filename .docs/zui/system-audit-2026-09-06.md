# ZUI 基础设施、API 与视觉系统审计

基线：`3b4536f2b70bf2e8c03788d1bacdf6133843a3fb`。用户授权逐个审计并直接修改基础设施和全部组件，允许调整 API、函数与语义命名。本轮覆盖 79 个组件族及其 141 个公开组件，不以已有 stable 标签替代逐项检查。

## 交付顺序

1. 修复动画生命周期、Field 状态传播、禁用视觉和原生控件字体的确定缺陷；同步有明确语义收益的命名调整。
2. 建立五档控件尺寸、完整语义颜色角色、多档文字和主题化动画合同，将真实消费者与 Provider 默认值一起迁移。
3. 按通用/布局/展示/反馈、输入、导航/浮层三个清单逐族落实 API 和视觉调整；更新真实示例、迁移说明及生成契约。
4. 在 WebStorm 检查受影响文件，在现有 Chrome 文档站逐页复核并检查主题、尺寸、状态与动画。多浏览器及完整构建由 CI 验证。

## 统一原则

- 控件尺寸采用现有命名风格 `xsmall / small / medium / large / xlarge`，避免同时引入 `xs`、`extraSmall` 等同义拼写。它控制控件几何，不改变标题的语义层级，不替代数据表密度或弹层宽度。
- 状态语义统一为 `neutral / info / success / warning / danger`。`primary` 是独立品牌主色；`muted`、`inherit` 是文本/组合呈现，不能伪装成成功、失败等业务状态。
- 颜色角色需要同时覆盖前景、实心表面上的文字、悬停和浅背景。信息状态不再隐式借用装饰用的 `accent`。
- 按钮外观采用描述渲染形式的命名，避免 `primary` 同时表示强调层级和品牌色。每个有意义的轴保持独立；不向无视觉根节点或不适合表达状态的组件机械添加五色 props。
- 文本字号与控件尺寸独立；标题层级保持真实 h1–h6。行高、字重、长内容和逻辑方向与字号一起复核。
- 动画统一消费主题 duration/easing，接受已声明的数字、`ms`、`s`；运行中切换 reduced motion 应立即取消，退出、卸载和 owner Window 生命周期都必须清理。
- 重命名同步实现、公开导出、类型、metadata、Docs、真实示例与测试。移除旧 API 时在迁移表明确列出，避免留下类型和实际行为不一致的兼容壳。

## 参考与取舍

[Chakra UI 的语义 token](https://chakra-ui.com/docs/theming/semantic-tokens)和[颜色角色](https://chakra-ui.com/docs/theming/customization/colors)说明前景、实心、对比文字与浅背景应有明确职责。本项目保留现有扁平、强类型 Theme，不引入另一套 CSS-in-JS 系统或复制其 React API。

[Radix Themes 排版](https://www.radix-ui.com/themes/docs/theme/typography)区分文字比例与[按钮尺寸](https://www.radix-ui.com/themes/docs/components/button)，本项目采用这种职责划分，保留 Svelte 原生绑定、事件与片段组合。

## 当前证据与边界

- 修改前通过 WebStorm 的 `apps/docs/package.json` 第 34 行运行 `dev`，服务位于 `http://localhost:5174/`。
- 修改前在真实 Chrome 检查了全部 89 个目录页面：79 个组件页、8 篇指南、Theme Lab、首页。404 个 Demo 容器、Props 表及页内目录目标存在；没有全页横向溢出或累计 console error/warn。
- 修改前抽查搜索、源码展开、按钮计数、Select/FormData、Dialog 焦点恢复、DataTable 排序/选择/虚拟滚动和 390px 导航。这不等于所有 Demo 的所有交互均已验收。
- 基线主 CI `33956955357` 成功；基线 Release PR 工作流 `33957682582` 失败于其派发的发布分支构建。这两个 revision 的结果分别记录，不能相互替代，也不代表本轮修改已通过 CI。

本文件随实施更新；各族的具体结论和迁移表由本轮子审计文档记录。尚未完成的条目不会标记为通过。

## 已完成阶段

- `dd5f18c`：Badge 的 duration/easing/reduced-motion；Skeleton 与 Timeline 的 CSS 长度值。已推送，新增回归交给 CI。
- ICSS 补齐 animation/transition delay 的主题访问器，以及 animation direction、fill mode、iteration count、play state 与 text wrap 的标准关键字。类型负例与序列化回归已编写。
- 主题新增 info/neutral 的完整前景、悬停、浅背景和实心文字角色，补齐 success/warning 的实心文字与悬停角色。浏览器对默认主题和六个预设做了 70 组状态前景/浅背景、实心文字/状态背景的对比度计算，最低约 5.28:1；此结果只覆盖该配色组合，不替代组件无障碍检查。
- `bf1e01c`：[输入 27 族](./input-api-audit-2026-09-06.md)和[导航/浮层 16 族](./navigation-overlay-audit-2026-09-06.md)的第一批确定缺陷已经实施，加上[通用/布局/展示/反馈 36 族](./foundation-display-feedback-audit-2026-09-06.md)，79 族都有源码复核条目。后续尺寸、颜色和 API 迁移现已按三组台账落实；具有不同职责的 density、面板宽度、虚拟行高等保留理由也逐项登记。
- 浏览器补证：Dialog 首次打开捕获到 opacity 从 0 经过 0.236、0.432 等中间值递增，证明实际入场过渡；Mention 建议已打开时切换 Field readonly，textarea 变为只读且 listbox 从 1 个变为 0，原生 reset 回调计数为 1。对应页面无 console error/warn。

## 五档体系与文档体验收口

| 轴       | 当前合同                                                                                    |
| -------- | ------------------------------------------------------------------------------------------- |
| 控件     | xsmall / small / medium / large / xlarge，高度 24 / 28 / 32 / 40 / 48px                     |
| 控件文字 | 11 / 12 / 14 / 16 / 16px，独立于大标题字号                                                  |
| 指示器   | Icon / Spinner 为 12 / 14 / 16 / 20 / 24px；Switch、Badge、Avatar 各有用途尺寸              |
| 排版     | 11 / 12 / 14 / 16 / 20 / 24 / 32 / 40px；Heading 的 level 与 size、wrap 分开                |
| 颜色     | neutral / info / success / warning / danger，品牌 primary 与文字 muted/inherit 保留独立职责 |
| 外观     | Button solid / outline / ghost；颜色、pressed、disabled、loading 与外观正交                 |

- 本轮还修正复合输入外框多出的边框高度、Switch 的轨道/拇指/RTL比例、Tree CSS变量变化后的虚拟行高测量；Statistic 新增 valueSize/trendTone，趋势默认中性。
- ICSS 支持 150 个已建模属性、18 组 / 180 个主题 token；Recipe defaults/compound 条件的类型引用真实 variant，运行时校验继续保护动态输入。
- 141 个公开组件的 API 静态合同核对得到 1776 个生成属性，actionableIssues、missingConsumption、missingRestForwarding、defaultMismatches 均为 0。
- 六套官方主题在真实浏览器中的五档按钮高度均为 24/28/32/40/48px；30 组实心语义按钮前景/背景的最低对比度约 5.75:1。它只证明该组配色，不替代完整无障碍审计。
- API 桌面表格固定列宽并允许完整类型换行，说明列占 34%；窄屏使用真实 dl/dt/dd 纵向阅读。源码、指南与长英文标识符换行，不用裁切隐藏溢出。
- 390px 巡检中发现的 PIN 尺寸例与 Tabs 容器/简介溢出均已修正。仅保留两个明确用于演示原生表格横向滚动的 ZTable 示例。
- Demo 顶部复制操作位于展开按钮之前；折叠时可复制真实源码，writeText 兑现后才显示 Check/已复制；拒绝、源码更新、卸载均有相应处理。真实浏览器复制成功，反馈前后宽度均为 110px，且不改变折叠状态。Demo 源码区底部复制入口已关闭。

## 稳定性证据

最新生成库存为 141 / 141 stableCompliant、141 / 141 有关联视觉合同、stableViolations=0。七项布局/数据组件的既有有效视觉断言已准确关联到各自 it 块，未添加空标记或放宽生成器。这个库存表示合同和回归存在，不表示当前修订已经执行通过全部 CI。

前一提交 bf1e01c 的 CI 34006402280 报告 Tooltip 旧参数、固定颜色数量、入场中间帧几何采样、reset 完成时序及 Tree fixture 名称问题，均已有对应修复。另一次 Transfer 浏览器连接中断没有组件根因 stack，保留为执行不完整的边界。当前修订的跨浏览器、完整构建、覆盖率和桌面验收交给其自身 CI，不借用旧提交的绿色结果。

## 07778ba 候选的 CI 收口

CI 34011087935 的包体/仓库外消费检查通过，其余已出现的失败按源码根因逐项处理，保持行为与几何断言精度：

- Recipe 泛型返回的 variant key 约束为字符串，保持严格 defaults/compound 推导，同时满足运行时缓存的公共形状；专门测试非法 runtime 输入时使用明确的类型越界值。
- Card/Stack 的通用间距只暴露有实现的尺度，Switch 专用的 switchInset 不再通过 keyof space 混进公共枚举。
- ZCode 的高亮 token 和换行保留精确文本，ZTag 移除可选按钮周围的多余空白；相关断言保持原始全文相等。
- Mention 的 Popover triggerId 采用显式 id、InputGroup、Field 的顺序，恢复原生 label-for；状态也读取实际 InputGroup。浏览器验证五档 label 全部正确关联，未命名 textarea 为 0。
- 修复测试中 ZCode 的错误入口、已经合法的旧尺寸/tone负例、旧字级/外框/边框断言、虚拟 Tree 选错测量层、重复 Pagination landmark 名称和原生小号 select 高度。
- 复制按钮反馈宽度改用真实文字的 CSS grid 占位，兼容字体的实际字符宽度；测试逐视口使用新文档，避免 hash 导航保留上一次展开状态。
- Docs 原始入口为 357858 bytes，超过原 326000 bytes 门槛。Theme Lab 已改为路由按需加载；按用户最新优先级，入口原始/gzip大小改为记录与告警，不再阻断交付，模块图与文档按需加载检查保持。
- CI 开始保存组件失败截图。单次 Workspace WebKit 的 modal Popover opacity=0 尚无完整根因证据，保留 connected/state/opacity 诊断和原等待预算，未猜测修改动画或声称该项已解决。

## 基础设施命名迁移

| 原 API             | 当前 API         | 原因                                                                                                                                 |
| ------------------ | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `s.display.hidden` | `s.display.none` | `hidden` 不是 display 关键字；真正需要保留布局的隐藏使用 `s.visibility.hidden`，两者不再共享容易混淆的名称。仓库内没有旧别名消费者。 |
