# ZCode生产架构

## 边界

ZCode是“纯文本代码语义 + 可选客户端增强”，不是编辑器、终端、Markdown renderer或任意HTML容器。服务端和高亮失败路径都必须保留同一份源码文本；客户端增强不能改变选择、复制、CSP或辅助技术读取边界。

## Shiki取舍

- [Shiki官方指南](https://shiki.style/guide/)说明grammar与theme可作为ESM按需加载，并支持light/dark双主题。ZUI只组合`shiki/core`、JavaScript regex engine、受控语言和两个GitHub high-contrast主题，不加载完整bundle。
- 高亮结果使用tokens与CSS变量渲染，不接受HTML字符串，不使用`{@html}`。语言、源码或theme变化时以generation保证只有最新结果提交。
- SSR先输出纯文本；无`lang`、超过100,000字符、加载失败或未知运行时输入都回退纯文本。组件不因高亮器不可用而隐藏源码。
- GitHub普通亮色主题包含未达到正文4.5:1的token，因此公开主题收敛到high-contrast亮暗组合，由Docs Axe继续门禁。

## Copy合同

- [Ant Design Typography copyable](https://ant.design/components/typography/)证明复制是成熟高频能力；ZUI只采纳“真实按钮 + copied反馈”，不复制任意icon/tooltips/HTML格式/异步文本函数的对象DSL。
- `copyable`仅用于block代码；inline code与交互按钮互斥并在初始或动态非法组合时抛错。
- 操作复用ZButton和Lucide Copy/Check/TriangleAlert；按钮保持焦点，成功/失败通过typed locale与独立polite状态公告。
- Clipboard来自最终`pre.ownerDocument.defaultView.navigator`。拒绝、不可用或异常只产生`failed`，不把私有错误写入DOM、callback或console。
- `onCopy`只返回被冻结边界内的源码与`copied | failed`状态。源码变化、重复复制或销毁会使旧Promise generation失效。
- 1.5秒视觉反馈timer归属owner Window并在源码变化、下一次复制和销毁时清理。

## 明确不做

- 不提供editable、终端执行、HTML copy、任意Shiki语言/theme字符串或全量bundle。
- 不自动创建Tooltip；按钮名称与polite状态已经提供完整反馈。
- 不把复制状态写入源码文本或`pre`可访问名称，不让行号进入复制内容。

## 证据

- SSR：纯文本、block copy anatomy、inline/copyable非法组合。
- Browser：精确Clipboard文本、焦点保留、成功/拒绝安全状态、typed locale、timer清理。
- Docs：按需高亮、inline/wrap、scheme/embedded、copy、line numbers/highlighted lines五个独立场景。
- Static：source-backed API、high-contrast imports、无危险DOM sink、资源生命周期与公开entrypoint合同。
