import {
	contextMenuContentMetadata,
	contextMenuMetadata,
	contextMenuTriggerMetadata
} from '@zadmin/zui/metadata';
import InteractiveDemo from './InteractiveDemo.svelte';
import interactiveSource from './InteractiveDemo.svelte?raw';
import StatesDemo from './StatesDemo.svelte';
import statesSource from './StatesDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const contextMenuDoc = defineComponentDoc(contextMenuMetadata, {
	members: [contextMenuTriggerMetadata, contextMenuContentMetadata],
	demos: [
		{
			component: InteractiveDemo,
			description: 'pointer使用client坐标锚点；ContextMenu键和Shift+F10使用目标逻辑起点。',
			id: 'context-menu-coordinate-anchor',
			source: interactiveSource,
			title: '指针与键盘锚点'
		},
		{
			component: StatesDemo,
			description: '非循环导航和disabled动作覆盖只读上下文菜单。',
			id: 'context-menu-states',
			source: statesSource,
			title: '只读菜单与导航边界'
		}
	],
	accessibility: [
		'Trigger区域默认可聚焦并声明haspopup=menu；ContextMenu键与Shift+F10提供完整键盘入口。',
		'pointer打开时先聚焦目标区域，使action、Escape或outside dismiss后恢复到稳定目标。',
		'坐标仅作为运行时定位数据，不进入Theme；Menu语义和键盘导航仍由ZMenu统一拥有。'
	]
});
