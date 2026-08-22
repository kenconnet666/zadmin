# 工程倾向与决策原则

## 目录与边界

- 根业务目录固定为 `apps/`、`packages/`、`plugins/`。
- Admin、ETL、Docs 是 App；Approval、ERP、CRM 是动态 Plugin。
- Core、SvelteKit、Auth、PostgreSQL、Redis、OSS、ZUI、Drizzle 是 Package。
- 不增加没有明确收益的顶层 config或 tooling目录。
- Apps 不互相导入；Packages 不依赖 Apps或 Plugins。

## 代码

- 优先简洁、低冗余和可维护的直接实现。
- 抽象必须解决已经发生的问题。
- 跨模块调用使用依赖注入后的普通对象，不使用同进程 RPC。
- Consumer 在自己的 package 中声明所需最小类型。
- 生命周期资源归属 Scope，禁止模块顶层隐式连接和定时器。
- 不用注释复述代码；注释解释约束和非显然原因。

## 插件

- 一个 Plugin 一个 package、一个 Manifest、一个制品版本。
- Server和Client是同一插件的不同入口，不拆成两个产品。
- Plugin ID等于 package name。
- 生产只安装预构建 `.zplugin`，不执行未知 install/build脚本。
- 第一阶段只允许 trusted插件；未实现信任级别直接拒绝。
- 安装新版本不覆盖旧版本，失败升级恢复旧 revision。

## 依赖

- 优先较新的兼容稳定版本。
- pnpm catalog统一共享版本。
- 最新主版本必须通过 peer、类型、测试和构建；不兼容时使用最近兼容版本并记录原因。
- TypeScript当前使用 6.0.3，因为已验证工具链没有共同支持 TypeScript 7。

## HMR

- 开发者不手工重启。
- App/Package变化允许自动 Host重建；Plugin变化必须局部重载。
- 构建失败不能卸载当前可用 Plugin。
- Server和Client候选失败都必须回滚。
- 无关 Plugin不得因单个 revision变化停止。
- HMR必须通过真实 dev server和浏览器验证。

## Git与验证

- 使用阶段性 Git提交，每个提交保持可检查、可测试和可构建。
- 不把目录迁移、API重构、业务实现混进同一提交。
- 保护用户已有改动，不使用破坏性 reset。
- 测试临时目录和制品在取证后精确清理。
- 文档必须描述当前行为，旧设计被替换后直接重写而不是继续叠加例外。
