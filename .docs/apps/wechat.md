# ZAdmin WeChat Mini Program

`apps/wechat`是`@zadmin/miniapp`直接微信target的验收宿主。业务使用Svelte语法和8个`M*`基础组件；构建直接生成WXML、WXSS、JS和JSON，不经过Web组件库或第三方跨端runtime。

```powershell
pnpm dev:wechat
pnpm build:wechat
```

已授权wechatide client时可启用自动模拟器remount：

```powershell
$env:ZADMIN_WECHATIDE_CLIENT = 'codex'
pnpm dev:wechat
```

- 开发产物：`dist/wechat/`；
- 微信开发者工具根目录：`dist/wechat/`；
- `miniapp dev`监听应用和workspace内Miniapp源码，使用串行合并重建避免并发覆盖；
- 当前custom renderer关闭`compileHotReLoad`实例保留；成功build后清compile cache并完整remount Page，保证新Svelte源码生效但不保留页面状态；
- WXML通用renderer展开0–24层有限template，避免微信禁止的同名template递归；
- compiler不支持的DOM action、browser global、raw HTML和动态原生标签会给出源码位置与替代建议；
- Worker由`src/workers`复制并在生产构建后验证；
- 支付签名、登录code兑换、手机号code兑换和隐私敏感业务必须留在服务端。

项目默认使用`touristappid`，只用于无账号能力的编译与模拟器基础验证。当前WebView模拟器的页面、console、按钮事件、响应式count和自动remount已通过；预览、上传、真实授权、支付或真机硬件能力必须单独获得用户授权。
