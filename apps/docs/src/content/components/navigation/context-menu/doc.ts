import {
	contextMenuContentMetadata,
	contextMenuMetadata,
	contextMenuTriggerMetadata
} from '@zadmin/zui/metadata';
import ControlledRtlDemo from './ControlledRtlDemo.svelte';
import controlledRtlSource from './ControlledRtlDemo.svelte?raw';
import InteractiveDemo from './InteractiveDemo.svelte';
import interactiveSource from './InteractiveDemo.svelte?raw';
import SelectionDemo from './SelectionDemo.svelte';
import selectionSource from './SelectionDemo.svelte?raw';
import StatesDemo from './StatesDemo.svelte';
import statesSource from './StatesDemo.svelte?raw';
import SubmenuDemo from './SubmenuDemo.svelte';
import submenuSource from './SubmenuDemo.svelte?raw';
import { contextMenuApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const contextMenuDoc = defineComponentDoc(contextMenuMetadata, {
	members: [contextMenuTriggerMetadata, contextMenuContentMetadata],
	profiles: ['collection', 'layer', 'animated'],
	sourceApi: contextMenuApiFacts,
	teaching: {
		summary:
			'真实pointer client坐标与键盘目标logical start只负责更新零尺寸锚点，Popup生命周期继续由Popover唯一拥有，内容完整复用ZMenu。'
	},
	demos: [
		{
			covers: ['accessible-name', 'focus', 'full-motion', 'keyboard', 'portal'],
			component: InteractiveDemo,
			description: 'pointer使用client坐标锚点；ContextMenu键和Shift+F10使用目标逻辑起点。',
			id: 'context-menu-coordinate-anchor',
			source: interactiveSource,
			title: '指针与键盘锚点'
		},
		{
			covers: ['disabled', 'keyboard', 'variants-and-states'],
			component: StatesDemo,
			description: '非循环导航、disabled动作和可访问名称覆盖只读上下文菜单。',
			id: 'context-menu-states',
			source: statesSource,
			title: '只读菜单与导航边界'
		},
		{
			covers: ['controlled', 'keyboard', 'uncontrolled', 'variants-and-states'],
			component: SelectionDemo,
			description: 'checkbox与radio Item在上下文菜单中保持打开，状态更新仍可受控。',
			id: 'context-menu-selection',
			source: selectionSource,
			title: '上下文选择Item'
		},
		{
			covers: ['focus', 'keyboard', 'portal', 'resource-cleanup'],
			component: SubmenuDemo,
			description:
				'pointer或键盘打开后可进入nested submenu，动作通过一条父链关闭并恢复原始上下文目标。',
			id: 'context-menu-submenu',
			source: submenuSource,
			title: 'Nested Submenu'
		},
		{
			covers: ['controlled', 'reduced-motion', 'resource-cleanup', 'rtl'],
			component: ControlledRtlDemo,
			description:
				'RTL键盘锚点使用目标logical start；bind:open、外部关闭、Presence与focus restore保持同一状态生命周期。',
			id: 'context-menu-controlled-rtl',
			source: controlledRtlSource,
			title: '受控Open与RTL'
		}
	],
	accessibility: [
		'Trigger区域默认可聚焦并声明haspopup=menu、controls、expanded和aria-keyshortcuts="ContextMenu Shift+F10"；两种键盘手势都能完整进入。',
		'pointer打开时先聚焦真实目标，再以client坐标更新锚点；action、Escape或outside dismiss后不会把焦点恢复到零尺寸span。',
		'键盘锚点取目标logical start：LTR为left，RTL为right；坐标只作为运行时定位数据，不进入Theme。',
		'Submenu、selection Item、可取消action、locale typeahead和disabled导航由ZMenu单一实现维护。',
		'当前不加入touch long-press：它需要真实移动端产品需求来决定阈值、滚动冲突、触觉反馈与取消合同，不能用一个通用timer冒充生产能力。'
	],
	keywords: ['context menu', 'right click', 'Shift F10', 'pointer coordinates', 'submenu', 'RTL']
});
