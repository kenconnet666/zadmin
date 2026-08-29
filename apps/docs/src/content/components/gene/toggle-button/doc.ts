import { toggleButtonMetadata } from '@zadmin/zui/metadata';
import InteractiveDemo from './InteractiveDemo.svelte';
import interactiveSource from './InteractiveDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const toggleButtonDoc = defineComponentDoc(toggleButtonMetadata, {
	demos: [
		{
			component: InteractiveDemo,
			description: '受控绑定、非受控默认值与回调保持同一个aria-pressed合同。',
			id: 'toggle-button-interactive',
			source: interactiveSource,
			title: '按下状态'
		}
	],
	accessibility: [
		'使用真实button并通过aria-pressed公开双态语义。',
		'Enter和Space沿用原生button激活行为。',
		'disabled使用原生属性并停止点击与状态变化。'
	]
});
