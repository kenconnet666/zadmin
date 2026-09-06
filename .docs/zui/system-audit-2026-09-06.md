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
- [输入 27 族](./input-api-audit-2026-09-06.md)和[导航/浮层 16 族](./navigation-overlay-audit-2026-09-06.md)的第一批确定缺陷已经实施，加上[通用/布局/展示/反馈 36 族](./foundation-display-feedback-audit-2026-09-06.md)，79 族都有源码复核条目。各表后续尺寸、颜色和 API 项仍按待实施记录。
- 浏览器补证：Dialog 首次打开捕获到 opacity 从 0 经过 0.236、0.432 等中间值递增，证明实际入场过渡；Mention 建议已打开时切换 Field readonly，textarea 变为只读且 listbox 从 1 个变为 0，原生 reset 回调计数为 1。对应页面无 console error/warn。

## 基础设施命名迁移

| 原 API             | 当前 API         | 原因                                                                                                                                 |
| ------------------ | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `s.display.hidden` | `s.display.none` | `hidden` 不是 display 关键字；真正需要保留布局的隐藏使用 `s.visibility.hidden`，两者不再共享容易混淆的名称。仓库内没有旧别名消费者。 |
