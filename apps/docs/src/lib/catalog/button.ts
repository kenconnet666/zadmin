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
			description: '每个variant组合稳定recipe branch class。',
			id: 'button-variants',
			source: variantsSource,
			title: 'Variants'
		},
		{
			component: StatesDemo,
			description: 'loading和disabled映射到原生disabled，点击使用onclick。',
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
