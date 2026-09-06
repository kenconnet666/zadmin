# E7 对上一候选 CI 的修复

已完成的上一run为[34037665682](https://github.com/kenconnet666/zadmin/actions/runs/34037665682)，提交e99b407（包含E6）。Docs三浏览器、workspace build、bundle/external以及Drizzle PostgreSQL均通过；Static、组件/覆盖率和Windows类型检查失败。本文件不把后续修复描述为已通过本次新CI。

- locale两个resizeHandle格式化器显式声明position:string，解决冻结对象缺少上下文参数类型。
- Menubar离开目标先以isDomHtmlElement收窄，避免FocusableElement可能是SVG的类型错误；动态禁用关闭后使用既有MountedElements调度，将焦点放到下一根trigger，避免旧Popup cleanup争抢。fixture用untrack捕获defaultValue初值。
- NavLink compact规则显式border-box，保留原32px方形宽高断言并增加computed boxSizing验证。
- Resizable明确untrack捕获默认尺寸基线；iframe fixture在其真实owner Document中创建ICSS runtime并提供ZProvider，避免类名在主文档注册而iframe退回800px布局。仍严格验证错误Window事件不调整、正确Window调整、owner尺寸与卸载取消。
- Toolbar fixture显式使用并恢复1024×768 viewport，640px owner不再被默认414px视口夹住；原used width与focus/hidden断言保留。
- Splitter负例directive移到实际Symbol属性错误行；对真实可键盘separator和可滚动fixture region使用准确局部可访问性注释，不删除键盘入口或关闭全局检查。

修复与新组件的相关SSR/type/browser回归同步编写或修订，最终结果仍等下一候选远程CI。本地未运行全量类型、测试或构建。
