# E11：TimePicker、日期模型与表单数组预检

本批新增实验性 ZTimePicker，接入五个既有日期控件，并把数组结构变更改为先预检再提交。既有 Model/Field/Array、InputGroup、Popover、Collection 和 Theme 继续承担各自职责；未新增第二份表单仓库或浮层引擎。

## TimePicker 与日期组

- TimePicker 组合 TimeField、InputGroup、Popover、Button、ScrollArea、ActiveDescendant 与 MountedElements。小时、分钟、秒、AM/PM 共用一个内部列组件，每列最多 60 个 DOM option。
- value/defaultValue 与 open/defaultOpen 独立；面板点击/Space 只编辑草稿，Enter/确认提交，Escape 放弃。字段编辑和清空保持原语义。只由根提交一个 ISO Time 字段。
- 小时选择会寻找下游合法组合，空值精确范围 10:30–10:45 可找到合法参考；全部不可用显示明确空态。AM/PM 优先保持 12 小时显示小时。已有 Time 的不可见单位在字段和面板编辑中保留。
- Calendar、DateField、TimeField、DatePicker、DateRangePicker 接入共享 FormControlState。Model 缺失字段归一化为空，复合根唯一拥有业务值，内部字段/日历使用显式 none scope；public value 的 defaultValue 规则保持独立。
- FormModel 对库支持的 CalendarDate/CalendarDateTime/Time/ZonedDateTime 使用已知字段比较，并复制、冻结值以保护基线和私有类型标记。其他 class/native Date/File 仍保持 identity；不调用任意对象的 compare/toString。
- 六个日期/时间组件新增仅含五档 size 的 component defaults。DateField/TimeField 进一步复用 InputGroup 的 name、label、状态和 size，默认值优先级统一为实例、Group、Field、专属 defaults、输入 defaults、density（Calendar 不使用 input fallback）。

真实浏览器还发现并修正了 CSS 长度被当成 number 相乘、未建模 ICSS accessor、以及嵌套禁用透明度的问题。面板尺寸现在用 CSS calc 保留 rem/calc/token；xlarge/12h/seconds 在 390px 可显示四列且不横向溢出。禁用 TimePicker 的 InputGroup opacity=0.5、内部 TimeField/input opacity=1，避免有效透明度叠成 0.25。

## 数组预检事务

FormArray 先生成完整候选，再通过 FormRegistry.prepareList 校验字段地址、自动/显式 HTML name、dependencies、preserved state 和错误迁移。失败或受控 owner 拒绝时，值、行 ID、状态、错误及焦点都不提交。

owner 接受后，在同步 model observers 之前依次提交 row identity、registry、错误层和 validation lifecycle。observer 抛错不会回滚已经接受的身份；每个 model 的同步 publication queue 保持嵌套 observer 写入的通知顺序。外部替换和 reset 的 effect 兜底继续存在，正常数组操作不再重复 remap。

## 本地观察与远程边界

- TimePicker Docs：小时 ArrowDown/Enter 后为 10:30:00、仅一次 onValueChange、面板关闭并恢复 trigger 焦点；窄屏没有页面横向溢出。
- 独立 Picker fixture：xlarge/12h/second 四列宽约 51.59px、高 288px；精确空范围可提交 10:30:00；全部不可用无伪列；拒绝字段或面板写入后 Time、segments 和 FormData 保持旧值。
- 日期 Model Docs：日期从 2026-09-07 改为 2027-09-07 后 dirty=true、用户次数=1；换成新实例的原始日期后 dirty=false、次数仍为 1。日期范围和 Time 只按各自名提交一次。
- FormValueBridge 对同值/拒绝 reset 重新投射业务隐藏 inputs。浏览器篡改 hidden value 为 drift 后，reset 恢复真实 Date/Time/Range entries；隐藏 input 的原生 defaultValue 行为不再绕过 canonical values。
- Slider 旧 CI“键盘后找不到告警阈值”已在真实浏览器复现：output 是 labelable 元素，焦点提示插入后抢走隐式 label。提示改为 aria-hidden 的普通 span，range input 通过 aria-valuetext 独占值语义。常显模式也不再重复渲染顶部值和气泡。修后 35→40 仍保持原 label/control 关联和名称。

本地只做 WebStorm 受影响文件诊断、必要浏览器点查、Prettier、diff/source/artifact 检查；没有运行本地完整类型、Vitest、Playwright suite、构建或 bundle gate。新 pure/SSR/types/browser 资产由远程执行，未把资产存在当作测试已通过。

## 前一候选 CI

只读检查 [34061733147](https://github.com/kenconnet666/zadmin/actions/runs/34061733147)，SHA 为 ba12b9ee15aac6efdb9af391b2eacf26ae9e1a7d；这是 E10C 的结果，不包含本批日期/TimePicker。Dispatch integrity、workspace builds、bundles/external、Drizzle 通过，Static、component/coverage、Docs 三引擎及 Windows 前端类型检查失败。

本批修复了已定位的 snapshot 泛型、Schema 类型提示、expect-error 位置、Range tuple guard、Vitest 实际声明模块、Field observer 自订阅、controller mount 前置、FormList `$state` 名称冲突、Select 初始 label fixture、NativeSelect 首帧 selected、hidden reset、Rating clear 原生迟到 change、BackTop fixture 重叠及具体挂载断言。Docs Form E2E 已迁移到实际邮箱/年龄/异步提交示例，并保留真实异步 schema 与离页验证合同。其它历史 Toolbar 生命周期等失败仍待下一候选隔离；不据此声称全部稳定门禁已通过。

## 继续推进

D02 已具备字段、列式面板、约束、确认/取消、模型与原生表单，presets/now 等剩余能力继续列入对标。DateTime、TimeRange、周期/多月/多选、剩余表单适配、行和日期动画及企业组件矩阵继续执行；新 TimePicker 保持 experimental/unreleased，最终仍需当前候选的组件族 UI/主题/动画/控制证据。
