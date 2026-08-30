import { linkMetadata } from '@zadmin/zui/metadata';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import NavigationDemo from './NavigationDemo.svelte';
import navigationSource from './NavigationDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const linkDoc = defineComponentDoc(linkMetadata, {
	demos: [
		{
			component: BasicDemo,
			description: '保留原生anchor导航、target和rel，同时展示正交tone、下划线与禁用合同。',
			id: 'link-basic',
			source: basicSource,
			title: '原生导航与状态'
		},
		{
			component: NavigationDemo,
			description: '当前页、外部目标和弱化导航保留原生anchor能力。',
			id: 'link-navigation',
			source: navigationSource,
			title: '导航上下文'
		}
	],
	accessibility: [
		'未禁用且有href时保持原生链接键盘和浏览器行为。',
		'禁用时移除href、设置aria-disabled并退出Tab顺序。',
		'target="_blank"在调用方未提供rel时自动使用noopener noreferrer。'
	]
});
