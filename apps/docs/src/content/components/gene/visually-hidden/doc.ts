import { visuallyHiddenMetadata } from '@zadmin/zui/metadata';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const visuallyHiddenDoc = defineComponentDoc(visuallyHiddenMetadata, {
	demos: [
		{
			component: BasicDemo,
			description: '图标按钮保留辅助文本；组件不设置aria-hidden，也不移出可访问树。',
			id: 'visually-hidden-basic',
			source: basicSource,
			title: '辅助技术文本'
		}
	],
	accessibility: [
		'内容仍被屏幕阅读器读取，只从视觉布局中裁切。',
		'不能用于隐藏仍可聚焦的交互控件。'
	]
});
