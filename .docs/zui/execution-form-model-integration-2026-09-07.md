# E10A：Form 模型、控件与错误状态自动接入

本批落实 [E10 集成合同](./execution-form-integration-next-2026-09-07.md) 的第一阶段。`ZFormList`、条件卸载 preserve 和其余复杂值控件属于后续 E10B；本记录不把独立 FormArray helper 或回归资产当作这些能力已交付。

## 复用与接口

- `ZForm model={model}` 注入已有 FormModel；未传 model 时继续使用原生控件值。删除另造 values/defaultValues/valueMode owner 的方案，不在 Form 再复制仓库。
- `ZFormField` 提供内部值作用域，视觉和 ARIA 继续委托 ZField。Input、Textarea、Checkbox、NativeSelect、CheckboxGroup 共用 FormControlState；PasswordInput 由内部 ZInput 自动接入。CheckboxGroup claim 唯一 owner，Item/SelectAll 不再各自写模型。
- 模型字段不能同时给控件受控 value/checked；值域错误和没有唯一受支持 owner 会明确报错。缺失值按文本、布尔或数组各自规范化，拒绝写入后同步真实 DOM。
- `initialize(values, { keepDirtyValues })` 使用旧值、旧基线、新值合并。干净字段接收新值，脏字段保留；数组整体保留，避免按位置混合业务行。受控 owner 拒绝时不更新基线或通知。接受的模型写入可驱动普通同步 owner 的已挂载 Svelte 消费者；绕过模型直接修改普通 JS 对象仍不可自动观察。
- controller 提供 setValues/setFieldValue、initialize/resetField、getState/subscribeState 和分路径 clearErrors。resetField 成功后清该路径的 touched/errors/feedback；拒绝恢复的 owner 保留字段状态。
- 模型是 schema 输入，FormData 仍来自真实 successful controls。模型可以保留 disabled 和 readonly 的业务值；原生提交排除 disabled、保留 readonly。validate/submit 在读取 FormData 前等待 Svelte flush。

## 同组控制与生命周期

共享 adapter 区分用户变更、外部同步、controller 和原生 reset。原生 reset 即使遇到同值基线或受控 owner 拒绝，也在 flush 后把 DOM 恢复为实际 owner 值。Compound group 同步 Item 和 SelectAll 的 checked/mixed，不制造第二份选择状态。

表单 disabled/readonly 向 Field 单向加强，子级 false 不能取消上层限制；disabled Form 不进入语义提交。原生事件、五档尺寸、主题、focus/invalid chrome 继续由原控件承担，没有新增表单私有动画或样式体系。

schema/server/manual 三层复用 FormErrorLayers，局部 schema 结果不会覆盖服务端或手工错误。registry batch 使 Form、Field 和 controller 订阅得到最终一致快照。父路径清理和验证覆盖后代；带点号的标量字符串仍保留其独立 typed path 身份。较新的父/子验证使旧重叠 ticket 失效。

模型、基线或 schema 替换使旧验证失效；reset/unmount 使旧提交不再写状态。`onValidSubmit` 可返回 Promise，业务处理期间 submitting/aria-busy 为真；重复提交不重复进入处理器，拒绝交给 onSubmitError。首次 DOM flush 和首错聚焦前也校验 generation，避免同步 submit→reset 或卸载后的晚到动作。

HMR context key 的调用处改成显式 `import.meta.hot`，使 Vite 实际注入 hot context；仅把 `import.meta` 传给 helper 不会触发该转换。生产仍使用模块私有 Symbol。已确认转换产物含 hot 注入且重载后没有 context 错误；本批不声称完整业务状态 HMR 保留已验收。

## 实际检查与边界

制品生成记录 106 个文档家族、175 个公开组件，API 源审计 2,256 个属性、actionableIssues=0。Svelte 语法树替代了依赖 `<script lang=` 连续文字的实现探测，修正换行 script 的误报；141 个既有 stable 声明的静态政策无违规，不代表当前 SHA 的远程稳定验收已通过。

- WebStorm 受影响文件局部错误诊断；直接 Prettier、源码制品生成与 API 源审计。没有在本地运行完整类型、Vitest、Playwright suite、构建或 bundle gate。
- Docs 真实浏览器确认模型批量写入同步文本/原生选择，readonly bio 参与提交、disabled topics 从 FormData 排除但模型仍保留；连续两次 reset 回到 Alice/stable/weekly/quality 且 dirty=false。
- Controller 实际确认 keepDirtyValues 保留用户改动，resetField 恢复新基线 2.1.0；server 与 manual 错误在 schema 重验后同时保留，整体 valid=false。
- 同一帧连续两次 requestSubmit 只新增一次业务处理计数，等待期间 submitting/aria-busy 为真。Schema 把 age 转成 number，原生 FormData 的 age 仍为 string。
- 同步 requestSubmit 后 reset，浏览器实际处理计数仍为 0、submitted/submitting 均未置位；外部监听器取消 reset 时，原提交仍进入一次处理器。pending reset 按事件分派后的最终 defaultPrevented 判断，不抢先取消被用户保留的提交。
- 390px 文档页的 document scrollWidth 不超过 viewport，未发现 Vite overlay 或当前控制台 error。
- 新增自动适配、错误层批量订阅、拒绝 reset、异步提交与 owner 替换、SSR 和类型合同资产。它们留给远程 CI 执行；本地浏览器点查不能替代完整合同。

旧 CI 的具体失败和修复边界记录于 [E10 反馈](./e10-previous-ci-findings-2026-09-07.md)。本批不新增 stable 标签。最终关闭仍要求 [组件族一致性验收](./component-family-consistency-2026-09-06.md) 的当前候选证据，尤其其余控件、动态数组、主题/动画与跨组件组合。
