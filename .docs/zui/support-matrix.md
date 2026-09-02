# ZUI 支持矩阵

区分已测试证据与承诺支持范围，不编造浏览器最低版本。

## Package

- @zadmin/zui
- Node engine：>=22.0.0
- Svelte peer：>=5.56.0 <6
- Lucide peer：^1.37.0
- Shiki peer：^4.4.3（optional，仅 ZCode 高亮路径需要）

## CI tested

| Runtime  | Value                       |
| -------- | --------------------------- |
| Node     | 24                          |
| pnpm     | 11.22.0                     |
| Browsers | chromium / firefox / webkit |

## Acceptance

| Surface                | Tested | Evidence                                                              | Boundary                                                             |
| ---------------------- | -----: | --------------------------------------------------------------------- | -------------------------------------------------------------------- |
| SvelteKit SSR/CSP      |      Y | ui/sveltekit/scripts/accept-zui-package.mjs, .github/workflows/ci.yml | 已测试 external SSR/critical CSS/CSP；未承诺任意 SvelteKit 版本。    |
| Windows WebView2       |      Y | ui/webview/scripts/accept-package.mjs, .github/workflows/ci.yml       | 已测试 WebView2 facade/package；不扩展为所有 Windows/WebView2 版本。 |
| WeChat Miniapp/WebView |      Y | ui/miniapp/scripts/accept-package.mjs, .github/workflows/ci.yml       | 已测试 Miniapp package；真机/授权/支付/硬件需单独验收。              |

Package declarations are compatibility promises; CI rows are tested baselines only.
