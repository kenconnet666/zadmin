import BindingDemo from '../demos/input/BindingDemo.svelte';
import bindingSource from '../demos/input/BindingDemo.svelte?raw';
import { defineComponentDoc } from './types.js';

export const inputDoc = defineComponentDoc({
	id: 'input',
	name: 'ZInput',
	summary: '保留原生input能力，同时提供bind:value、onValueChange和Field语义关联。',
	importStatement: "import { ZInput } from '@zadmin/zui';",
	source: 'ui/zui/src/lib/components/input/ZInput.svelte',
	demos: [
		{
			id: 'input-binding',
			title: 'Binding与回调',
			description: '用户输入先更新bind:value，再调用一次onValueChange。',
			component: BindingDemo,
			source: bindingSource
		}
	],
	api: [
		{
			title: 'Props',
			description: '同时转发适用的HTMLInputAttributes。',
			rows: [
				{ name: 'value', type: 'string', default: "''", description: '支持bind:value的输入值。' },
				{
					name: 'type',
					type: "'text' | 'email' | 'password' | 'search' | 'tel' | 'url'",
					default: "'text'",
					description: '受支持的原生输入类型。'
				},
				{
					name: 'size',
					type: "'small' | 'medium' | 'large'",
					default: "'medium'",
					description: '输入框尺寸。'
				},
				{
					name: 'invalid',
					type: 'boolean',
					default: 'false',
					description: '设置aria-invalid和data-invalid。'
				},
				{
					name: 'onValueChange',
					type: '(value: string) => void',
					default: '—',
					description: '只在用户输入时触发。'
				},
				{
					name: 'ref',
					type: 'HTMLInputElement | null',
					default: 'null',
					description: '真实input引用。'
				}
			]
		}
	],
	accessibility: [
		'invalid映射aria-invalid。',
		'显式id和aria-describedby优先于Field上下文。',
		'原生oninput与onchange仍可使用。'
	]
});
