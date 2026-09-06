# E10C：嵌套数组身份与集合控件模型接入

本批移除 E10B 的独立数组作用域限制。ZFormList 仍使用同一公开 children/operations API；每层 keyed each 使用本层 row.id，内层 name 从父 row.path 追加。数组行自身也是数组时，内层可以直接使用父 row.path。动态地址属于内部定位协议，不要求调用方建立第二套模型。

## 嵌套身份与复用

- FormArrayController 通过内部 location 分别读取 current path、baseline path 和 active。ZFormList 捕获父 row.id 与相对路径，父行移动只更新地址，不重建内层 controller 或行 ID。
- FormList context 传递已有父数组的只读定位能力；Form、Registry、错误层、ZStack、Field 和原生控件继续复用。不是在每一层复制 FormModel。
- Form 内只允许每个当前数组地址有一个列表 owner；嵌套列表必须在对应父列表中渲染。已删除父行下的旧 child controller inactive，返回空 rows，拒绝后续 mutation，不会读写移位后占据旧索引的另一行。
- 外层 registry transaction 已迁移全部后代。内层先把自身旧地址平移到新父地址，再仅迁移自己的行 ID 变化，避免错误和字段状态被重复换址。
- 默认 initialize 成功后推进 identity reset，即使 baseline 深等；keepDirtyValues 不清脏数组身份。仅兄弟 baseline 变化时，深等数组保留自己的 baseline IDs。
- Array 比较当前地址的 reset version 与上次观察的全模型 reset revision。父行迁到一个曾被其他行 reset 的旧索引时，不会消费别人的历史 reset 记录。

父/子 dirty 与 resetField 均通过稳定 baseline 地址读取；新增父行没有 baseline 时，其内层使用空 baseline。新子字段 reset 可删除无基线字段而保留行，明确的数组 remove 继续负责删除行。

## NumberField、Segmented、TagsInput、Select、MultiSelect

五种控件均接入已有 FormControlState。NumberField/TagsInput 的草稿和编辑输入继续由原有局部状态拥有，复合根 claim 唯一业务值作用域；locale、IME、token identity、SelectionModel、Overlay、FormValueBridge、主题和尺寸都沿用原实现。

Select/MultiSelect 通过现有 Trigger button 注册真实值元素，不新增 hidden wrapper 或全局 DOM 查询。初次集成的 revision 自增读写造成 effect_update_depth_exceeded，真实浏览器发现后改为普通单调计数只写响应式 revision；注册与清理不再订阅自己的输出。WebStorm 零错误不能代替这项运行时检查。

受控 owner 拒绝时，数字 draft、tags、typed selection、标签缓存和隐藏 FormData 回到原值；不会报告接受成功或假装关闭 Select。外部/controller/reset 不伪造用户 onValueChange。

## 实际验证

本地仅使用 WebStorm 受影响文件诊断、必要浏览器、格式和源码制品检查，没有运行本地完整类型、Vitest、Playwright suite、构建或 bundle gate。

真实 Docs 浏览器已观察到：

- 发布团队从索引 0 移到 1，Alice input 仍是同一个节点，焦点和 `[1,3]` 选区保留；全部四个嵌套字段 dirty=false，FormData 地址随父行改变。
- 外层移动后再移动内层，Edited Alice 位于新父/子地址；resetField 恢复 Alice，不会读到 Bob 或 Ava 的基线。
- 服务端错误从 `teams[0].members[0].name` 只迁移到 `teams[1].members[0].name` 一次，唯一 invalid input 仍是 Alice。
- 新增无 baseline 团队并添加成员后，子字段 reset 变为空、dirty=false；删除该团队会移除其全部原生提交值，焦点进入相邻团队。
- 五控件 controller 批量更新得到 replicas=5、tier=3、labels=[preview,canary]、region=2、features=[backup,7]；真实 submit 的重复 FormData 完整保留，model 中 numeric key 仍为 number。连续两次 reset 回到初始值。
- 当前 Form 页面 390px 没有页面横向溢出，刷新后没有新的 console error 或 Vite overlay。

新增嵌套列表、数值/单选、集合适配的 browser/SSR/types 和纯 runtime 资产。晚到 schema 用开始屏障和真实 validation Promise 验证，controlled reject 同时检查值、DOM、错误、焦点与选区；这些资产留给远程运行，不能标为本地 suite 已通过。

## 远程交付与后续

源码制品仍为 106 个文档家族、176 个公开组件，API 源审计 2,269 个属性、actionableIssues=0。FormList 继续 experimental/unreleased，未新增 stable 标签。

提交前对上一 `21bb0766fcac05ecf1143a5d24b129a9b2c230da` 只读查到 workflow runs=0。独立核查确认远程 master 确实指向该 SHA，CI workflow 为 active，push/master 与 workflow_dispatch 都已配置；未找到 workflow disabled、分支过滤或未推送原因。后续交付使用 expected-sha 约束的手动 dispatch 补充远程交接，不轮询等待。

整个目标仍包含其余输入/日期控件适配、表单结构变更预检、列表动画与 UI 主题一致性、企业数据/媒体/编辑器等完整能力矩阵。后续不能用 helper 资产、既有 stable 标签或本页点查替代最终候选的全组件族验收。
