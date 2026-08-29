import { containerMetadata } from '@zadmin/zui/metadata';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const containerDoc = defineComponentDoc(containerMetadata, {
	demos: [
		{
			component: BasicDemo,
			description: '最大宽度与gutter正交，使用margin-inline:auto和padding-inline。',
			id: 'container-basic',
			source: basicSource,
			title: '居中内容边界'
		}
	],
	accessibility: ['不增加landmark或role；需要main、section等语义时由调用方在外层使用原生元素。']
});
