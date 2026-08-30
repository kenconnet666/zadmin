import { emptyMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import MinimalDemo from './MinimalDemo.svelte';
import minimalSource from './MinimalDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const emptyDoc = defineComponentDoc(emptyMetadata, {
	demos: [
		{
			component: FormDemo,
			description: '说明原因并给出一个主恢复路径。',
			id: 'empty-recovery',
			source,
			title: '可恢复空状态'
		},
		{
			component: MinimalDemo,
			description: '无操作空状态使用Lucide装饰图形并保持具名section。',
			id: 'empty-minimal',
			source: minimalSource,
			title: '最小空状态'
		}
	],
	accessibility: [
		'section通过SSR稳定ID关联标题，headingLevel按宿主页面大纲选择。',
		'装饰图形从可访问树隐藏；无数据原因由文字说明。',
		'操作使用真实button/link，避免让整个空状态成为点击目标。'
	],
	keywords: ['empty', 'no data', 'recovery']
});
