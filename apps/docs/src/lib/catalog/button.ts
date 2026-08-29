import StatesDemo from '../demos/button/StatesDemo.svelte';
import statesSource from '../demos/button/StatesDemo.svelte?raw';
import VariantsDemo from '../demos/button/VariantsDemo.svelte';
import variantsSource from '../demos/button/VariantsDemo.svelte?raw';
import { defineComponentDoc } from './types.js';

export const buttonDoc = defineComponentDoc({
	id: 'button',
	name: 'ZButton',
	summary: '使用原生button语义、稳定recipe变体和Svelte 5 callback props的基础操作组件。',
	importStatement: "import { ZButton } from '@zadmin/zui';",
	source: 'ui/zui/src/lib/components/button/ZButton.svelte',
	demos: [
		{
			id: 'button-variants',
			title: 'Variants',
			description: '每个variant只组合已缓存的recipe branch class。',
			component: VariantsDemo,
			source: variantsSource
		},
		{
			id: 'button-states',
			title: '尺寸与状态',
			description: 'loading和disabled都映射到原生disabled；点击继续使用onclick。',
			component: StatesDemo,
			source: statesSource
		}
	],
	api: [
		{
			title: 'Props',
			description: '同时转发适用的HTMLButtonAttributes。',
			rows: [
				{
					name: 'variant',
					type: "'primary' | 'secondary' | 'danger' | 'ghost'",
					default: "'primary'",
					description: '有限视觉/语义变体。'
				},
				{
					name: 'size',
					type: "'small' | 'medium' | 'large'",
					default: "'medium'",
					description: '按钮尺寸。'
				},
				{ name: 'fullWidth', type: 'boolean', default: 'false', description: '扩展到父容器宽度。' },
				{
					name: 'loading',
					type: 'boolean',
					default: 'false',
					description: '设置aria-busy并禁用交互。'
				},
				{
					name: 'disabled',
					type: 'boolean',
					default: 'false',
					description: '映射到原生disabled。'
				},
				{
					name: 'type',
					type: "'button' | 'submit' | 'reset'",
					default: "'button'",
					description: '原生button type。'
				},
				{
					name: 'onclick',
					type: '(event: MouseEvent) => void',
					default: '—',
					description: 'Svelte 5原生callback event。'
				},
				{
					name: 'ref',
					type: 'HTMLButtonElement | null',
					default: 'null',
					description: '真实button引用。'
				}
			]
		}
	],
	accessibility: [
		'默认type=button，避免在表单中意外提交。',
		'loading设置aria-busy且spinner为aria-hidden。',
		'保留键盘、焦点和原生button事件语义。'
	]
});
