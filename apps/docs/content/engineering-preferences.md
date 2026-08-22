# 工程倾向与长期约束

本文件是项目级约束，不是一次任务的临时偏好。

## 代码与依赖

- 优先使用当前且相互兼容的新版本依赖、新 TypeScript语法和标准 ECMAScript能力。
- 少即是多。一个抽象必须解决已经出现的责任，不能只为“以后可能需要”而存在。
- 代码应直接、低冗余、可读、可测试；避免反射魔法、隐藏全局状态、重复依赖图和无收益分层。
- Provider依赖必须显式。业务服务不得通过全局 Service Locator临时查找未声明能力。
- 异步资源必须有清晰 owner、generation 和 disposer；禁止在插件模块顶层创建连接、timer、watcher或订阅。
- 一个 Runtime中同一 Service ID和同一 Plugin ID只能有一个 active版本。

## 目录

- 仓库根职责固定为 `apps/`、`packages/`、`plugins/`，配置文件属于允许的根级例外。
- 一个文件夹下面尽量要么全是子文件夹，要么全是代码文件；入口文件、配置、声明和 Manifest可以豁免。
- 一个文件夹中约 5–10 个同类项目最佳。少量骨架可以更少，超过 10 个时应按真实职责拆分。
- 不为满足数量机械拆出 `utils/`、`common/`、`base/`；目录名必须表达所有权或业务职责。
- 当前 `packages/core/src/` 是四个职责目录加四个公开入口：

  ```text
  app/        应用 Runtime HMR
  artifact/   Manifest、watch、install、validate、Vite构建策略
  container/  Token、Injection、Provider、Graph、Scope、Container
  plugin/     Plugin定义、Manager、Runtime、Validation

  index.ts    完整服务端入口
  di.ts       跨平台 DI入口
  plugin.ts   插件作者入口
  cli.ts      zadmin-plugin CLI
  ```

## 类型和插件依赖

- 不创建 `*-api`、`*-provider-api` 等伴生包。
- 插件 package本身发布 `.d.ts`，下游插件通过正常 pnpm依赖和 `import type`获得上游 Plugin API。
- 运行时实例仍由 `injectPlugin<TPlugin>(id)`注入，禁止直接 import并执行上游插件实现。
- 少量并行开发或弱耦合场景允许消费者本地声明最小结构，再使用 `inject<T>(id)`；它是例外，不是默认模式。
- TypeScript类型可以间接向下游传播；运行时依赖必须由每个直接消费者显式声明，不能依靠传递性 Service Locator。
- 插件版本同时是其公开 API版本；破坏公开类型必须提升 major版本。

## 装饰器

- 只提供现代标准 class decorator `@service()`。
- 不启用 `experimentalDecorators`、`emitDecoratorMetadata` 或 `reflect-metadata`。
- 不提供 parameter decorator、property injection、自动扫描或 import时全局注册。
- 装饰器只在 class constructor自身挂元数据；真正注册仍由 `provideClass()`和 Module显式完成。
- Factory Provider永远是一等路径，任何功能不得强迫使用装饰器。

## 生命周期和失败

- 候选 generation先 prepare并通过 health，再撤销旧版本、原子交换 Registry、激活新版本。
- 候选失败必须保留旧 generation。
- 旧版本 deactivate失败必须取消切换并尝试恢复旧版本。
- 新版本 activate失败必须恢复旧 Registry并重新激活旧版本。
- 新版本已经 active后，旧版本 dispose失败不得伪装成功回滚；旧 generation标为 `leaked`，阻止再次热升级并要求重启 Host。
- Observer、日志监听器和诊断 UI错误不得改变已经提交的生命周期事务。

## Git、测试和文档

- 大改动阶段性提交；每个提交都必须可以构建和验证。
- 提交前检查并发进程和工作树，避免把其他人的变化混入当前检查点。
- 验证按风险递进：类型检查 → focused tests → 全仓测试 → build → lint → 真实集成/HMR。
- 临时测试源码、浏览器标签、watcher、上传包和临时目录在验收后必须恢复或清理。
- 行为变化必须同步更新文档和换设备交接；过期蓝图直接删除，不累积“历史正确、当前错误”的说明。
