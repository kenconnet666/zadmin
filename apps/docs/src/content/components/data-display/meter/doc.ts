import { meterMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import RangesDemo from './RangesDemo.svelte';
import rangesSource from './RangesDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const meterDoc = defineComponentDoc(meterMetadata, {
	demos: [
		{
			component: FormDemo,
			description: '原生meter根据最佳值和低高阈值呈现容量。',
			id: 'meter-thresholds',
			source,
			title: '容量阈值'
		},
		{
			component: RangesDemo,
			description: '相同阈值分别展示最佳、次优和临界区间。',
			id: 'meter-ranges',
			source: rangesSource,
			title: '阈值区间'
		}
	],
	accessibility: [
		'Meter用于已知范围内的标量，不表示任务完成进度。',
		'label为必填可访问名称；fallback文本保留格式化数值。',
		'min、low、high、optimum、max按原生顺序校验，value会夹紧到范围。'
	],
	keywords: ['meter', 'gauge', 'threshold', 'capacity']
});
