import { loadingBarMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import PageDemo from './PageDemo.svelte';
import pageSource from './PageDemo.svelte?raw';
import { loadingBarApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const loadingBarDoc = defineComponentDoc(loadingBarMetadata, {
	profiles: ['animated'],
	sourceApi: loadingBarApiFacts,
	demos: [
		{
			component: FormDemo,
			covers: ['accessible-name', 'native-props', 'variants-and-states'],
			description: '确定值与不确定任务使用同一个progressbar合同。',
			id: 'loading-bar-values',
			source,
			title: '确定与不确定进度'
		},
		{
			component: PageDemo,
			covers: ['composition', 'reduced-motion', 'resource-cleanup'],
			description: 'page模式固定到逻辑视口顶部，并保留不确定进度公告。',
			id: 'loading-bar-page',
			source: pageSource,
			title: '页面级进度'
		}
	],
	accessibility: [
		'确定值提供aria-valuenow；不确定值移除aria-valuenow并提供aria-valuetext。',
		'page=true仅改变视口定位，不创建全局单例或隐式任务。',
		'不确定动画使用Theme duration.loadingBarIndeterminate，从真实owner Window解析reduced motion并在卸载时取消。',
		'省略label时使用Provider localePack.feedback.loading；显式业务名称始终优先。'
	],
	keywords: ['loading bar', 'progressbar', 'page progress']
});
