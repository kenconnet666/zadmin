import { inputMetadata } from '@zadmin/zui/metadata';
import BindingDemo from './BindingDemo.svelte';
import bindingSource from './BindingDemo.svelte?raw';
import ExternalFormDemo from './ExternalFormDemo.svelte';
import externalFormSource from './ExternalFormDemo.svelte?raw';
import FieldStatesDemo from './FieldStatesDemo.svelte';
import fieldStatesSource from './FieldStatesDemo.svelte?raw';
import TypesDemo from './TypesDemo.svelte';
import typesSource from './TypesDemo.svelte?raw';
import { inputApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const inputDoc = defineComponentDoc(inputMetadata, {
	profiles: ['form-control'],
	sourceApi: inputApiFacts,
	teaching: {
		props: {
			defaultValue: {
				default: "''",
				description: '初始文本与原生form reset目标；外部owner可用binding同步。'
			},
			invalid: { default: '继承Field或false', description: '同步无效视觉与aria-invalid。' },
			onValueChange: {
				default: '—',
				description: '仅在用户输入改变值时调用；外部同步与reset不调用。'
			},
			ref: { default: 'null', description: '真实HTMLInputElement引用。' },
			resetOnForm: {
				default: 'true',
				description: '独立输入恢复defaultValue；复合控件可关闭并由唯一root接管reset。'
			},
			size: {
				default: "Provider density（默认 'comfortable' → 'medium'）",
				description: '显式尺寸优先，否则响应最近Provider的density。'
			},
			type: { default: "'text'", description: '受支持且保留原生语义的文本输入类型。' },
			value: { default: 'undefined', description: 'Svelte bindable文本值。' }
		},
		summary:
			'原生input语义、Svelte bindable值、Field状态、外部form关联和唯一owner reset的稳定文本控件。'
	},
	demos: [
		{
			covers: ['controlled', 'uncontrolled'],
			component: BindingDemo,
			description: '用户输入更新bind:value并调用一次onValueChange。',
			id: 'input-binding',
			source: bindingSource,
			title: 'Binding与回调'
		},
		{
			covers: ['density', 'disabled', 'native-props', 'variants-and-states'],
			component: TypesDemo,
			description: '受控输入类型、尺寸与禁用态直接转发原生能力。',
			id: 'input-types',
			source: typesSource,
			title: '类型与尺寸'
		},
		{
			covers: ['form-data', 'form-reset'],
			component: ExternalFormDemo,
			description:
				'DOM外部的ZInput动态切换或重建原生form owner，signal随关联移动并共享取消感知reset。',
			id: 'input-external-form',
			source: externalFormSource,
			title: '外部Form关联'
		},
		{
			covers: ['disabled', 'focus', 'form-reset', 'invalid', 'readonly'],
			component: FieldStatesDemo,
			description:
				'ZField统一投射label、description、required、readonly、disabled和invalid；reset恢复真实默认值。',
			id: 'input-field-states',
			source: fieldStatesSource,
			title: 'Field与表单状态'
		}
	],
	accessibility: [
		'invalid映射aria-invalid。',
		'用户aria-describedby与Field上下文合并。',
		'原生oninput与onchange仍可使用。',
		'form属性把DOM外部输入和内部reset signal关联到同一原生表单，并支持动态重归属与同id owner替换。',
		'独立输入保持resetOnForm=true；复合父状态机设为false，并通过onFormReset唯一恢复受控值。'
	]
});
