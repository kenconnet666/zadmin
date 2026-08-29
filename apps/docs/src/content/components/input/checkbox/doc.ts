import { checkboxMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import formSource from './FormDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const checkboxDoc = defineComponentDoc(checkboxMetadata, {
	demos: [
		{
			component: FormDemo,
			description: '混合状态、双向绑定、原生FormData和reset共享同一个状态合同。',
			id: 'checkbox-form',
			source: formSource,
			title: '表单与混合状态'
		}
	],
	accessibility: [
		'真实input[type=checkbox]保留原生Space、label、FormData与forced-colors行为。',
		'indeterminate通过DOM属性和aria-checked=mixed同步表达。',
		'disabled、required、invalid和aria-describedby可从ZField继承。'
	]
});
