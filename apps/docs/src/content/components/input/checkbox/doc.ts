import { checkboxMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import formSource from './FormDemo.svelte?raw';
import ReadonlyDemo from './ReadonlyDemo.svelte';
import readonlySource from './ReadonlyDemo.svelte?raw';
import StatesDemo from './StatesDemo.svelte';
import statesSource from './StatesDemo.svelte?raw';
import { checkboxApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const checkboxDoc = defineComponentDoc(checkboxMetadata, {
	profiles: ['form-control'],
	sourceApi: checkboxApiFacts,
	teaching: {
		props: {
			checked: {
				default: 'undefined',
				description: 'Svelte bindable双态或mixed状态；外部owner写入不会触发用户回调。'
			},
			defaultChecked: {
				default: 'false',
				description: '非受控初值与form reset目标，可使用indeterminate。'
			},
			invalid: { default: '继承Field或false', description: '同步aria-invalid与危险色。' },
			onCheckedChange: {
				default: '—',
				description: '仅可编辑状态下的真实用户切换调用；readonly、外部同步与reset不调用。'
			},
			readonly: {
				default: '自身或Field/Form任一readonly',
				description: '保持焦点和成功提交，拦截Space/click/change并设置aria-readonly。'
			},
			ref: { default: 'null', description: '真实HTMLInputElement，可调用focus和blur。' },
			size: {
				default: 'Field size → Provider density',
				description: '显式small/medium/large优先，再继承Field和Provider density。'
			},
			value: { default: "'on'", description: '选中时由真实checkbox写入FormData的标量值。' }
		},
		summary: '保留原生checkbox、mixed状态、Field继承、readonly与FormData/reset合同的选择控件。'
	},
	demos: [
		{
			covers: ['controlled', 'form-data', 'form-reset', 'uncontrolled'],
			component: FormDemo,
			description: '混合状态、双向绑定、原生FormData和reset共享同一个状态合同。',
			id: 'checkbox-form',
			source: formSource,
			title: '表单与混合状态'
		},
		{
			covers: ['density', 'disabled', 'invalid', 'native-props', 'variants-and-states'],
			component: StatesDemo,
			description: '尺寸、选中、无效和禁用状态使用原生checkbox合同。',
			id: 'checkbox-states',
			source: statesSource,
			title: '尺寸与校验状态'
		},
		{
			covers: ['focus', 'form-data', 'keyboard', 'readonly'],
			component: ReadonlyDemo,
			description: 'Field只读保留焦点和成功提交并抑制状态回调；解除祖先边界后恢复编辑。',
			id: 'checkbox-readonly',
			source: readonlySource,
			title: '只读与可编辑对照'
		}
	],
	accessibility: [
		'真实input[type=checkbox]保留原生Space、label、FormData与forced-colors行为。',
		'indeterminate通过DOM属性和aria-checked=mixed同步表达。',
		'disabled、required、invalid和aria-describedby可从ZField继承。',
		'HTML readonly不适用于checkbox；ZUI以click/change防线实现只读，同时保留真实成功控件。',
		'aria-readonly和data-readonly表达可读但不可改；readonly不会冒充disabled或移出Tab序列。',
		'readonly不转发onclick/onchange/onCheckedChange，外部checked同步与reset仍然生效。'
	]
});
