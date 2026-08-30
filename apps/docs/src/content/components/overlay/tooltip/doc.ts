import {
	tooltipContentMetadata,
	tooltipMetadata,
	tooltipTriggerMetadata
} from '@zadmin/zui/metadata';
import InteractiveDemo from './InteractiveDemo.svelte';
import interactiveSource from './InteractiveDemo.svelte?raw';
import PlacementsDemo from './PlacementsDemo.svelte';
import placementsSource from './PlacementsDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const tooltipDoc = defineComponentDoc(tooltipMetadata, {
	members: [tooltipTriggerMetadata, tooltipContentMetadata],
	demos: [
		{
			component: InteractiveDemo,
			description: 'hover和focus共享延迟状态，Content保持非交互并通过Portal定位。',
			id: 'tooltip-interactive',
			source: interactiveSource,
			title: '延迟提示'
		},
		{
			component: PlacementsDemo,
			description: '四个主要位置使用同一hover/focus状态与碰撞定位。',
			id: 'tooltip-placements',
			source: placementsSource,
			title: '位置与即时显示'
		}
	],
	accessibility: [
		'Trigger仅在打开期间使用aria-describedby关联tooltip。',
		'focus和hover都能显示提示，Escape立即关闭且不移动Trigger焦点。',
		'Content使用role=tooltip和pointer-events:none，不承载可交互内容。'
	]
});
