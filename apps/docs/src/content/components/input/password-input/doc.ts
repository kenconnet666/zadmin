import { passwordInputMetadata } from '@zadmin/zui/metadata';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
import { passwordInputApiFacts } from '../../../../framework/component-api.generated.js';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import FormDemo from './FormDemo.svelte';
import formSource from './FormDemo.svelte?raw';
import CustomDemo from './CustomDemo.svelte';
import customSource from './CustomDemo.svelte?raw';

export const passwordInputDoc = defineComponentDoc(passwordInputMetadata, {
	profiles: ['primitive', 'form-control'],
	sourceApi: passwordInputApiFacts,
	teaching: {
		props: {
			defaultVisible: { default: 'false', description: '初始及表单reset后的可见状态。' },
			toggleLabel: { default: 'localePack', description: '切换button的可访问名称。' },
			readonly: { default: 'false', description: '阻止编辑但仍允许查看/隐藏。' }
		},
		summary: '一个持久的ZInput拥有值、表单和焦点；独立真实button只切换password/text。'
	},
	accessibility: [
		'输入和可见性切换都是真实可聚焦控件；toggleLabel为切换button提供名称。',
		'readonly阻止文本修改但允许用户查看或隐藏，disabled同时禁用输入与切换button。',
		'密码值由唯一原生input拥有，焦点和选区在切换类型后恢复。'
	],
	demos: [
		{
			id: 'password-input-basic',
			title: '可见性与结果',
			component: BasicDemo,
			source: basicSource,
			covers: ['basic-render', 'controlled', 'focus', 'native-props'],
			description: '输入、显示切换和onVisibleChange均为真实交互。'
		},
		{
			id: 'password-input-form',
			title: '原生表单与 reset',
			component: FormDemo,
			source: formSource,
			covers: ['form-data', 'form-reset', 'controlled', 'focus'],
			description: '唯一原生input进入FormData，reset同时恢复值和可见状态。'
		},
		{
			id: 'password-input-custom',
			title: '只读与自定义 toggle',
			component: CustomDemo,
			source: customSource,
			covers: ['composition', 'variants-and-states'],
			description: 'readonly仍可查看密码；toggle snippet接收真实状态快照。'
		}
	]
});
