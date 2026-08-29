import { inputMetadata } from '@zadmin/zui/metadata';
import BindingDemo from '../demos/InputBindingDemo.svelte';
import bindingSource from '../demos/InputBindingDemo.svelte?raw';
import { defineComponentDoc } from './types.js';

export const inputDoc = defineComponentDoc(inputMetadata, {
	demos: [
		{
			component: BindingDemo,
			description: '用户输入更新bind:value并调用一次onValueChange。',
			id: 'input-binding',
			source: bindingSource,
			title: 'Binding与回调'
		}
	],
	accessibility: [
		'invalid映射aria-invalid。',
		'用户aria-describedby与Field上下文合并。',
		'原生oninput与onchange仍可使用。'
	]
});
