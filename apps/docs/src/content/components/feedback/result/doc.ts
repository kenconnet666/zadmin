import { resultMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import TonesDemo from './TonesDemo.svelte';
import tonesSource from './TonesDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const resultDoc = defineComponentDoc(resultMetadata, {
	demos: [
		{
			component: FormDemo,
			description: '状态页使用具名section组合图形、说明和操作。',
			id: 'result-success',
			source,
			title: '成功结果'
		},
		{
			component: TonesDemo,
			description: 'Info与Danger结果使用Lucide图形和不同语义色表达后续状态。',
			id: 'result-tones',
			source: tonesSource,
			title: '结果语义'
		}
	],
	accessibility: [
		'section通过SSR稳定ID关联标题；默认图形仅装饰。',
		'Result不是live region；异步完成公告应由任务状态或Alert/Toast承担。',
		'操作保持真实按钮或链接，headingLevel按页面大纲选择h2、h3或h4。'
	],
	keywords: ['result', 'status page', 'success']
});
