import {
	menuGroupMetadata,
	menuItemMetadata,
	menuLabelMetadata,
	menuMetadata,
	menuSeparatorMetadata
} from '@zadmin/zui/metadata';
import InteractiveDemo from './InteractiveDemo.svelte';
import interactiveSource from './InteractiveDemo.svelte?raw';
import BoundariesDemo from './BoundariesDemo.svelte';
import boundariesSource from './BoundariesDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const menuDoc = defineComponentDoc(menuMetadata, {
	members: [menuGroupMetadata, menuLabelMetadata, menuItemMetadata, menuSeparatorMetadata],
	demos: [
		{
			component: InteractiveDemo,
			description:
				'DOM顺序Collection统一驱动roving focus、disabled跳过、Home/End和本地化typeahead。',
			id: 'menu-collection-navigation',
			source: interactiveSource,
			title: '集合导航与Action'
		},
		{
			component: BoundariesDemo,
			description: 'loop=false夹紧首尾，可取消action阻止消费方状态变化。',
			id: 'menu-boundaries',
			source: boundariesSource,
			title: '导航边界与动作拦截'
		}
	],
	accessibility: [
		'Root使用menu与垂直方向语义；Item使用menuitem，并以roving tabindex保证只有一个enabled Item进入Tab序列。',
		'ArrowUp/ArrowDown、Home/End和可打印字符按DOM顺序移动焦点，disabled Item始终跳过。',
		'MenuActionEvent可由Item onSelect同步preventDefault；Popup封装据此决定是否dismiss。'
	]
});
