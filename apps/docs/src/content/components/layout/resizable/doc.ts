import { resizableMetadata } from '@zadmin/zui/metadata';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import ConstraintsDemo from './ConstraintsDemo.svelte';
import constraintsSource from './ConstraintsDemo.svelte?raw';
import TwoDimensionalDemo from './TwoDimensionalDemo.svelte';
import twoDimensionalSource from './TwoDimensionalDemo.svelte?raw';
import { resizableApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const resizableDoc = defineComponentDoc(resizableMetadata, {
	profiles: ['primitive'],
	sourceApi: resizableApiFacts,
	teaching: {
		props: {
			axis: { default: "'inline'", description: 'inline、block或both逻辑调整轴。' },
			handles: { default: '按axis生成末端handle', description: '逻辑边/角handle集合。' },
			height: { default: "'100%'", description: 'bindable block尺寸，保留number/%/px/rem单位。' },
			step: { default: '8', description: '键盘像素步长；Shift使用shiftStep。' },
			width: { default: "'100%'", description: 'bindable inline尺寸，保留声明单位。' }
		},
		summary:
			'以逻辑边/角handle调整单一真实元素的inline/block尺寸，保留单位、约束和完整pointer/keyboard生命周期。'
	},
	demos: [
		{
			component: BasicDemo,
			covers: ['basic-render', 'focus', 'keyboard', 'native-props'],
			description: 'inline handle支持pointer和键盘调整，实时输出width/height与resize生命周期。',
			id: 'resizable-basic',
			source: basicSource,
			title: 'Inline调整与生命周期'
		},
		{
			component: ConstraintsDemo,
			covers: ['composition', 'native-props', 'variants-and-states'],
			description: '混合单位与min/max约束限制真实内容区域，输入控件保持在可用尺寸内。',
			id: 'resizable-constraints',
			source: constraintsSource,
			title: '单位与约束'
		},
		{
			component: TwoDimensionalDemo,
			covers: ['composition', 'keyboard', 'rtl', 'variants-and-states'],
			description: 'both轴边角handle、RTL和自定义handle snippet共同调整有界二维区域。',
			id: 'resizable-two-dimensional',
			source: twoDimensionalSource,
			title: '二维、RTL与自定义Handle'
		}
	],
	accessibility: [
		'边handle使用ARIA separator和可聚焦键盘控制，角handle使用原生button；每个handle有稳定可访问名称。',
		'Arrow/Home/End和Shift step遵循逻辑轴与RTL；pointer capture丢失或owner变化会触发cancel生命周期。',
		'children只有一个真实可调整root；尺寸状态和单位由owner绑定，组件不复制内容。'
	]
});
