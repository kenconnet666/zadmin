import {
	dropdownMenuContentMetadata,
	dropdownMenuMetadata,
	dropdownMenuTriggerMetadata
} from '@zadmin/zui/metadata';
import InteractiveDemo from './InteractiveDemo.svelte';
import interactiveSource from './InteractiveDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const dropdownMenuDoc = defineComponentDoc(dropdownMenuMetadata, {
	members: [dropdownMenuTriggerMetadata, dropdownMenuContentMetadata],
	demos: [
		{
			component: InteractiveDemo,
			description:
				'Popover负责定位、Portal、dismiss和焦点恢复；ZMenu负责集合导航、typeahead与action。',
			id: 'dropdown-menu-actions',
			source: interactiveSource,
			title: '定位菜单操作'
		}
	],
	accessibility: [
		'Trigger使用aria-haspopup=menu、expanded和controls；Menu由Trigger稳定id标记。',
		'打开后焦点进入第一个enabled Item；选择未被preventDefault的Item后dismiss并恢复Trigger焦点。',
		'Escape与outside pointer安全dismiss；Menu键盘合同由ZMenu单一实现维护。'
	]
});
