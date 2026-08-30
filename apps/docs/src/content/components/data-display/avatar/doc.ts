import { avatarMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
export const avatarDoc = defineComponentDoc(avatarMetadata, {
	demos: [
		{
			component: FormDemo,
			description: '无图片和加载失败都回退为具名文本，根尺寸不跳动。',
			id: 'avatar-fallback',
			source,
			title: '图片Fallback'
		}
	],
	accessibility: [
		'img使用alt；fallback使用role=img与同一名称。',
		'Avatar本身不承担按钮语义；可点击用户入口应由外层button/link提供。'
	],
	keywords: ['avatar', 'image', 'fallback']
});
