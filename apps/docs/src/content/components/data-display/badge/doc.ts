import { badgeMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
export const badgeDoc = defineComponentDoc(badgeMetadata, {
	demos: [
		{
			component: FormDemo,
			description: '语义tone使用Theme颜色表达短状态。',
			id: 'badge-tones',
			source,
			title: '状态Tones'
		}
	],
	accessibility: [
		'颜色不是唯一信息，Badge内容必须包含可读状态文本。',
		'Badge不隐式创建live region。'
	],
	keywords: ['badge', 'status', 'count']
});
