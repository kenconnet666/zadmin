import { kbdMetadata } from '@zadmin/zui/metadata';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const kbdDoc = defineComponentDoc(kbdMetadata, {
	demos: [
		{
			component: BasicDemo,
			description: '使用原生kbd元素组合跨平台快捷键说明。',
			id: 'kbd-basic',
			source: basicSource,
			title: '快捷键序列'
		}
	],
	accessibility: ['kbd是文本语义，不自动注册或监听快捷键。', '按键顺序必须同时用可读文本表达。']
});
