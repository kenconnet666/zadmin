# E6 Anchor 与 Docs 页内目录迁移

实现入口为 `ZAnchor` 与 `runtime/navigation-anchor.ts`。本组件负责页内章节链接和滚动观测；站点导航继续使用 NavigationMenu，命令菜单使用 Menubar/Menu。

公开目录项是 `AnchorItem<TKey> { key, label, href, targetId?, disabled?, children? }`。全树验证唯一 typed key、循环、非空名称与真实 href。targetId 适配 hash 路由，getTarget 可以访问调用方已知的 ShadowRoot；默认查找使用 nav 所在 tree。getTarget 返回值仍验证同一 owner document、实际连接与滚动容器归属。根输出 nav，子树是嵌套 ul/li，链接使用 aria-current=location。

activeKey/defaultActiveKey/onActiveKeyChange 只表达观测到的章节；焦点和 URL 历史是独立职责。普通未取消同页激活才执行定位；Ctrl/Meta/Alt/Shift 激活及目标缺失保留原生 href。onNavigateRequest 可以在焦点、历史和滚动前取消请求。history=false/push/replace 决定接受导航后的 URL 写入，遵循原生链接立即更新 URL 的时机，不假装等待 smooth 完成才提交。滚动观测不改变 URL。

scrollContainer 默认使用 nav 所属 Window，可显式提供 HTMLElement/Window。几何考虑容器 border/clientTop、scroll-padding-top、目标 scroll-margin-top 和额外 offset；常规 px/rem 的计算样式与百分比 scroll-padding 被转换到真实容器尺寸。此阶段面向物理纵向文章滚动，vertical writing mode 的 block 轴和复杂未解析的 CSS 数学表达式仍需后续专项扩展，不能把当前 RTL 支持当作全部 writing mode 支持。

滚动使用原生 scrollTo。ReducedMotionState 与即时 Provider motion 共同决定 instant；切换减少动画时停止当前受组件管理的平滑操作。scroll + owner requestAnimationFrame 是基本观测路径，scrollend 用于完成状态，ResizeObserver 与 MutationObserver 重建动态目标集合；卸载释放监听器、observer、RAF 和临时目标 tabindex。观测本身不移动焦点；激活时通过 preventScroll 聚焦真实 section，临时 tabindex 在 blur/卸载后清理。

公开 refresh/scrollTo/focus 方法分别重查目标、请求定位、聚焦目录链接。五档 size 和 tone 按实例 → componentDefaults.anchor → Link defaults/Provider density 继承，横向目录自然换行，嵌套目录使用现有主题间距。

`apps/docs/src/views/ComponentPage.svelte` 已迁移：删除私有 IntersectionObserver 与重复目录链接循环，使用 ZAnchor 呈现已有 demo/API/accessibility 树。目录保留 componentRoute 生成的 href，并使用 targetId 识别节点；behavior=false 让 AppShell 继续作为 hash 路由的滚动所有者，不产生两次竞争定位。四个公开演示使用局部具名 ScrollArea、唯一 targetId 和 history=false。

本地证据：WebStorm局部诊断；Chrome在390px页面无横向溢出。Basic点击“用法”后局部scrollTop=92，焦点为anchor-usage，活动项同步，页面hash仍为组件文档路由；受控示例scrollTo(third)后焦点/activeKey均为third。迁移后的桌面TOC实际宽159px、scrollWidth159px。SSR/model/type以及真实键盘、取消、修饰点击、动态删除与ShadowRoot合同已编写，完整执行交远程CI；没有在本地运行测试套件或全量类型检查。
