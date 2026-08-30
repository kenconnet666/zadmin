import { tagMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
export const tagDoc = defineComponentDoc(tagMetadata, {
	demos: [
		{
			component: FormDemo,
			description: '可移除Tag把状态所有权留给调用方并提供具名按钮。',
			id: 'tag-remove',
			source,
			title: '可移除Tag'
		}
	],
	accessibility: ['移除动作是真实button并需要包含Tag上下文的名称。', '静态Tag不加入Tab顺序。'],
	keywords: ['tag', 'remove', 'label']
});
