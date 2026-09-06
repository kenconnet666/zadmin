# E7 复制组件族合并

本批新增公开 `ZCopyButton` 与 `ClipboardController`，并把 Docs `DocSourceActions` 和 ZCode 的重复复制状态、Promise世代、反馈计时器与卸载清理迁移到同一实现。没有读取系统剪贴板。

ClipboardController通过`getWindow`读取真实操作窗口，`copy(value, timeout?)`在调用栈内直接调用原生writeText，之后才等待Promise。snapshot包含idle/copying/copied/failed与真实error，另外提供copied/pending/error只读入口。reset、destroy、后续请求和owner变化使旧请求反馈失效，返回stale；这不会宣称撤销已经提交的浏览器写入。反馈计时器也属于原owner Window，默认2000ms，timeout=0保留至reset或新值。异步反馈时间不混用Theme动画duration。

ZCopyButton复用ZButton，类型固定button，保留原生click取消、disabled、loading、五档size、shape/variant/tone和native props。值由value输入；copied/error回调只来自当前有效请求。默认标签为四状态预留宽度，支持iconOnly、children(snapshot)、icon(snapshot)、简短标签和完整live消息。图标与ZCode共享私有CopyStatusIcon和indicatorSizeStyles，不为可选Code入口引入整个公共图标manifest。

Docs源码操作现在直接组合ZCopyButton：复制按钮仍在查看/收起源码左侧，复制成功切换勾选图标和“已复制”，title/live消息保留具体demo名称。旧的局部generation/timer/status以及重复图标与公告布局已删除。

ZCode保留公开`onCopy({code,status})`和copied/failed状态，代码原文和高亮职责保持分开。复制反馈统一采用2000ms（原内部1500ms），复制期间避免重复激活；source/lang/theme变化与卸载仍使反馈失效。原生Clipboard不可用或拒绝时明确失败，不假装成功，也不增加权限询问界面。

Browser实际证据：390px Docs源码按钮点击后data-copy-state=copied、图标check、标签“已复制”、title包含对应demo名称，无页面横向溢出；公共CopyButton明确文本示例回调成功；ZCode“可复制部署命令”按钮也得到copied/check且原有回调成功。测试资产覆盖同步用户手势调用、真实Promise结果、失效请求、reset/destroy/owner变化、0 timeout、标签几何、用户取消和错误反馈。完整测试执行继续由远程CI承担，本地只做WebStorm局部检查与实际Chrome操作。
