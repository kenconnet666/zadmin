import { sliderMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import formSource from './FormDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const sliderDoc = defineComponentDoc(sliderMetadata, {
	demos: [
		{
			component: FormDemo,
			description: '原生range统一处理pointer、触摸、键盘、RTL、FormData与reset。',
			id: 'slider-form',
			source: formSource,
			title: '数值与表单'
		}
	],
	accessibility: [
		'真实input[type=range]提供slider角色、pointer捕获与完整键盘语义。',
		'formatValue生成aria-valuetext，label和Field可提供可访问名称及描述。',
		'Provider direction通过dir传递给原生range，表单reset不触发用户回调。'
	]
});
