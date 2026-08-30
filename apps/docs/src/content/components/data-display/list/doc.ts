import { listMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import CustomItemsDemo from './CustomItemsDemo.svelte';
import customItemsSource from './CustomItemsDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
export const listDoc = defineComponentDoc(listMetadata, {
	demos: [
		{
			component: FormDemo,
			description: '稳定id驱动有序原生列表。',
			id: 'list-ordered',
			source,
			title: '有序流程'
		},
		{
			component: CustomItemsDemo,
			description: 'item snippet组合ZUI文本和徽标，同时保留真实li。',
			id: 'list-custom-items',
			source: customItemsSource,
			title: '自定义列表项'
		}
	],
	accessibility: [
		'ordered选择ol，否则使用ul；项目始终是li。',
		'视觉列表若没有列表语义，应使用Stack而不是ZList。'
	],
	keywords: ['list', 'ordered list', 'semantic']
});
