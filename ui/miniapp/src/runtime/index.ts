export { createWechatApp, createWechatPage } from '../targets/wechat/runtime.ts';
export { registerWechatApp, registerWechatPage } from '../targets/wechat/lifecycle.ts';
export { getMiniappRuntimeContext, MINIAPP_RUNTIME_CONTEXT } from './context.ts';
export { getDevelopmentBuildId } from './build.ts';
export type { MiniappRuntimeContext } from './context.ts';
export { ResourceScope } from './scope.ts';
export type { ScopeCleanup } from './scope.ts';
