# E2 / N3：ZSteps 执行合同

日期：2026-09-06。本批新增真正的有序流程导航，当前为 experimental，验证合同交后续 CI 执行。

## 最终接口

- `StepsItem<TKey extends SelectionKey>`：稳定 `key`、必填非空 `title`，可选 `description/icon/status/disabled/loading`；`status` 为 `pending | complete | error`，默认 pending，不通过数组位置推断业务完成。`href` 项为真实链接（支持 target/rel）；没有 href 且 `clickable=true` 为原生 button，其余为被动步骤。
  公共类型采用共享 base 与行为判别 union：链接分支 href 必填且 clickable 为 never；非链接分支 href/target/rel 为 never，clickable 可为 boolean。类型检查与运行时拒绝规则一致，metadata 的 href 以 requiredWhen 表达链接分支要求；该组件未发布，不保留先前过宽接口。
- `currentKey?: TKey | null`、`defaultCurrentKey?: TKey | null`；默认 null，不自动选择首项。current 仅由 key 决定，不是第二个 item.status。
- `onStepRequest(event)`：包含目标 item/key、previousKey 和 originalEvent；同步 `preventDefault()` 取消本地切换与链接默认导航。异步校验先取消，然后由消费者在适当时机写 currentKey，不隐式等待 Promise 或发网络请求。
- `onCurrentKeyChange(key)` 只通知被接受的用户切换。`reset()` 恢复组件初始化时 currentKey 或 defaultCurrentKey baseline，不发用户事件；组件不是表单字段，不订阅原生 form.reset。
  `reset` 已在 Docs additionalApi 的“Steps 实例方法”单独列出 `() => void`，说明 bind:this 获取实例、同步绑定与不修改 items.status/表单的边界。
- `orientation=horizontal | vertical`、五档 `size`，`indicator/title/description` snippet 只替换内容，ol/li、原生行为与 aria-current 仍归组件所有。
- typed number 1 和 string "1" 不同。重复/非法 key 会被拒绝；items 重排保留身份，当前 key 暂时不存在时显示无当前项，不静默重写业务状态。

## 语义与视觉

根为有名称的原生 ol，步骤为 li，最多一个 `aria-current=step`。根固定 role=list，保留隐藏原生列表标记后的列表辅助语义；调用方不覆盖列表角色。按钮与链接使用浏览器 Tab/Shift+Tab、Enter/Space 规则；不使用 Tabs 的 tablist、tabpanel、roving tabindex 或方向键切换。disabled/loading 项不可发请求或导航；loading 不自动更改 complete/error 等业务状态。`currentKey=null` 只代表无当前步骤；未开始和全部完成由业务区分，完成通过 items.status 显式表达。

五档 marker 与控件高度共用 24/28/32/40/48 token，内部图标使用独立 indicator scale；标题字号沿 control scale。横向在有界容器中自动均分与换行，最小列宽由 marker 比例计算；纵向使用逻辑连接线。长词自然断行，RTL 镜像。current/complete/error/pending 使用 primary/success/danger/surface Theme token；状态变化采用 Theme duration/easing，loading 使用现有 Spinner 的 owner Window/reduced-motion 生命周期。

## 对标与范围

采用 [Ant Design Steps](https://ant.design/components/steps/) 与 [Mantine Stepper](https://mantine.dev/core/stepper/) 的步骤状态、方向、图标、描述、可点击与 loading 能力；用 stable typed key 取代数组索引。遵守 [APG 键盘接口原则](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/) 中原生控件与复合控件职责的区别，不为流程列表复制 Tab 控件键盘模型。

步骤表单、业务校验、完成内容与保留数据由调用方组合。首批不引入 StepsForm 框架、网络适配或第二套表单状态。dot/panel 等额外外观、折叠多步骤与每步百分比属于后续扩展，不能把本批元数据状态当作已具备全部成熟库能力。

## 根整合

新增组件位于 `components/navigation/ZSteps.svelte`；根需集成运行时/类型/metadata 导出、catalog、Docs 注册和 generated API。导出清单为 ZSteps、StepsItem、StepsItemContext、StepsStatus、StepsOrientation、StepRequestEvent、ZStepsProps，以及 stepsMetadata。localePack 需要 `steps.label/pending/complete/error/loading` 中英文文案，已由根接手。测试从新组件源码直接导入；Docs 的公开导入需要根整合导出后生效。

## 验证记录

实现过程中只进行 Node Prettier 和 WebStorm 局部诊断，不运行本地测试、完整类型检查、构建或 CI。以下合同已经落盘，尚待 CI 执行：

- `steps-production.spec.ts`：SSR ol/li、唯一当前项、number/string身份、真实href/button、显式完成与无当前状态、非法descriptor和CancelableEvent。
- `steps-production-types.ts`：泛型key在items/current/request中的保留，以及无效key/status/size的负例。
- `steps-production.browser.spec.ts`：同步取消按钮/链接请求、不发重复变更、原生键盘、禁用/加载不可激活、key重排/移除、外部null、受控/非受控baseline与reset责任、五档marker真实几何/字体/主题色、长标签RTL横纵布局、连接线、full/reduced动画与卸载释放。
- `StepsFixture.svelte`、`StepsLongFixture.svelte`、`StepsUncontrolledFixture.svelte` 为以上行为提供真实组件场景。
- Docs 的 Basic、Request、Sizes、Layouts 四个示例覆盖被动进度、延后接受/取消、五档loading/disabled、长词/RTL/纵向、真实href和内容snippet。

上述自有文件完成 Node Prettier，WebStorm 分批局部诊断完整返回无 error。根整合尚包括 generated facts 与实际浏览器验收；不能把局部静态诊断或 experimental metadata 当作测试通过或稳定发布证据。
