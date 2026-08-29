import {
	popoverContentMetadata,
	popoverMetadata,
	popoverTriggerMetadata
} from '@zadmin/zui/metadata';
import InteractiveDemo from './InteractiveDemo.svelte';
import interactiveSource from './InteractiveDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const popoverDoc = defineComponentDoc(popoverMetadata, {
	members: [popoverTriggerMetadata, popoverContentMetadata],
	demos: [
		{
			component: InteractiveDemo,
			description: 'Trigger分支、Portal、碰撞定位、focus与顶层dismiss共享同一open合同。',
			id: 'popover-interactive',
			source: interactiveSource,
			title: '定位与关闭'
		}
	],
	accessibility: [
		'Trigger使用aria-haspopup=dialog、aria-expanded与aria-controls。',
		'Content使用dialog与aria-labelledby，打开后聚焦首个可操作元素。',
		'Escape、外部pointer和focus只关闭LayerStack最顶层，并恢复Trigger焦点。'
	]
});
