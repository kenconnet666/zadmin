import { rangeSliderMetadata } from '@zadmin/zui/metadata';
import { rangeSliderApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import CollisionDemo from './CollisionDemo.svelte';
import collisionSource from './CollisionDemo.svelte?raw';
import FormDemo from './FormDemo.svelte';
import formSource from './FormDemo.svelte?raw';
import OrientationDemo from './OrientationDemo.svelte';
import orientationSource from './OrientationDemo.svelte?raw';

export const rangeSliderDoc = defineComponentDoc(rangeSliderMetadata, {
	profiles: ['form-control'],
	sourceApi: rangeSliderApiFacts,
	teaching: {
		props: {
			collision: { default: "'clamp'", description: '相遇时钳制、推动相邻thumb或交换活动thumb。' },
			defaultValue: { default: '[25, 75]', description: '已排序的非受控初值与form reset目标。' },
			minRange: { default: '0', description: '两个thumb的最小数值距离，按step向上对齐。' },
			thumbLabels: { default: '必填', description: '两个真实range input各自的可访问名称。' },
			value: { default: 'undefined', description: '可绑定的完整SliderRangeValue二元组。' }
		},
		summary: '两个真实range共享domain与表单字段，并以明确碰撞策略维护已排序二元范围。'
	},
	demos: [
		{
			component: BasicDemo,
			covers: ['accessible-name', 'basic-render', 'controlled', 'focus'],
			description: 'Field命名整组，thumbLabels分别命名两个真实range，绑定值保持完整二元组。',
			id: 'range-slider-basic',
			source: basicSource,
			title: '双Thumb与绑定区间'
		},
		{
			component: CollisionDemo,
			covers: ['keyboard', 'uncontrolled', 'variants-and-states'],
			description: '相同domain和minRange直接对照clamp、push与swap三种邻居碰撞行为。',
			id: 'range-slider-collision',
			source: collisionSource,
			title: '三种碰撞策略'
		},
		{
			component: FormDemo,
			covers: ['controlled', 'form-data', 'form-reset', 'native-props'],
			description: '两个同名原生range按顺序形成重复FormData字段，reset恢复完整默认区间。',
			id: 'range-slider-form',
			source: formSource,
			title: '重复FormData与Reset'
		},
		{
			component: OrientationDemo,
			covers: ['composition', 'rtl', 'variants-and-states'],
			description: '对照垂直反向与RTL水平轨道，并展示共享marks、tone和常显值标签。',
			id: 'range-slider-orientation',
			source: orientationSource,
			title: '方向、RTL与Marks'
		}
	],
	accessibility: [
		'两个真实input[type=range]各自接收必填thumbLabels，并保留原生焦点与完整键盘语义。',
		'两个input始终共享min、max和step；value输出按下界、上界排序并保持完整SliderRangeValue类型。',
		'Field提供组级标签与表单状态，thumbLabels仍分别说明下界和上界。',
		'readonly保留焦点与FormData但阻止修改，disabled使用原生排除语义。',
		'RTL、orientation和reversed共同决定视觉与方向键增量方向，碰撞只在数值更新中处理。'
	]
});
