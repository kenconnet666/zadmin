import { switchMetadata } from '@zadmin/zui/metadata';
import ControlledDemo from './ControlledDemo.svelte';
import controlledSource from './ControlledDemo.svelte?raw';
import FormDemo from './FormDemo.svelte';
import formSource from './FormDemo.svelte?raw';
import PreferencesDemo from './PreferencesDemo.svelte';
import preferencesSource from './PreferencesDemo.svelte?raw';
import StatesDemo from './StatesDemo.svelte';
import statesSource from './StatesDemo.svelte?raw';
import { switchApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const switchDoc = defineComponentDoc(switchMetadata, {
	profiles: ['form-control', 'animated'],
	sourceApi: switchApiFacts,
	teaching: {
		props: {
			checked: {
				default: 'undefined',
				description: 'Svelte bindable布尔状态；用户操作写回binding并触发一次回调。'
			},
			defaultChecked: {
				default: 'false',
				description: '非受控初值与form reset目标；reset不会触发onCheckedChange。'
			},
			disabled: { default: 'false', description: '映射原生disabled，并从Field继承。' },
			form: { default: '最近祖先form', description: '把真实checkbox关联到DOM外部原生form。' },
			indicator: {
				default: '—',
				description: '装饰性thumb Snippet，接收checked；不会改变开关的可访问名称。'
			},
			invalid: {
				default: '继承Field或false',
				description: '同步错误边框、data-invalid与aria-invalid。'
			},
			loading: {
				default: 'false',
				description: '设置aria-busy/aria-disabled并阻止切换，但保留当前表单值与焦点。'
			},
			loadingIndicator: {
				default: 'ZSpinner',
				description: '替换thumb内建加载指示器；其容器对辅助技术隐藏。'
			},
			name: { default: '继承Field或—', description: '真实checkbox的FormData字段名。' },
			readonly: {
				default: '继承Field或false',
				description: '阻止用户修改但保持可聚焦和FormData，并设置aria-readonly。'
			},
			required: {
				default: '继承Field或false',
				description: '使用原生Constraint Validation验证开启状态。'
			},
			ref: { default: 'null', description: '真实HTMLInputElement，可调用focus和blur。' },
			size: {
				default: "Provider density（默认 'comfortable' → 'medium'）",
				description: '显式small/medium/large优先于Provider density。'
			},
			value: { default: "'on'", description: '开启时写入FormData的标量值。' }
		},
		summary:
			'真实checkbox驱动的双态设置开关，覆盖受控与非受控状态、Field、原生表单、异步busy和方向/动画偏好。'
	},
	demos: [
		{
			covers: ['controlled', 'uncontrolled'],
			component: ControlledDemo,
			description: 'binding、外部同步与用户回调共享同一布尔合同；外部写入不会伪造用户事件。',
			id: 'switch-controlled',
			source: controlledSource,
			title: '受控与非受控'
		},
		{
			covers: ['form-data', 'form-reset', 'native-props'],
			component: FormDemo,
			description: 'Field的name/required/invalid投射到真实checkbox；FormData和reset保持原生合同。',
			id: 'switch-form',
			source: formSource,
			title: 'Field与原生表单'
		},
		{
			covers: [
				'composition',
				'density',
				'disabled',
				'invalid',
				'loading',
				'readonly',
				'variants-and-states'
			],
			component: StatesDemo,
			description: '尺寸、Provider density、Field状态、busy/readonly与Lucide指示内容保持正交。',
			id: 'switch-states',
			source: statesSource,
			title: '尺寸、状态与指示内容'
		},
		{
			covers: ['accessible-name', 'focus', 'full-motion', 'keyboard', 'reduced-motion', 'rtl'],
			component: PreferencesDemo,
			description: 'RTL翻转thumb方向，reduced-motion清除过渡，原生Space与焦点环不被包装层破坏。',
			id: 'switch-preferences',
			source: preferencesSource,
			title: 'RTL、动画与校验'
		}
	],
	accessibility: [
		'真实input[type=checkbox]配合role=switch，屏幕阅读器读取为开关。',
		'Space、label、required、disabled、FormData与reset均保留原生行为；不额外接管Enter。',
		'loading保留焦点和当前FormData，使用aria-busy与aria-disabled表达临时不可编辑。',
		'readonly保持可聚焦并设置aria-readonly；Field的说明和错误合并进aria-describedby。',
		'loading与readonly像disabled一样不转发用户onclick/onchange/onCheckedChange；外部checked同步仍由owner控制。',
		'RTL反转thumb逻辑方向，系统或Provider reduced-motion会移除转换和Spinner旋转。',
		'indicator仅作视觉装饰，开关的可访问名称必须来自稳定label、aria-label或aria-labelledby。',
		'视觉root使用focus-within呈现焦点环；真实checkbox是唯一受支持的焦点owner，indicator不得包含交互元素。',
		'class、style和ICSS变量作用于视觉root，其余适用原生属性转发给真实checkbox。'
	]
});
