import { loadingBarMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import PageDemo from './PageDemo.svelte';
import pageSource from './PageDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const loadingBarDoc = defineComponentDoc(loadingBarMetadata, {
	demos: [
		{
			component: FormDemo,
			description: '确定值与不确定任务使用同一个progressbar合同。',
			id: 'loading-bar-values',
			source,
			title: '确定与不确定进度'
		},
		{
			component: PageDemo,
			description: 'page模式固定到逻辑视口顶部，并保留不确定进度公告。',
			id: 'loading-bar-page',
			source: pageSource,
			title: '页面级进度'
		}
	],
	accessibility: [
		'确定值提供aria-valuenow；不确定值移除aria-valuenow并提供aria-valuetext。',
		'page=true仅改变视口定位，不创建全局单例或隐式任务。',
		'不确定动画会响应direction与reduced-motion并在卸载时取消。'
	],
	keywords: ['loading bar', 'progressbar', 'page progress']
});
