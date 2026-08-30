import { visuallyHiddenMetadata } from '@zadmin/zui/metadata';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import StatusDemo from './StatusDemo.svelte';
import statusSource from './StatusDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const visuallyHiddenDoc = defineComponentDoc(visuallyHiddenMetadata, {
	demos: [
		{
			component: BasicDemo,
			description: '图标按钮保留辅助文本；组件不设置aria-hidden，也不移出可访问树。',
			id: 'visually-hidden-basic',
			source: basicSource,
			title: '辅助技术文本'
		},
		{
			component: StatusDemo,
			description: '动态数量同时进入按钮名称和视觉隐藏辅助文本。',
			id: 'visually-hidden-status',
			source: statusSource,
			title: '动态图标按钮名称'
		}
	],
	accessibility: [
		'内容仍被屏幕阅读器读取，只从视觉布局中裁切。',
		'不能用于隐藏仍可聚焦的交互控件。'
	]
});
