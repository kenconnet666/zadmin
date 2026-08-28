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

- 仓库根职责固定为 `apps/`、`packages/`、`plugins/`、`ui/`，配置文件属于允许的根级例外。
- 一个文件夹下面尽量要么全是子文件夹，要么全是代码文件；入口文件、配置、声明和 Manifest可以豁免。
- 一个文件夹中约 5–15 个同类项目最佳。少量骨架可以更少，明显超过 15 个时应按真实职责拆分。
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

## ZUI与样式

- 目标`@zadmin/zui`（迁移前为`@zadmin/zui`）的`icss()`公开层永远只返回class字符串，不返回`{ class, style }`，也不要求action、attachment或`css` prop。
- ICSS回调参数在第一方组件、recipe、Docs和测试中统一命名为`s`，例如`icss(theme, (s) => s.display.flex)`。
- 第一方组件需要`transparent`、`none`、`auto`等CSS标准关键字而属性元数据尚未暴露时，应补充系统关键字、类型和测试，再使用`s.property.keyword`；禁止长期保留`s.property('keyword')`。
- 第一方组件出现`#FFFFFF`等稳定视觉字面量时，应先复用或新增语义Theme token，再使用`s.property._token`；token按`canvas`、`surface`、`border`等用途命名，不按具体颜色值命名。
- 不为结构性`0`、百分比、运行时业务值或一次性算法常量机械创建Theme token；第一方组件保留原始值的例外必须有原因、文档和测试。
- Svelte编译器优化是性能路径，普通TypeScript运行时必须仍然功能正确。
- 动态叶子值进入元素inline CSS自定义属性；结构、selector和theme token进入确定性CSS rule。
- 不执行用户模块来静态提取CSS，不引入WyW、Babel或SWC编译体系。
- 条件优先使用原生TypeScript `if`、`switch`和表达式，不预先创造大规模recipe或selector语法糖。
- CSS类型、运行时能力和文档从同一属性元数据生成，避免旧ZUI式多份配置漂移。
- 高频值变化不得生成新class、rule或style tag；这是行为验收，不是可选性能建议。

Taro不是把Web CSS API原样搬过去：

- `zui-core`只保存Theme、Token、StyleProgram、dynamic slot和设计Props；不能出现Svelte、Taro、DOM、wx或Node依赖。
- `zui-svelte`与`zui-taro`允许各自拥有薄Svelte模板，不能互相依赖；至少三个模板被真实证明相同前，不提取共享Svelte源码。
- Taro ICSS只承诺可诊断子集：平面declaration、token、px/percent/显式rpx、稳定class、静态WXSS和动态叶子inline style。浏览器selector/CSSOM语义不能静默假装支持。
- 动态Taro叶子每轮只更新style值，不生成新class或WXSS rule；空值跳过，数值必须finite。

## 微信与多目标

- 微信端固定Taro 4.2.1、Vite 4.5.14和精确Svelte custom-renderer artifact；不能与Web Vite 8/registry Svelte混用解析图。
- 默认生产目标是WebView。Skyline、账号、商户、类目和真实硬件按独立verification grade记录，不能由类型检查或模拟器结果冒充真机验收。
- `platform.raw`直接保留Taro类型；managed API只有在增加权限/隐私/错误/资源生命周期/测试价值时才存在，禁止复制数百个wx接口做自研Facade。
- 登录code、手机号code、支付签名、精确位置和硬件payload不得进入默认日志、错误message、截图或snapshot。登录/手机号兑换、支付签名和最终订单状态必须留在服务端。
- 敏感API不得在页面加载时自动调用；授权、隐私、手机号、支付、订阅和系统设置必须由明确用户手势触发。
- 业务Taro module在构建时静态组合；生产不能网络加载可执行JavaScript。外部插件源码可以在开发态按realpath watch，但manifest/lockfile变化必须停止并重启安装流程。
- 开发态只有一个supervisor owner；退出必须清理所有children、watcher和lock。Taro Hook没有disposer，compiler/plugin变化必须重启Taro child，不能删除require.cache后重复注册。

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
- 默认采用“本地窄验证、GitHub Actions全量门禁”：本地优先受影响Package check、focused tests和必要build，减少重复全仓测试等待。
- 验证按风险递进：本地类型检查与focused tests → 推送 → 云端全仓check/test/build/lint与覆盖率 → 真实集成/HMR。
- 推送后必须观察对应GitHub Actions；云端失败时不能称为完成，必须修复重推或明确外部blocker。
- CI、权限、安装器、数据迁移、lockfile和无法云端复现的真实设备改动，仍应扩大本地验证，不能机械地把风险全部转移到云端。
- 临时测试源码、浏览器标签、watcher、上传包和临时目录在验收后必须恢复或清理。
- 行为变化必须同步更新文档和换设备交接；过期蓝图直接删除，不累积“历史正确、当前错误”的说明。
