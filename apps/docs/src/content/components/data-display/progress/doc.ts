import { progressMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import RangeDemo from './RangeDemo.svelte';
import rangeSource from './RangeDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const progressDoc = defineComponentDoc(progressMetadata, {
	demos: [
		{
			component: FormDemo,
			description: 'line保留原生progress，circle共享范围和公告合同。',
			id: 'progress-views',
			source,
			title: 'Line与Circle'
		},
		{
			component: RangeDemo,
			description: '自定义范围、值文本和不确定状态共享同一进度合同。',
			id: 'progress-range',
			source: rangeSource,
			title: '范围与格式化'
		}
	],
	accessibility: [
		'line使用原生progress；circle使用progressbar并暴露min、max、now和格式化value text。',
		'value缺失表示不确定进度，不伪造百分比。',
		'circle不确定动画响应reduced-motion并在卸载时取消。',
		'circle SVG弧表达运行时数值比例而不是通用图标，因此保留数据绘制边界；操作与状态图标仍统一使用Lucide。'
	],
	keywords: ['progress', 'progressbar', 'circle', 'line']
});
