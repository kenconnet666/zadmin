import { boxMetadata } from '@zadmin/zui/metadata';
import BasicDemo from '../demos/BoxBasicDemo.svelte';
import basicSource from '../demos/BoxBasicDemo.svelte?raw';
import { defineComponentDoc } from './types.js';

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
