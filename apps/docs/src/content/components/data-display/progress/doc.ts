import { progressMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import RangeDemo from './RangeDemo.svelte';
import rangeSource from './RangeDemo.svelte?raw';
import { progressApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const progressDoc = defineComponentDoc(progressMetadata, {
	profiles: ['data-view', 'animated'],
	sourceApi: progressApiFacts,
	teaching: {
		props: {
			formatValue: {
				default: 'Intl.NumberFormat(percent)',
				description: '把规范化范围值转换为可见文本和aria-valuetext；不改变原始min/max/value。'
			}
		},
		summary:
			'共享同一范围、格式化、reduced-motion和Theme duration合同的原生line与语义circular进度。'
	},
	demos: [
		{
			component: FormDemo,
			covers: ['accessible-name', 'basic-render', 'variants-and-states'],
			description: 'line保留原生progress，circle共享范围和公告合同。',
			id: 'progress-views',
			source,
			title: 'Line与Circle'
		},
		{
			component: RangeDemo,
			covers: ['native-props', 'reduced-motion', 'resource-cleanup'],
			description: '自定义范围、值文本和不确定状态共享同一进度合同。',
			id: 'progress-range',
			source: rangeSource,
			title: '范围与格式化'
		}
	],
	accessibility: [
		'line使用原生progress；circle使用progressbar并暴露min、max、now和格式化value text。',
		'省略label时使用Provider localePack.progress.label；同页多个进度实例应提供各自业务名称。',
		'value缺失表示不确定进度，不伪造百分比。',
		'circle不确定动画使用Theme progressIndeterminate时长，并按真实owner realm响应reduced-motion；切换或卸载会取消WAAPI。',
		'circle SVG弧表达运行时数值比例而不是通用图标，因此保留数据绘制边界；操作与状态图标仍统一使用Lucide。'
	],
	keywords: ['progress', 'progressbar', 'circle', 'line']
});
