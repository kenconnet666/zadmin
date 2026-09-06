# modal Popover 透明度终态失败：已完成 CI 的定向诊断

日期：2026-09-06。结论：确认 WebKit 曾在 `connected=true`、`data-state=open` 的 Popover 上，超过用例当前 `expect.poll` 预算后仍返回中间透明度。现有证据不足以将其确定归因为 Presence 状态机、CSS 过渡或浏览器调度，因此本次不修改生产逻辑、用例时限或断言精度。

## 证据边界

读取的是已完成的 [run 34015051161 / Workspace component tests](https://github.com/kenconnet666/zadmin/actions/runs/34015051161/job/101437269154)，提交 `e009a72c3943f5776db0dccb80040b93ac9bb092`。只读取该 job 的关键错误和其 `workspace-test-diagnostics-e009a72c3943f5776db0dccb80040b93ac9bb092` artifact，没有轮询新 CI。

- `tests/components.browser.spec.ts:2428`，用例 `coordinates modal Popover semantics, width and resource cleanup`，WebKit 失败时实际值为 `{ connected: true, state: 'open', opacity: '0.601663' }`，期望透明度严格为 `'1'`。
- 同轮相同用例 Firefox 和 Chromium 都在约 309 ms 通过；WebKit 该用例总耗时 1335 ms。这排除了所有引擎必现的配置错误，但不排除 WebKit 专有生产缺陷或共享 runner 调度问题。
- 已安装 Vitest 4.1.11 的 `createExpectPoll` 源码确认默认 interval 为 50 ms、timeout 为 1000 ms。当前用例未覆盖该值。1000 ms 是轮询的墙钟预算，不能证明浏览器实际完成了相同数量的绘制帧。
- 失败 artifact 中唯一 PNG 为 `compiled-ICSS-browser-updates-coordinates-modal-Popover-semantics--width-and-resource-cleanup-1.png`。截图内 Trigger、Popover、被聚焦输入框和 `true:1` 输出均在视口左上方。它不支持“浮层整体在视口外”这个直接解释；截图没有携带 opacity 时间线，也不能证明采样失败瞬间的精确透明度。
- 同一 job 另有 `card-elevation.browser.spec.ts` 的 `Browser connection was closed` / `rpc is closed`。它属于另一个文件，不能把它直接记为 Popover 造成的连接断开，也不能忽略其对本轮 runner 可靠性的影响。
- 上一轮 run 34011087935 的 `opacity='0'` 属于主代理已提取的历史证据，本次没有重新下载验证；不能假设两次相同断言必然具有相同根因。

## 当前源代码能够确认什么

`PresenceEntryMotion` 只在新挂载节点的 owner Window 中申请两次 rAF，然后将 `entered` 切为 true；初始默认打开、减少动画、保留的退场节点重新打开都有专门路径。generation 取消过期帧，重复 update 不重复调度同一节点的待执行帧。现有单元合同覆盖这些边界。

`ZPopoverContent` 的 CSS 输入为 `popover.open && entryMotion.entered`。关闭类的 opacity 为 0，基础类为 Theme 的 opaque，默认 1；过渡为 `opacity, transform`、默认 fast 120 ms、Theme enter easing。生产 JS 没有设置 `0.601663` 这样的中间 opacity。这个值与浏览器对 CSS 过渡的插值相符，但单个结果不能区分晚启动、暂停、反复重启或读取了尚未更新的样式时间线。

`data-presence='entered'` 是挂载/退出 Presence 的状态，不是 CSS 入场已经结束的证明；当前 `data-state='open'` 同样不直接暴露 `entryMotion.entered`。因此现有失败对象虽然确认同节点仍连接且业务打开，却缺少入口类切换的时间证据。现有 `getAnimations()` 终态断言位于 opacity 断言之后，第一次断言失败时不会执行，也没有留下 animation 的状态。

Popover 的 focus、Floating 和 inert 生命周期 effect 没有显式读取 `entryMotion.entered`；Floating 只更新位置、可用尺寸和实际 placement，不写 opacity。Fixture 没有注入自定义 Theme、计时器或动画时钟。全文件没有开启 fake timers，browser setup 会卸载组件与恢复根属性。

`vite.config.ts` 已配置涉及 Firefox 时 `fileParallelism=false/maxWorkers=1`，但本轮日志可见三个浏览器的 `components.browser.spec.ts` 运行时间重叠：Firefox 约 13.0 s、Chromium 约 16.7 s、WebKit 约 18.6 s，均在相近时刻结束。不能把当前配置解释为三个引擎间完全串行。官方资料也区分文件并行与项目并行；应结合安装版本的 browser instance 解析进一步核对，不能仅凭选项名称下结论。[Vitest 并行与顺序测试说明](https://main.vitest.dev/guide/recipes/parallel-sequential.html)

WebKit 官方说明非活跃页面会暂停 rAF，源码历史也区分页面渲染节流和子文档 rAF 节流。这只构成需要记录可见性与绘制时钟的依据，不证明本轮触发了节流。失败截图位于视口内，旧节流缺陷记录也不能冒充当前 WebKit 回归的结论。[WebKit 电源与页面活动说明](https://webkit.org/blog/8970/how-web-content-can-affect-power-usage/)、[WebKit 渲染更新节流说明](https://results.webkit.org/commit?id=219795%40main&repository_id=webkit)

## 下一次 CI 的最小取证合同

### 424128d 远程采样后的补充

run34017484365 的20条样本显示：从performance16336到17232约896ms，文档一直visible且hasFocus=true，timeline正常前进，但关闭class仍在、opacity=0且animations为空。约919ms后关闭class只移除一次，两个120ms过渡共同startTime17255；最后样本currentTime81ms、progress0.994289，与失败opacity吻合。这支持“入口类开始较晚，剩余动画尚未完成”，不支持动画终态卡死、反复重启或timeline冻结；两次rAF的实际回调时刻仍未记录。

当前将该几何用例的触发改为现有`userEvent.click`，先建立真实可见、可操作的用户交互，再保留原1000ms严格终态与完整采样。它是需要下一次CI确认的测试交互修正，不据此宣称生产EntryMotion已修复。DateRangePicker另一个Docs失败中trigger仍open，不能简单归并为此动画问题。

主任务已在同一条原有 `expect.poll` 中接入最多24条只读采样：owner performance/timeline、visibility/focus、class、CSS终态参数和各Animation时间状态。仅原断言失败时输出一次JSON；没有另加rAF、监听器、延长预算或修改动画。下面的事件监听与额外rAF实验仅保留为需要更多证据时的后续选项。

保持原 1000 ms 预算、三个引擎、`opacity === '1'`、实际匹配宽度、资源清理与焦点恢复全部断言，不调用 `animation.finish()`、不关闭动画、不增加重试或跳过引擎。

建议只对这条用例收集固定上限的轻量采样，在失败时输出一次结构化诊断：

1. 每次现有 poll 记录 owner Window `performance.now()`、`document.timeline.currentTime`、`visibilityState`、document focus 状态、connected/open/presence、当前 class 和 computed opacity/transform/transitionDuration/transitionDelay/transitionTimingFunction。
2. 同时读取该节点 `getAnimations()` 的 `playState`、`pending`、`currentTime`、`startTime`、`playbackRate`、`effect.getComputedTiming()` 的 duration/progress/endTime。记录 transitionrun/start/end/cancel 的 propertyName 与 elapsedTime，并只保留有限条目。
3. 如需连续 rAF 计数，将它作为单独的诊断实验；只从 owner Window 申请，`finally` 取消，记录首两帧与最后一帧时间。持续 rAF 本身可能改变浏览器绘制行为，不能直接把“加入后通过”当成生产修复。
4. 所有监听器在 finally 中清理；诊断读取不修改节点样式、状态或动画。先保留失败对象与动画时间线，再使用截图辅助判断视口和层级。

据此分类后再修复：

| 观察结果                                                                   | 可支持的方向                     | 最小后续动作                                                                                                |
| -------------------------------------------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| owner rAF 正常推进，但入口关闭类持续保留                                   | EntryMotion/Svelte 更新异常      | 记录 effect 输入与 generation，修实际取消或重调度路径，补同输入序列的 controller/浏览器回归                 |
| class 已变为打开且 transition duration 正确，反复出现 transitioncancel/run | 样式/节点生命周期反复重启        | 找到写 class/style 或移动节点的具体路径，修该路径，不强行结束动画                                           |
| 页面墙钟推进而 timeline/currentTime/rAF 停滞                               | 浏览器页面活动或 runner 调度问题 | CI 比较同一 WebKit 文件的单引擎运行与全 workspace 运行，记录项目/实例真实并行和页面活动状态；不减少功能覆盖 |
| animation 已 finished 且无运行中动画，computed opacity 仍中间值            | CSS 级联或浏览器样式采样异常     | 对比匹配 opacity 规则和内联样式，再在同一当前 WebKit 版本构造独立页面最小复现                               |
| 加入 owner-frame 采样后稳定通过且原始时间线显示读值落后                    | 用例采样与绘制不同步的候选       | 改为有证据的帧同步采样，再保留严格终态和几何断言；不能只因一次通过便收编                                    |

## 本次产出与未完成项

本次仅新增该诊断文档，未修改生产源码、测试、Vitest 配置、CI、生成产物。未运行本地测试/构建/浏览器，未 commit/push。下载的 4.7 KB 历史 artifact 仅用于取证，截图已查看；远端 artifact 保留。本地副本仍在 `%TEMP%/zui-popover-ci-e009a72-20260906`：自动审批拦截了对本次专用目录的清理，以及随后只删除已知 PNG 的更窄操作，返回 `blocked by policy`，未提供更具体原因；未继续绕过该限制。

目前不能标记“Popover 动画已修复”。需要上述带时间线的失败记录，才能在不放宽合同的前提下选择生产修复或测试调度修复。
