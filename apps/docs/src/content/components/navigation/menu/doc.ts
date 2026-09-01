import {
	menuCheckboxItemMetadata,
	menuGroupMetadata,
	menuItemMetadata,
	menuLabelMetadata,
	menuMetadata,
	menuRadioGroupMetadata,
	menuRadioItemMetadata,
	menuSeparatorMetadata,
	menuSubContentMetadata,
	menuSubMetadata,
	menuSubTriggerMetadata
} from '@zadmin/zui/metadata';
import InteractiveDemo from './InteractiveDemo.svelte';
import interactiveSource from './InteractiveDemo.svelte?raw';
import BoundariesDemo from './BoundariesDemo.svelte';
import boundariesSource from './BoundariesDemo.svelte?raw';
import DynamicLinkDemo from './DynamicLinkDemo.svelte';
import dynamicLinkSource from './DynamicLinkDemo.svelte?raw';
import SelectionDemo from './SelectionDemo.svelte';
import selectionSource from './SelectionDemo.svelte?raw';
import SubmenuDemo from './SubmenuDemo.svelte';
import submenuSource from './SubmenuDemo.svelte?raw';
import { menuApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const menuDoc = defineComponentDoc(menuMetadata, {
	members: [
		menuGroupMetadata,
		menuLabelMetadata,
		menuItemMetadata,
		menuCheckboxItemMetadata,
		menuRadioGroupMetadata,
		menuRadioItemMetadata,
		menuSeparatorMetadata,
		menuSubMetadata,
		menuSubTriggerMetadata,
		menuSubContentMetadata
	],
	profiles: ['collection'],
	sourceApi: menuApiFacts,
	teaching: {
		summary:
			'LogicalCollection拥有typed顺序、禁用与typeahead文本，MountedElements仅把当前挂载节点接到roving focus；action、selection与nested submenu共用同一事件链。'
	},
	demos: [
		{
			covers: ['accessible-name', 'basic-render', 'disabled', 'keyboard'],
			component: InteractiveDemo,
			description:
				'LogicalCollection与MountedElements统一驱动roving focus、disabled跳过、Home/End和locale-reactive typeahead。',
			id: 'menu-collection-navigation',
			source: interactiveSource,
			title: '集合导航与Action'
		},
		{
			covers: ['keyboard', 'variants-and-states'],
			component: BoundariesDemo,
			description: 'loop=false夹紧首尾，可取消action阻止消费方状态与Popup dismiss。',
			id: 'menu-boundaries',
			source: boundariesSource,
			title: '导航边界与动作拦截'
		},
		{
			covers: ['controlled', 'keyboard', 'uncontrolled', 'variants-and-states'],
			component: SelectionDemo,
			description:
				'menuitemcheckbox支持mixed/受控/非受控切换；radio group保持string 1和number 1不同，并默认保持Menu打开。',
			id: 'menu-selection-items',
			source: selectionSource,
			title: 'Checkbox与Radio Item'
		},
		{
			covers: ['focus', 'keyboard', 'portal', 'resource-cleanup', 'rtl'],
			component: SubmenuDemo,
			description:
				'多级submenu独立拥有集合与FocusScope，通过父action链冒泡；同级开关、顶层Layer、逻辑方向键和焦点恢复保持一致。',
			id: 'menu-submenu',
			source: submenuSource,
			title: '多级Submenu'
		},
		{
			covers: ['composition', 'focus', 'keyboard', 'native-props'],
			component: DynamicLinkDemo,
			description:
				'动态移除当前项后按旧logical位置恢复nearest focus；链接渲染真实anchor，shortcut用ZKbd呈现。',
			id: 'menu-dynamic-link',
			source: dynamicLinkSource,
			title: '动态集合、Link与Shortcut'
		}
	],
	accessibility: [
		'Root使用menu与垂直方向语义；Item使用APG允许的roving tabindex真实DOM焦点，只有一个enabled Item进入复合组件焦点序列。',
		'ArrowUp/ArrowDown、Home/End和可打印字符按完整logical顺序移动，disabled Item跳过；Provider locale变化会重建Collator并清空旧typeahead buffer。',
		'Checkbox与Radio分别投射menuitemcheckbox/menuitemradio和aria-checked；选择默认不关闭Popup，action Item和link默认关闭。',
		'SubTrigger声明haspopup/expanded/controls；逻辑前进键进入、反向键返回，RTL只翻转层级方向而不改变垂直顺序。',
		'MenuActionEvent在Item、nested Menu与Popup owner之间只创建一次；任一层preventDefault都会阻止后续action、selection、link导航与dismiss。',
		'当前没有真实超大菜单或触摸长按需求，因此不为数量实现virtual menu或long-press计时器；长集合应先使用搜索/Command或重新分组。'
	],
	keywords: [
		'menu',
		'submenu',
		'checkbox item',
		'radio item',
		'link item',
		'roving focus',
		'typeahead'
	]
});
