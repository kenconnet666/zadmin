import wechatRenderer, { MiniFragment } from '../targets/wechat/runtime.ts';

export function createMiniappFragment(): MiniFragment {
	return new MiniFragment();
}

export { MiniFragment, wechatRenderer };
export default wechatRenderer;
