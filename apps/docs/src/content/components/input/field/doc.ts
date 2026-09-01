import { fieldMetadata } from '@zadmin/zui/metadata';
import ValidationDemo from './ValidationDemo.svelte';
import validationSource from './ValidationDemo.svelte?raw';
import StatesDemo from './StatesDemo.svelte';
import statesSource from './StatesDemo.svelte?raw';
import FocusOwnerDemo from './FocusOwnerDemo.svelte';
import focusOwnerSource from './FocusOwnerDemo.svelte?raw';
import { fieldApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const fieldDoc = defineComponentDoc(fieldMetadata, {
	profiles: ['form-control'],
	sourceApi: fieldApiFacts,
	teaching: {
		props: {
			controlId: {
				default: '自动生成',
				description: '覆盖label的for目标；复合控件通过Field上下文消费同一个ID。'
			},
			description: {
				default: '—',
				description: '辅助说明Snippet或字符串，并入控件aria-describedby。'
			},
			disabled: { default: 'false', description: '把禁用状态投射给Field内的控件。' },
			error: {
				default: '—',
				description: '一个或多个错误消息，同时建立invalid状态和polite live region。'
			},
			label: {
				default: '必填',
				description: '控件的可见标签；支持字符串或Snippet。'
			},
			name: { default: '—', description: '由Field内唯一表单控件继承的原生name。' },
			readonly: { default: 'false', description: '把只读状态投射给Field内的控件。' },
			ref: { default: 'null', description: '绑定Field的真实HTMLDivElement根节点。' },
			required: {
				default: 'false',
				description: '显示必填标记并把aria-required投射给控件。'
			},
			size: { default: "'medium'", description: '控制标签、控件与消息之间的间距。' }
		},
		summary: '统一关联label、description、错误、表单状态与唯一焦点owner的无侵入字段容器。'
	},
	demos: [
		{
			covers: ['basic-render', 'controlled', 'invalid'],
			component: ValidationDemo,
			description: '输入1–2个字符观察消息集合和aria-describedby关系。',
			id: 'field-validation',
			source: validationSource,
			title: '描述与错误状态'
		},
		{
			covers: ['disabled', 'invalid', 'readonly', 'variants-and-states'],
			component: StatesDemo,
			description: '紧凑、只读、禁用和多错误消息保持统一label与description关系。',
			id: 'field-states',
			source: statesSource,
			title: '尺寸与字段状态'
		},
		{
			covers: ['accessible-name', 'focus', 'keyboard'],
			component: FocusOwnerDemo,
			description:
				'点击Field标签会把焦点交给Select的真实button trigger，说明复合控件只注册一个焦点owner。',
			id: 'field-focus-owner',
			source: focusOwnerSource,
			title: '复合控件焦点Owner'
		}
	],
	accessibility: [
		'使用SSR稳定ID连接label和control。',
		'description和messages共同进入aria-describedby。',
		'消息集合使用polite live region，避免重复警报。'
	]
});
