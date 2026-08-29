# ZAdmin 内部代码文档

`.docs`是仓库内部代码、架构、开发流程与验收记录的唯一Markdown目录，不参与`apps/docs`展示站构建，也不会作为网页内容发布。

## 分类

- [architecture](./architecture/)：核心架构、依赖注入与插件生命周期；
- [development](./development/)：工程约定、HMR、测试与换机交接；
- [miniapp](./miniapp/)：微信Miniapp能力、性能、渲染器和生产验收；
- [platforms](./platforms/)：UI平台蓝图与Windows WebView验收；
- [zui](./zui/)：ZUI ICSS、运行时CSS与外部接入合同。

## 约束

- 仓库Markdown只允许放在`.docs`；
- `apps/docs`只存放Svelte展示站代码、组件Demo和TypeScript API数据；
- 自动生成的内部报告直接写入`.docs`对应分类；
- 移动或重命名文档时必须更新仓库内链接与生成脚本；
- 无效、重复且可由其他事实源完全替代的文档直接删除，不保留空占位。
