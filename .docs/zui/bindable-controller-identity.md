# Bindable controller发布身份

状态：已采用（2026-09-02）

## 问题

ZTree、ZDataTable、ZVirtualList和ZFileUpload会把窄命令式controller发布给`bind:controller`。controller实现可以是普通对象，但父组件若用深度`$state`接收它，Svelte会向父owner暴露代理。销毁时再比较`controller === publicController`，等于把已发布代理与原始对象比较，会产生`state_proxy_equality_mismatch`，也无法可靠判断调用方是否已经替换controller。

## 决策

发布后立即读取一次绑定实际返回的身份，并在cleanup中只与该身份比较：

```ts
controller = publicController;
const publishedController = untrack(() => controller);

return () => {
	if (untrack(() => controller) === publishedController) controller = null;
};
```

这是一条发布令牌（published identity）模式：

- 普通父状态得到代理时，令牌就是代理；
- raw或非响应式父状态得到原对象时，令牌就是原对象；
- 调用方后来替换controller时，旧组件cleanup不会清空新值；
- effect不订阅自己写入的bindable controller，避免发布、cleanup与再次发布形成自更新循环；
- controller实现、公开接口与调用方式都不需要改变。

## 门禁

系统审计拒绝`controller === publicController`模式，也要求发布令牌的读取与cleanup比较都位于`untrack`。真实浏览器在List的VirtualList边界挂载/卸载时不得阻塞后续hash route，也不得产生Svelte代理身份警告；Tree、DataTable、FileUpload与LoadingBar共用同一发布规则。
