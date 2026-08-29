# WeChat clean-package acceptance

`pnpm --filter @zadmin/miniapp test:package` 会在系统临时目录打包并安装唯一的 `@zadmin/miniapp` tarball，然后从外部 Svelte fixture 执行类型检查和直接微信 target 构建。

验收要求：

- 只安装发布 tarball，不通过 workspace 链接读取源码；
- `M*` 组件、Theme、平台类型和 CLI 可以从公开 exports 使用；
- 第二次安装使用 frozen lockfile；
- 生成 WXML、WXSS、JS、JSON 和 sourcemap；
- 发布包和生成产物不含 ZUI、`@tarojs`、testing 入口、开发 build ID 或 workspace 绝对路径；
- 临时 fixture 在成功和失败后都删除。

该完整安装门禁交给 GitHub Actions；`wechat-package-acceptance.json` 由脚本生成，只有对应 CI 通过后才是本次提交的外部包证据。
