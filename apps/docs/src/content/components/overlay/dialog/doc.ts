import {
	dialogCloseMetadata,
	dialogContentMetadata,
	dialogDescriptionMetadata,
	dialogMetadata,
	dialogOverlayMetadata,
	dialogTitleMetadata,
	dialogTriggerMetadata
} from '@zadmin/zui/metadata';
import InteractiveDemo from './InteractiveDemo.svelte';
import interactiveSource from './InteractiveDemo.svelte?raw';
import NestedDemo from './NestedDemo.svelte';
import nestedSource from './NestedDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const dialogDoc = defineComponentDoc(dialogMetadata, {
	members: [
		dialogTriggerMetadata,
		dialogOverlayMetadata,
		dialogContentMetadata,
		dialogTitleMetadata,
		dialogDescriptionMetadata,
		dialogCloseMetadata
	],
	demos: [
		{
			component: InteractiveDemo,
			description:
				'modal Layer统一管理Portal、焦点循环、scroll lock、inert、outside dismiss和Presence。',
			id: 'dialog-interactive',
			source: interactiveSource,
			title: 'Modal生命周期'
		},
		{
			component: NestedDemo,
			description: '嵌套Dialog验证顶层Escape所有权、独立FocusScope和逐层焦点恢复。',
			id: 'dialog-nested',
			source: nestedSource,
			title: '嵌套层与焦点恢复'
		}
	],
	accessibility: [
		'Content使用dialog与aria-modal，并要求Title和Description建立稳定可访问名称。',
		'Tab/Shift+Tab在最顶层Dialog循环，Escape或Overlay pointer关闭并恢复Trigger焦点。',
		'打开期间锁定滚动并inert Portal容器中的其他兄弟；嵌套资源使用引用计数恢复。'
	]
});
