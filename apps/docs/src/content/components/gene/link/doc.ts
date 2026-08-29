import { linkMetadata } from '@zadmin/zui/metadata';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const linkDoc = defineComponentDoc(linkMetadata, {
	demos: [
		{
			component: BasicDemo,
			description: '保留原生anchor导航、target和rel，同时展示正交tone、下划线与禁用合同。',
			id: 'link-basic',
			source: basicSource,
			title: '原生导航与状态'
		}
	],
	accessibility: [
		'未禁用且有href时保持原生链接键盘和浏览器行为。',
		'禁用时移除href、设置aria-disabled并退出Tab顺序。',
		'target="_blank"在调用方未提供rel时自动使用noopener noreferrer。'
	]
});
