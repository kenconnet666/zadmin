import {
	dropdownMenuContentMetadata,
	dropdownMenuMetadata,
	dropdownMenuTriggerMetadata
} from '@zadmin/zui/metadata';
import ControlledDemo from './ControlledDemo.svelte';
import controlledSource from './ControlledDemo.svelte?raw';
import InteractiveDemo from './InteractiveDemo.svelte';
import interactiveSource from './InteractiveDemo.svelte?raw';
import SelectionDemo from './SelectionDemo.svelte';
import selectionSource from './SelectionDemo.svelte?raw';
import StatesDemo from './StatesDemo.svelte';
import statesSource from './StatesDemo.svelte?raw';
import SubmenuDemo from './SubmenuDemo.svelte';
import submenuSource from './SubmenuDemo.svelte?raw';
import { dropdownMenuApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const dropdownMenuDoc = defineComponentDoc(dropdownMenuMetadata, {
	members: [dropdownMenuTriggerMetadata, dropdownMenuContentMetadata],
	profiles: ['collection', 'layer', 'animated'],
	sourceApi: dropdownMenuApiFacts,
	teaching: {
		summary:
			'Popover唯一拥有controlled open、Portal、Floating、dismiss、Presence与焦点恢复；Content只接入共享ZMenu及未取消action后的关闭策略。'
	},
	demos: [
		{
			covers: ['basic-render', 'focus', 'full-motion', 'keyboard', 'portal'],
			component: InteractiveDemo,
			description:
				'Popover负责定位、Portal、dismiss和焦点恢复；ZMenu负责logical集合、typeahead与action。',
			id: 'dropdown-menu-actions',
			source: interactiveSource,
			title: '定位菜单操作'
		},
		{
			covers: ['disabled', 'keyboard', 'variants-and-states'],
			component: StatesDemo,
			description: 'top-end定位、非循环导航与禁用项继续复用Menu集合；ArrowUp可从末项进入。',
			id: 'dropdown-menu-states',
			source: statesSource,
			title: '定位与导航边界'
		},
		{
			covers: ['controlled', 'keyboard', 'uncontrolled', 'variants-and-states'],
			component: SelectionDemo,
			description: 'checkbox/radio选择项默认不关闭Menu，并保持受控与非受控状态边界。',
			id: 'dropdown-menu-selection',
			source: selectionSource,
			title: '选择Item'
		},
		{
			covers: ['focus', 'keyboard', 'portal', 'resource-cleanup', 'rtl'],
			component: SubmenuDemo,
			description:
				'nested Popup只让顶层Layer处理outside/Escape，action穿过父链后一次关闭并恢复Trigger焦点。',
			id: 'dropdown-menu-submenu',
			source: submenuSource,
			title: 'Nested Submenu'
		},
		{
			covers: ['controlled', 'native-props', 'reduced-motion', 'resource-cleanup'],
			component: ControlledDemo,
			description:
				'bind:open与onOpenChange共享Popover唯一状态owner；真实anchor link仍走可取消action协议。',
			id: 'dropdown-menu-controlled',
			source: controlledSource,
			title: '受控Open与Link'
		}
	],
	accessibility: [
		'Trigger是类型明确的真实button引用，使用aria-haspopup=menu、expanded和controls；Menu由Trigger稳定id命名。',
		'Enter/Space沿用button语义；ArrowDown/ArrowUp分别打开并聚焦第一个/最后一个enabled Item。',
		'选择未被preventDefault且closeOnSelect=true的Item后dismiss；Checkbox/Radio默认保持打开。',
		'Escape与outside pointer只由顶层DismissableLayer消费，关闭后FocusScope恢复当前真实Trigger而不是缓存selector。',
		'动画、reduced-motion、viewport collision与RTL submenu定位均复用Popover/Floating，不在Dropdown Menu复制实现。'
	],
	keywords: [
		'dropdown menu',
		'menu button',
		'submenu',
		'controlled open',
		'focus restore',
		'floating'
	]
});
