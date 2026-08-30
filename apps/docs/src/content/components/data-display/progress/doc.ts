import { progressMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const progressDoc = defineComponentDoc(progressMetadata, {
	demos: [
		{
			component: FormDemo,
			description: 'line保留原生progress，circle共享范围和公告合同。',
			id: 'progress-views',
			source,
			title: 'Line与Circle'
		}
	],
	accessibility: [
		'line使用原生progress；circle使用progressbar并暴露min、max、now和格式化value text。',
		'value缺失表示不确定进度，不伪造百分比。',
		'circle不确定动画响应reduced-motion并在卸载时取消。'
	],
	keywords: ['progress', 'progressbar', 'circle', 'line']
});
