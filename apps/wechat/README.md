# ZAdmin WeChat Mini Program

`apps/wechat`是`@zadmin/miniapp`直接微信target的验收宿主。业务使用Svelte语法和8个`M*`基础组件；构建直接生成WXML、WXSS、JS和JSON，不经过Web组件库或第三方跨端runtime。

```powershell
pnpm dev:wechat
pnpm build:wechat
```

- 开发产物：`dist/wechat/`；
- 微信开发者工具根目录：`dist/wechat/`；
- `miniapp dev`监听应用和workspace内Miniapp源码，使用串行合并重建避免并发覆盖；
- compiler不支持的DOM action、browser global、raw HTML和动态原生标签会给出源码位置与替代建议；
- Worker由`src/workers`复制并在生产构建后验证；
- 支付签名、登录code兑换、手机号code兑换和隐私敏感业务必须留在服务端。

项目默认使用`touristappid`，只用于无账号能力的编译与模拟器基础验证。预览、上传、真实授权、支付或真机硬件能力必须单独获得用户授权。
