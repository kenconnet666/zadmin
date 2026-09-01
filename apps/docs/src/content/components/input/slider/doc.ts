import { sliderMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import formSource from './FormDemo.svelte?raw';
import ReadonlyDemo from './ReadonlyDemo.svelte';
import readonlySource from './ReadonlyDemo.svelte?raw';
import StatesDemo from './StatesDemo.svelte';
import statesSource from './StatesDemo.svelte?raw';
import { sliderApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const sliderDoc = defineComponentDoc(sliderMetadata, {
	profiles: ['form-control'],
	sourceApi: sliderApiFacts,
	teaching: {
		props: {
			defaultValue: { default: '0', description: '规范化的非受控初值与form reset目标。' },
			formatValue: {
				default: '—',
				description: '把数值映射为辅助技术读取的aria-valuetext。'
			},
			invalid: { default: '继承Field或false', description: '同步aria-invalid与危险色。' },
			max: { default: '100', description: '原生范围上界。' },
			min: { default: '0', description: '原生范围下界。' },
			onValueChange: {
				default: '—',
				description: '仅可编辑状态的用户input调用；readonly、外部同步与reset不调用。'
			},
			readonly: {
				default: '自身或Field/Form任一readonly',
				description: '保持slider焦点与FormData，拦截pointer和所有数值键并设置aria-readonly。'
			},
			ref: { default: 'null', description: '真实HTMLInputElement引用。' },
			size: {
				default: 'Field size → Provider density',
				description: '显式尺寸优先，再继承Field和Provider density。'
			},
			step: { default: '1', description: '原生正数步长，输入值会按范围和步长规范化。' },
			value: { default: 'undefined', description: 'Svelte bindable规范化数值。' }
		},
		summary: '真实range驱动、支持Field/RTL/readonly、受控状态和原生表单的单值Slider。'
	},
	demos: [
		{
			covers: ['controlled', 'form-data', 'form-reset', 'keyboard', 'uncontrolled'],
			component: FormDemo,
			description: '原生range统一处理pointer、触摸、键盘、RTL、FormData与reset。',
			id: 'slider-form',
			source: formSource,
			title: '数值与表单'
		},
		{
			covers: ['density', 'disabled', 'invalid', 'native-props', 'variants-and-states'],
			component: StatesDemo,
			description: '范围、步长、尺寸、无效和禁用状态继续使用原生range键盘。',
			id: 'slider-states',
			source: statesSource,
			title: '范围、尺寸与状态'
		},
		{
			covers: ['focus', 'form-data', 'keyboard', 'readonly'],
			component: ReadonlyDemo,
			description:
				'只读range保持焦点、值与FormData，阻止pointer/键盘改值；owner同步仍有效，并提供可编辑对照。',
			id: 'slider-readonly',
			source: readonlySource,
			title: '只读、Owner同步与对照'
		}
	],
	accessibility: [
		'真实input[type=range]提供slider角色、pointer捕获与完整键盘语义。',
		'formatValue生成aria-valuetext，label和Field可提供可访问名称及描述。',
		'Provider direction通过dir传递给原生range，表单reset不触发用户回调。',
		'HTML readonly不适用于range；ZUI阻止pointerdown和数值键，并在input/change防线恢复owner值。',
		'aria-readonly和data-readonly保留“可聚焦但不可改”语义，不使用disabled替代。',
		'readonly不转发onpointerdown/onkeydown/oninput/onchange/onValueChange；非数值键仍保持原生路径。'
	]
});
