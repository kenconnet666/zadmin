import { meterMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import RangesDemo from './RangesDemo.svelte';
import rangesSource from './RangesDemo.svelte?raw';
import CustomRangeDemo from './CustomRangeDemo.svelte';
import customRangeSource from './CustomRangeDemo.svelte?raw';
import NativeDemo from './NativeDemo.svelte';
import nativeSource from './NativeDemo.svelte?raw';
import OptimumDemo from './OptimumDemo.svelte';
import optimumSource from './OptimumDemo.svelte?raw';
import { meterApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const meterDoc = defineComponentDoc(meterMetadata, {
	profiles: ['data-view'],
	sourceApi: meterApiFacts,
	teaching: {
		props: {
			formatValue: {
				default: 'Intl.NumberFormat(locale)',
				description: '生成fallback与aria-valuetext，并接收规范化range和optimal state。'
			},
			high: { default: 'max', description: '高阈值，必须满足low <= high <= max。' },
			label: { default: '必填', description: '原生meter的可访问名称。' },
			low: { default: 'min', description: '低阈值，必须满足min <= low <= high。' },
			max: { default: '100', description: '有限范围上界，必须大于min。' },
			min: { default: '0', description: '有限范围下界。' },
			optimum: { default: '范围中点', description: '最佳值，必须位于min/max之内。' },
			ref: { default: 'null', description: '真实HTMLMeterElement引用。' },
			value: { default: '必填', description: '有限且必须位于min/max内；不会静默夹紧。' }
		},
		summary:
			'坚持原生meter：严格范围/阈值/value、本地化value text、平台最佳区间与高对比语义，不承担任务进度。'
	},
	demos: [
		{
			component: FormDemo,
			covers: ['accessible-name', 'basic-render', 'variants-and-states'],
			description: '原生meter根据最佳值和低高阈值呈现容量。',
			id: 'meter-thresholds',
			source,
			title: '容量阈值'
		},
		{
			component: RangesDemo,
			covers: ['basic-render', 'variants-and-states'],
			description: '相同阈值分别展示最佳、次优和临界区间。',
			id: 'meter-ranges',
			source: rangesSource,
			title: '阈值区间'
		},
		{
			component: CustomRangeDemo,
			covers: ['accessible-name', 'native-props', 'variants-and-states'],
			description: '非零容量范围与state-aware formatter共同生成fallback和aria-valuetext。',
			id: 'meter-custom-range',
			source: customRangeSource,
			title: '自定义范围与格式化'
		},
		{
			component: OptimumDemo,
			covers: ['basic-render', 'ssr', 'variants-and-states'],
			description: 'optimum低于low、高于high或位于区间内时使用不同原生最佳方向。',
			id: 'meter-optimum',
			source: optimumSource,
			title: '低、高与中间最佳值'
		},
		{
			component: NativeDemo,
			covers: ['accessible-name', 'native-props'],
			description: 'aria-describedby、data属性、label与平台meter绘制继续属于真实元素。',
			id: 'meter-native',
			source: nativeSource,
			title: '原生属性与说明关系'
		}
	],
	accessibility: [
		'Meter用于已知范围内的标量，不表示任务完成进度。',
		'label为必填可访问名称；formatter同时提供fallback文本与aria-valuetext。',
		'min、low、high、optimum、max按原生顺序校验；value越界会早失败而非静默夹紧。',
		'原生meter优先于自绘div/ARIA meter，浏览器拥有最佳区间绘制与forced-colors；data-state只供主题和业务检查。',
		'参考HTML meter与MDN原生优先原则；不复制Progress动画、circle、tone或indeterminate，也不增加仪表盘SVG。'
	],
	keywords: ['meter', 'gauge', 'threshold', 'capacity', 'optimum', 'native meter']
});
