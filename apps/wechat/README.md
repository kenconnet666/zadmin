# @zadmin/wechat-app

仓库内受版本控制的Svelte→Taro微信小程序宿主。它是验证和集成应用，`private: true`，不发布到registry。

## 本机初始化

先在微信开发者工具中拥有一个已经授权的本地项目，然后只同步AppID和本地开发设置：

```powershell
pnpm --filter @zadmin/wechat-app setup:local -- C:\Users\lionheart\WeChatProjects\miniprogram-1
```

命令生成被Git忽略的`project.private.config.json`，不会打印AppID。公开`project.config.json`继续保留`touristappid`，生产源码不提交设备私有配置。

## 开发与构建

```powershell
pnpm dev:wechat
pnpm build:wechat
pnpm check:wechat
pnpm test:wechat
```

`dev:wechat`只有一个supervisor owner。它管理Svelte Taro TypeScript、ZUI Taro package和Taro Vite三个watcher；不要另开第二组watch命令。状态位于被忽略的`.wechat/`。

外部第一方业务package源码可在`.wechat/plugins.json`中配置：

```json
{
	"paths": ["D:/code/example-plugin"]
}
```

源码变化增量构建；compiler/app config变化重启Taro child；manifest、workspace或lockfile变化以退出码75停止并要求重新install。

## 页面

- `pages/index/index`：ZUI、state、if、keyed list、theme和动态ICSS验证。
- `pages/capabilities/index`：capability catalog与安全探针。只有network、临时storage和只读privacy可在无人值守时自动执行。

页面加载不得自动触发隐私、权限、登录、手机号、支付、订阅、系统设置或硬件操作。

## 发布边界

- 默认生产目标：WeChat WebView。
- Skyline：build-verified，尚非simulator-verified。
- 不从网络加载可执行插件；业务Taro module静态打包，变更后重新构建、审核和发布。
- 本仓库不执行upload。上传、体验版、审核和正式发布需要单独用户授权。
- 登录code兑换、手机号兑换、支付签名/回调和最终订单状态属于服务端package/plugin。

完整证据见[生产验收](../docs/content/wechat-production-acceptance.md)与[Fast Refresh](../docs/content/wechat-fast-refresh.md)。
