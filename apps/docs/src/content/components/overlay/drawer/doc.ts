import {
	drawerCloseMetadata,
	drawerContentMetadata,
	drawerDescriptionMetadata,
	drawerMetadata,
	drawerOverlayMetadata,
	drawerTitleMetadata,
	drawerTriggerMetadata
} from '@zadmin/zui/metadata';
import InteractiveDemo from './InteractiveDemo.svelte';
import interactiveSource from './InteractiveDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const drawerDoc = defineComponentDoc(drawerMetadata, {
	members: [
		drawerTriggerMetadata,
		drawerOverlayMetadata,
		drawerContentMetadata,
		drawerTitleMetadata,
		drawerDescriptionMetadata,
		drawerCloseMetadata
	],
	demos: [
		{
			component: InteractiveDemo,
			description: '同一modal合同支持top、bottom及随文字方向翻转的start、end面板。',
			id: 'drawer-logical-placement',
			source: interactiveSource,
			title: '逻辑方向与尺寸'
		}
	],
	accessibility: [
		'Content沿用dialog与aria-modal、稳定Title/Description关系、焦点循环、scroll lock和inert。',
		'start/end使用CSS逻辑属性并随Provider direction翻转；top/bottom不受文字方向影响。',
		'当前生产合同聚焦键盘、pointer和Presence生命周期；触摸拖拽手势留待独立输入模型验证后加入。'
	]
});
