import { progressMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import RangeDemo from './RangeDemo.svelte';
import rangeSource from './RangeDemo.svelte?raw';
import BoundaryDemo from './BoundaryDemo.svelte';
import boundarySource from './BoundaryDemo.svelte?raw';
import MotionDemo from './MotionDemo.svelte';
import motionSource from './MotionDemo.svelte?raw';
import TonesDemo from './TonesDemo.svelte';
import tonesSource from './TonesDemo.svelte?raw';
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
			},
			indeterminateText: {
				default: 'localePack.feedback.loading',
				description: 'value缺失时使用的aria-valuetext，不伪造百分比。'
			},
			label: { default: 'localePack.progress.label', description: '每个任务的可访问名称。' },
			max: { default: '100', description: '有限且必须大于min；circle和line共享。' },
			min: { default: '0', description: '业务范围下界；原生line内部平移到0。' },
			tone: { default: "'primary'", description: '有限语义颜色，不改变任务进度状态。' },
			value: { default: 'undefined', description: '缺失表示不确定；越界有限值夹紧到范围。' },
			view: { default: "'line'", description: '原生progress line或语义circular SVG。' }
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
		},
		{
			component: TonesDemo,
			covers: ['accessible-name', 'basic-render', 'variants-and-states'],
			description:
				'line accent-color与circle currentColor共享primary/success/warning/danger语义轴。',
			id: 'progress-tones',
			source: tonesSource,
			title: 'Line与Circle语义色'
		},
		{
			component: MotionDemo,
			covers: ['full-motion', 'reduced-motion', 'resource-cleanup'],
			description: '不确定value text、circle WAAPI与确定弧过渡都服从Theme token和reduced motion。',
			id: 'progress-motion',
			source: motionSource,
			title: '不确定状态与动画偏好'
		},
		{
			component: BoundaryDemo,
			covers: ['native-props', 'ssr', 'variants-and-states'],
			description: '自定义非零范围、formatter、上下界夹紧与原生data属性共享同一范围合同。',
			id: 'progress-boundaries',
			source: boundarySource,
			title: '非零范围、夹紧与边界'
		}
	],
	accessibility: [
		'line使用原生progress；circle使用progressbar并暴露min、max、now和格式化value text。',
		'省略label时使用Provider localePack.progress.label；同页多个进度实例应提供各自业务名称。',
		'value缺失表示不确定进度，不伪造百分比。',
		'circle不确定动画使用Theme progressIndeterminate时长，并按真实owner realm响应reduced-motion；切换或卸载会取消WAAPI。',
		'circle SVG弧表达运行时数值比例而不是通用图标，因此保留数据绘制边界；操作与状态图标仍统一使用Lucide。',
		'line保留平台原生progress与forced-colors；circle轨道/弧使用currentColor和透明度，避免硬编码SVG颜色绕过高对比。',
		'参考MUI的determinate/indeterminate与自定义范围、Ant/Naive的format/tone/circle，但不复制dashboard、steps、渐变、success分段或任意strokeColor。'
	],
	keywords: ['progress', 'progressbar', 'circle', 'line', 'indeterminate', 'tone', 'reduced motion']
});
