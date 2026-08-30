# ZUI 文档站六主题与展示基线

## 目标

文档站同时承担组件验收、API教学和真实交互演示。主题不能只是换背景色，必须让ZUI组件、代码高亮、布局层级、焦点状态和可访问性一起切换。

当前提供六套正式主题：

- `auroraLight`：默认明亮蓝紫主题，白色canvas与浅蓝surface分层；
- `paperLight`：暖白纸张与陶土强调，适合内容和后台；
- `neonDark`：近黑海军蓝、霓虹青和洋红的高能暗色主题；
- `midnightDark`：深蓝灰、冷白和低饱和蓝紫的专业暗色主题；
- `highContrastLight`：纯白、近黑、强边界和强焦点的亮色高对比主题；
- `highContrastDark`：纯黑、纯白、强边界和强焦点的暗色高对比主题。

主题值与`contrast`、`density`、`motion`、`direction`偏好轴分离。选择普通主题后启用high contrast偏好时，Docs解析到同scheme的高对比主题；不会为每个密度或动画组合复制新主题。

主题状态由根`ZProvider`驱动。页面组件只能消费Theme token，不得各自判断系统颜色偏好，也不得用零散raw颜色覆盖主题。

## 语义颜色

ZUI默认Theme增加以下通用token：

```text
accent
accentHover
success
warning
codeBackground
codeBorder
codeText
codeMuted
codeSelection
```

使用规则：

- `primary`用于主操作、当前导航和主要品牌识别；
- `accent`用于章节标识、状态胶囊和赛博朋克洋红强调；
- `focus`只用于键盘焦点环；
- `success`、`warning`、`danger`保留稳定语义，不能仅按装饰用途互换；
- `code*`必须成组使用，避免暗色token落在亮色背景；
- 稳定视觉值只出现在主题定义，组件Recipe使用`s.color._token`。

## ZCode合同

`ZProvider`提供显式`colorScheme: 'light' | 'dark'`，`ZCode`默认继承；`scheme`只用于局部覆盖：

```svelte
<ZProvider {theme} colorScheme={scheme}>
	<ZCode inline code="pnpm add @zadmin/zui" />
	<ZCode lang="svelte" lineNumbers code={source} />
</ZProvider>
```

`scheme`同时选择背景、边框、正文、行号、选区和Shiki token。禁止再次通过`prefers-color-scheme`单独切换token。

`embedded`用于已有边界的演示卡：移除ZCode自身边框和圆角，但保留代码padding、横向滚动与语义。

## 页面布局

桌面组件页使用：

```text
侧栏 16.5rem
正文 max 64rem
页内目录 10rem-13rem
正文与目录间距 2rem-3rem
```

低于`78rem`时隐藏页内目录并让正文占满。低于`48rem`时使用移动导航，但品牌、搜索和主题切换仍保持同一行可用。

组件头部与首个演示章节之间不能叠加两份大间距。首个章节使用约`2rem`，后续章节使用约`4rem`。

## 演示卡

- 默认只展示标题、说明和实时预览；
- 源码按需展开；
- 展开后使用继承当前scheme的嵌入式ZCode；
- 页面负责纵向滚动，代码只负责横向滚动；
- 查看源码按钮必须暴露`aria-expanded`和`aria-controls`；
- 展开、收起、复制和成功状态使用Lucide图标；
- 卡片外层统一处理边框、圆角和裁切，源码组件不得再次绘制一套容器。

## 主题状态

首访时优先级：

```text
已保存的 zui-docs-preferences-v1.themeId
旧 zui-docs-theme light/dark 迁移
系统 prefers-color-scheme
aurora-light fallback
```

切换后同步：

- 根`ZProvider.theme`；
- `html[data-theme]`；
- `html[data-resolved-theme]`与`html[data-scheme]`；
- `html[data-contrast]`、`html[data-density]`、`html[data-motion]`与`dir`；
- `html.style.colorScheme`；
- 统一preferences JSON与兼容旧scheme存储。

隐私模式导致Storage不可用时必须静默回退，不能影响页面渲染。

## 验收门禁

- 正文、muted正文、危险文本、代码正文和代码行号达到WCAG AA；
- Chromium下逐套验证六主题最终surface、刷新持久化和Axe；
- 验证高对比主题重复颜色token不会造成key冲突；
- 验证ZCode亮暗背景、14px块级字号和Shiki高亮；
- 验证演示源码没有内部纵向`overflow:auto`；
- 验证390px窄屏导航、搜索和主题按钮可见；
- ZUI和Docs类型检查为零错误；
- ZUI bundle inspection继续记录gzip并阻止compiler/server或禁用依赖进入浏览器产物。
