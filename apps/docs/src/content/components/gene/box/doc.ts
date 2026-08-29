import { boxMetadata } from '@zadmin/zui/metadata';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const boxDoc = defineComponentDoc(boxMetadata, {
	demos: [
		{
			component: BasicDemo,
			description: '使用ICSS class为ZBox添加视觉样式，不产生包装层。',
			id: 'box-basic',
			source: basicSource,
			title: '真实根元素'
		}
	],
	accessibility: ['不伪造role。', '原生aria-*、data-*和事件直接转发到div。']
});
