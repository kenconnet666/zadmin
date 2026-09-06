# E10B：动态表单列表与选择、数值控件适配

本批承接 E10A 已推送提交 `6559bc9`。新增实验性 `ZFormList`，并把 Switch、RadioGroup、Slider、RangeSlider、Rating 接入既有 FormControlState。所有控件继续复用原有 selection、数值约束、原生 input、主题和 reset；本批不新增第二套视觉、动画或值仓库。

## 动态列表

ZFormList 根复用 ZStack，默认 column/medium gap，并继承适用的布局、主题、class/style/ref。`children(rows, operations)` 必须以 row.id 作为 keyed each 的 key，字段名从 row.path 追加；append/insert/remove/move/replace 返回模型是否接受。Form disabled/readonly 使用户列表操作返回 false。

FormArray 同时保存 current 与 baseline row ids；字段 dirty/reset 按稳定行对应的原始字段处理，整体 model.dirty 继续比较业务值。重复值行 move 仍交换身份，但业务值深度相同则整体 dirty=false。成功的显式 reset 使用内部版本信号恢复 baseline ids；受控拒绝不会推进版本。新行子字段 reset 删除该字段并保留行，不能用字段删除制造数组空洞。

FormRegistry 一次性重写字段地址、自动 HTML name、依赖、mounted/retained 状态和反馈，保留 registration token 供后续真实 cleanup 使用。schema/server/manual 错误层共用路径迁移 helper；删除行无条件清除其后代错误与保留状态。结构变化使旧验证 epoch/ticket 失效，不能把旧 index 的异步错误交给新行。

条件卸载采用显式 preserve：model 默认 true，native 默认 false，Field 可覆盖。native FormData 始终只包含当前 successful controls；保留模型值不等于伪造已卸载原生条目。显式列表 remove 不受 preserve 影响。保留状态的地址也参与行迁移，避免只搬运 mounted 字段。

## 焦点与实际浏览器检查

真实 Chrome 揭示 keyed DOM move 虽保留 input 节点，仍可能丢失焦点与文字选区。本批在 flush 后仅当焦点没有被用户或应用转移到其他真实目标时恢复旧节点与选区，并在结构移动期间抑制由内部 DOM 搬迁导致的字段 blur。删除行时复用 registry 的 owner-aware scope focus，优先相邻行，最后退回列表根。

已在 Docs 实际确认：

- Alice 下移后变为 Bob/Alice，FormData 名称顺序同步；单字段 dirty=false，整体 dirty=true。
- 移动前后的 Alice input 是同一节点，焦点和 `[1, 3]` 选区保持。
- 移动后修改 Alice 再 resetField，恢复 Alice 的原始值，不会读取当前位置 Bob 的基线。
- 聚焦删除按钮删除首行后进入 Bob；删除最后一行后进入 tabindex=-1 的列表根，FormData 为空。reset 恢复 Alice/Bob 和 row-1/row-2，字段 dirty=false。
- 新控件组合批量写入 preview/60/[35,65]/3 后真实 FormData 保留 RangeSlider 的两个同名值，关闭的 Switch 不提交；连续两次 reset 恢复 enabled/stable/35/[20,80]/4，model dirty=false。
- 390px 页面 scrollWidth 不超过 viewport，没有当前 Vite overlay 或控制台 error。

## 回归资产与下一步

源码制品统计为 106 个文档家族、176 个公开组件；API 源审计覆盖 2,269 个属性，actionableIssues=0。141 个既有 stable 声明的静态政策没有违规。新增 FormList 仍为 experimental/unreleased，静态计数不会替代当前提交的 CI 结果。

新增数值/布尔/选择适配与 FormList 的真实 fixture、browser/SSR/types 合同；runtime 资产覆盖 duplicate-value move、baseline identity、owner 拒绝、preserved 状态迁移、prototype-safe errors 和 remap 后 cleanup。异步测试先等待 schema 真正进入，再删除并接收旧结果；焦点测试区分程序化列表操作和真实按钮点击，不混淆原生焦点前置条件。

本地仅运行 WebStorm 局部诊断、必要浏览器交互、Prettier、diff/source/artifact 检查。完整类型、测试、多浏览器、视觉与构建由远程 CI 执行，源码资产不是运行通过证据。

当前列表仅支持彼此独立的数组作用域，嵌套 FormList 被明确拒绝。内层数组的路径和 baseline 还需要跟随外层稳定行身份，下一阶段继续实现；不能让固定外层 index 悄悄指向另一业务行。行退出和重排动画也继续列入后续设计，当前同步移除不保留可提交或可聚焦的退出控件。整个目标仍包括其余输入适配、嵌套数组、完整成熟组件能力和最终组件族 UI/主题/动画/控制一致性验收。

提交前只读检查 E10A 的 [CI 34058991003](https://github.com/kenconnet666/zadmin/actions/runs/34058991003)，当时仍为 in_progress；没有等待、轮询、重跑或把未完成状态当作通过。
