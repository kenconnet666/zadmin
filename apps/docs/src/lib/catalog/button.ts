import { buttonMetadata } from '@zadmin/zui/metadata';
import StatesDemo from '../demos/ButtonStatesDemo.svelte';
import statesSource from '../demos/ButtonStatesDemo.svelte?raw';
import VariantsDemo from '../demos/ButtonVariantsDemo.svelte';
import variantsSource from '../demos/ButtonVariantsDemo.svelte?raw';
import { defineComponentDoc } from './types.js';

export const buttonDoc = defineComponentDoc(buttonMetadata, {
	demos: [
		{
			component: VariantsDemo,
			description: '每一种视觉变体都生成稳定、可复用的 recipe class。',
			id: 'button-variants',
			source: variantsSource,
			title: '视觉变体'
		},
		{
			component: StatesDemo,
			description: '尺寸、加载和禁用状态都保留原生 button 语义，点击事件通过 onclick 传递。',
			id: 'button-states',
			source: statesSource,
			title: '尺寸与状态'
		}
	],
	accessibility: [
		'默认type=button，避免在表单中意外提交。',
		'loading设置aria-busy并禁用交互。',
		'保留键盘、焦点和原生button事件语义。'
	]
});
