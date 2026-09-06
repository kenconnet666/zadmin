# Slider 与 RangeSlider 执行记录（2026-09-07）

## 范围

本轮把 `ZSlider` 扩成完整的单值组件，并新增固定二元值的 `ZRangeSlider`。实现遵循 I07 矩阵：marks、value label、change/commit、水平/垂直、reversed、RTL、五档尺寸，以及范围碰撞与最小间距。

## 参考与取舍

- [Mantine RangeSlider](https://mantine.dev/core/range-slider/) 提供了 `minRange`、重叠推动、marks、label、orientation 和交互结束回调的成熟边界。
- [React Aria Slider](https://react-aria.adobe.com/Slider/useSlider.html) 明确多个 thumb 共享一个 domain，并分别拥有键盘与可访问名称。
- ZUI 保留原生 `input[type=range]` 作为键盘、ARIA、FormData 和 reset owner。`ZRangeSlider` 的两个 input 始终使用相同的公开 `min/max/step`；相邻约束仅由共享数学 helper 计算，避免动态改写 input domain 后导致位置映射错误。

## 最终合同

`ZSlider` 保留真实 input 的 `ref/class/style` 和原生属性，新增 `orientation`、`reversed`、`marks`、`valueLabel`、`formatValue`、`label`、`mark`、`tone` 与 `onValueCommit`。浏览器仍处理真实 range pointer；组件只接管方向键，使水平 RTL、垂直和 reversed 使用同一套确定映射。

`ZRangeSlider` 使用严格的 `readonly [number, number]`，输出保持下界在前。每个 thumb 都是真实 range input，`thumbLabels` 必填；同名 input 会形成两个有序 FormData 条目。组件支持：

- `collision="clamp"`：活动 thumb 在最小间距处停止；
- `collision="push"`：继续移动时推动相邻 thumb；
- `collision="swap"`：跨过相邻 thumb 与间距后转移活动身份和焦点；
- `minRange`：向上对齐到可表示的 step，防止返回小于调用方要求的间距；
- `onValueChange`：每次用户值变化；`onValueCommit`：pointerup、原生 change 或键盘交互结束；
- `ref` 指向范围根，`thumbRefs` 按下界、上界顺序暴露两个真实 input。

组件每次自定义 pointer/keyboard 入口都读取真实 input 的 `:disabled`，因此祖先原生 `fieldset[disabled]` 会直接阻止交互。`readonly` 保持 input 可聚焦且保留 FormData，只阻止用户修改。reset 由首个 input 的真实 form 关联统一恢复 tuple，避免两个监听器重复重置。

尺寸遵循实例 → Field → 自身 component defaults → Provider density。RangeSlider 再回退到 Slider defaults；tone 遵循实例 → 自身 defaults → Slider defaults → `primary`。两者共享一个 slot recipe、五档 thumb/track 几何、semantic tone、marks 和 value-label 表现。

## 已编写验证资产

- SSR：原生 input 数量、共同 domain/name、thumb accessible name、snippet 输出、垂直状态。
- 纯数学：规范化、三种 collision、minRange、RTL/reversed/vertical keyboard 和 pointer 映射。
- 类型：严格 tuple、必填 `thumbLabels`、封闭 collision/orientation、snippet 参数、bindable refs。
- 浏览器：FormData/reset、change/commit 计数、独立 thumb 焦点、原生 fieldset disabled、readonly、RTL/vertical/reversed、marks/value label 和五档视觉尺寸。

按本阶段约束，没有在本地运行 Vitest、Playwright、typecheck、Svelte check 或 build。仅对受影响文件执行直接 Prettier，并使用 WebStorm affected-file diagnostics；完整测试由后续 CI 执行。

## 交叉审查与真实集成

第二位代理审查后补齐原生orientation、实例dir、端点mark物理锚定、pointerup/cancel/lost capture清理、重叠tie活动thumb与swap焦点；共享track命中尺寸按24/28/32/40/48，装饰thumb使用indicator尺度且含边框，rail/fill使用Theme圆角保持等粗线条。native input 与装饰层分开，不把邻居约束改写成原生不同domain。

Chrome实际验证：双值[20,80]经ArrowRight变[25,80]；预算两个同名字段提交[30,75]，reset回[25,75]；RTL右箭头将30减为29；vertical原生ARIA正确；390px文档无横向溢出，单Slider五档真实命中高度24/28/32/40/48。单独生成的回归测试仍交CI，以上不是全多引擎验收。
