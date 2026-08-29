import { stackMetadata } from '@zadmin/zui/metadata';
import LayoutDemo from './LayoutDemo.svelte';
import layoutSource from './LayoutDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const stackDoc = defineComponentDoc(stackMetadata, {
	demos: [
		{
			component: LayoutDemo,
			description: '切换direction，观察真实Flex布局与稳定gap token。',
			id: 'stack-layout',
			source: layoutSource,
			title: '方向与间距'
		}
	],
	accessibility: ['保持div原生语义。', '不会因视觉方向变化重排DOM或键盘顺序。']
});
