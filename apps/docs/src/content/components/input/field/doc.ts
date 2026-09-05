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
			feedbackMinLines: {
				default: '0',
				description:
					'反馈区预留的最少行数，必须为非负整数。行高来自当前反馈样式；可为异步校验预留1–2行，超长消息仍正常增长。大于0时空live region保持挂载。'
			},
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
				description:
					'一个或多个错误消息；空串/纯空白消息被忽略，有效消息建立invalid状态和polite live region。'
			},
			label: {
				default: '必填',
				description:
					'控件的可见标签；支持字符串或Snippet。点击普通标签聚焦控件，标签内链接等交互内容保留自己的行为。'
			},
			name: { default: '—', description: '由Field内唯一表单控件继承的原生name。' },
			readonly: { default: 'false', description: '把只读状态投射给Field内的控件。' },
			ref: { default: 'null', description: '绑定Field的真实HTMLDivElement根节点。' },
			required: {
				default: 'false',
				description: '显示必填标记并把aria-required投射给控件。'
			},
			size: {
				default: 'undefined',
				description:
					'显式时控制字段间距并通过Field context声明control尺寸；未传时不覆盖control的componentDefaults或Provider density。'
			},
			success: {
				default: '—',
				description: '一个或多个成功消息，建立稳定aria-describedby关系。'
			},
			warning: {
				default: '—',
				description: '一个或多个非阻断警告消息，不会设置aria-invalid。'
			}
		},
		summary: '统一关联label、description、错误、表单状态与唯一焦点owner的无侵入字段容器。'
	},
	demos: [
		{
			covers: ['basic-render', 'controlled', 'invalid'],
			component: ValidationDemo,
			description:
				'输入、首尾空白与清空操作展示error/warning/success消息集合和aria-describedby更新。',
			id: 'field-validation',
			source: validationSource,
			title: '描述与错误状态'
		},
		{
			covers: ['disabled', 'invalid', 'readonly', 'variants-and-states'],
			component: StatesDemo,
			description:
				'三种尺寸、只读、禁用以及error/warning/success消息保持统一label与description关系。',
			id: 'field-states',
			source: statesSource,
			title: '尺寸与字段状态'
		},
		{
			covers: ['accessible-name', 'focus', 'keyboard'],
			component: FocusOwnerDemo,
			description:
				'普通标签只聚焦Select trigger、不展开；标签中的说明链接保留原生导航，不被Field截获。',
			id: 'field-focus-owner',
			source: focusOwnerSource,
			title: '复合控件焦点Owner'
		}
	],
	accessibility: [
		'使用SSR稳定ID连接label和control。',
		'description和messages共同进入aria-describedby。',
		'error、warning与success消息共享polite live region；只有error建立invalid状态。'
	]
});
