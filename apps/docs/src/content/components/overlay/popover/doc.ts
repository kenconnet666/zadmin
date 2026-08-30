import {
	popoverContentMetadata,
	popoverMetadata,
	popoverTriggerMetadata
} from '@zadmin/zui/metadata';
import InteractiveDemo from './InteractiveDemo.svelte';
import interactiveSource from './InteractiveDemo.svelte?raw';
import FocusDemo from './FocusDemo.svelte';
import focusSource from './FocusDemo.svelte?raw';
import ModalDemo from './ModalDemo.svelte';
import modalSource from './ModalDemo.svelte?raw';
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
		},
		{
			component: FocusDemo,
			description: 'initialFocus显式选择首个编辑字段，关闭后恢复Trigger。',
			id: 'popover-focus',
			source: focusSource,
			title: '初始焦点策略'
		},
		{
			component: ModalDemo,
			description:
				'modal模式启用焦点陷阱、scroll lock与外部inert，matchWidth同步Trigger和Content宽度。',
			id: 'popover-modal-match-width',
			source: modalSource,
			title: '模态与等宽定位'
		}
	],
	accessibility: [
		'Trigger使用aria-haspopup=dialog、aria-expanded与aria-controls。',
		'Content使用dialog与aria-labelledby，打开后聚焦首个可操作元素。',
		'Escape、外部pointer和focus只关闭LayerStack最顶层，并恢复Trigger焦点。'
	]
});
