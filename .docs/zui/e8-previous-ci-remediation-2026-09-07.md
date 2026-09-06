# E8 前一轮 CI 修复

检查已完成的 `1ce39f2` / [CI 34044998776](https://github.com/kenconnet666/zadmin/actions/runs/34044998776)。Workspace builds、Bundles/external、Docs 三引擎、Windows WebView2 与 Drizzle PostgreSQL 通过；Static contracts、Coverage suites、Workspace component tests 失败。没有等待或轮询 E8 新提交。

修复明确对应失败：

- PasswordInput 原来只通过 rest 传入 value，没有声明 bindable 或将内部变化回写；现在显式声明并 bind:value 转发。原有真实双向绑定回归继续保留。
- NativeSelect 的四个互斥类型负例将 @ts-expect-error 放在 property，但错误实际发生在对象 satisfies；改为类型化变量声明上的预期错误，并用 createRawSnippet 构造有效 snippet。
- Affix/BackTop 直接 Svelte mount 后，原生 ref 尚未完成刷新就调用导出滚动方法；现等待一个 Svelte tick，再进行实际 scroll。没有延長超时或移除滚动断言。
- Code 复制等待期间将按钮设为原生 disabled 导致 Chromium 焦点掉到 body；Code 与 CopyButton 共用可访问 busy/disabled 状态而保持原生焦点，仍守卫重复请求。新增延期 promise 的焦点回归。
- NavLink compact 尺寸虽设置 border-box，primary size 的内联 padding 仍使紧凑按钮最小内容宽度超出；现在 compact 明确清除 paddingInline。
- PasswordInput 的 Group 实际内框为22、外框为24；补齐真实输入和切换按钮的 contentHeight，回归分别检查内外几何。
- NativeSelect 单行模式显式使用共享 Theme height，消除 WebKit 原生最小高度多1px；multiple/nativeSize>1 保留原生列表行高。
- Menubar 打开项动态 disabled 时，焦点按该项之后、之前的可用项回收，避免错误回到第一个根菜单。

以上是本批实现与回归修复，不声称未运行的远程多引擎候选已经通过。
