import { badgeMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import CountsDemo from './CountsDemo.svelte';
import countsSource from './CountsDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
export const badgeDoc = defineComponentDoc(badgeMetadata, {
	demos: [
		{
			component: FormDemo,
			description: '语义tone使用Theme颜色表达短状态。',
			id: 'badge-tones',
			source,
			title: '状态Tones'
		},
		{
			component: CountsDemo,
			description: 'Badge可嵌入文本表达紧凑计数，不承担独立按钮语义。',
			id: 'badge-counts',
			source: countsSource,
			title: '计数徽标'
		}
	],
	accessibility: [
		'颜色不是唯一信息，Badge内容必须包含可读状态文本。',
		'Badge不隐式创建live region。'
	],
	keywords: ['badge', 'status', 'count']
});
