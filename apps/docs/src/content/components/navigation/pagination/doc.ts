import { paginationMetadata } from '@zadmin/zui/metadata';
import InteractiveDemo from './InteractiveDemo.svelte';
import interactiveSource from './InteractiveDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const paginationDoc = defineComponentDoc(paginationMetadata, {
	demos: [
		{
			component: InteractiveDemo,
			description: '边界页、当前页兄弟区间和ellipsis由稳定页码模型生成。',
			id: 'pagination-interactive',
			source: interactiveSource,
			title: '页码窗口'
		}
	],
	accessibility: [
		'根节点使用带可本地化名称的nav，所有操作保留原生button语义。',
		'当前页使用aria-current=page，前后页在边界使用原生disabled。',
		'页码可见文本和可访问名称均使用Provider locale与translations。'
	]
});
