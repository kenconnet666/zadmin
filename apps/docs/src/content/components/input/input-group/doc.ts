import { inputGroupMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const inputGroupDoc = defineComponentDoc(inputGroupMetadata, {
	demos: [
		{
			component: FormDemo,
			description:
				'prefix、suffix和原生input形成一个边框与focus-within视觉，同时保留label、name、FormData和reset。',
			id: 'input-group-affixes',
			source,
			title: '前后缀输入组合'
		}
	],
	guidelines: [
		'children直接渲染真实ZInput或ZTextarea；Group只接管组合边界，不复制输入状态。',
		'disabled与invalid通过最近InputGroupContext传给ZInput/ZTextarea，并与ZField上下文按显式prop优先级合并。',
		'prefix/suffix可以承载文本、图标或action；业务按钮仍应显式声明自己的disabled和可访问名称。'
	],
	keywords: ['input group', 'prefix', 'suffix', 'focus within', 'form']
});
