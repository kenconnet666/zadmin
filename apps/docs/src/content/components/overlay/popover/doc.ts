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
import DismissAriaDemo from './DismissAriaDemo.svelte';
import dismissAriaSource from './DismissAriaDemo.svelte?raw';
import NestedControlledDemo from './NestedControlledDemo.svelte';
import nestedControlledSource from './NestedControlledDemo.svelte?raw';
import { popoverApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const popoverDoc = defineComponentDoc(popoverMetadata, {
	members: [popoverTriggerMetadata, popoverContentMetadata],
	profiles: ['layer', 'animated'],
	sourceApi: popoverApiFacts,
	teaching: {
		props: {
			defaultOpen: { default: 'false', description: '非受控初始状态。' },
			gutter: { default: '8', description: '非负有限px间距。' },
			matchWidth: { default: 'false', description: 'Content最小inline尺寸匹配Trigger。' },
			modal: { default: 'false', description: '启用trap、scroll lock和inert；默认保持非modal。' },
			onOpenChange: { default: 'undefined', description: '真实用户toggle/dismiss后的通知。' },
			open: { default: 'undefined', description: 'Svelte bindable打开状态。' },
			placement: { default: "'bottom'", description: 'Floating首选逻辑位置，碰撞时自动调整。' },
			triggerId: {
				default: '自动生成',
				description: 'Trigger/Content稳定ARIA id；高级封装可覆盖。'
			}
		},
		summary:
			'元素Trigger上的modal/nonmodal浮层：Floating、nested branch、typed dismiss、显式ARIA和owner-realm Presence共享一个open owner。'
	},
	demos: [
		{
			component: InteractiveDemo,
			covers: ['basic-render', 'focus', 'keyboard', 'portal'],
			description: 'Trigger分支、Portal、碰撞定位、focus与顶层dismiss共享同一open合同。',
			id: 'popover-interactive',
			source: interactiveSource,
			title: '定位与关闭'
		},
		{
			component: FocusDemo,
			covers: ['focus', 'keyboard', 'native-props'],
			description: 'initialFocus显式选择首个编辑字段，关闭后恢复Trigger。',
			id: 'popover-focus',
			source: focusSource,
			title: '初始焦点策略'
		},
		{
			component: ModalDemo,
			covers: ['focus', 'portal', 'variants-and-states'],
			description:
				'modal模式启用焦点陷阱、scroll lock与外部inert，matchWidth同步Trigger和Content宽度。',
			id: 'popover-modal-match-width',
			source: modalSource,
			title: '模态与等宽定位'
		},
		{
			component: NestedControlledDemo,
			covers: ['composition', 'controlled', 'external-clear', 'keyboard'],
			description: '外部owner、nested branch、trigger replacement与逐层Escape使用同一Layer图。',
			id: 'popover-nested-controlled',
			source: nestedControlledSource,
			title: '受控状态与嵌套Branch'
		},
		{
			component: DismissAriaDemo,
			covers: ['accessible-name', 'controlled', 'focus', 'native-props'],
			description: '显式aria-label、可取消Escape/pointer outside与自定义restore target保持正交。',
			id: 'popover-dismiss-aria',
			source: dismissAriaSource,
			title: '显式ARIA、Dismiss与恢复焦点'
		}
	],
	accessibility: [
		'Trigger使用aria-haspopup=dialog、aria-expanded与aria-controls。',
		'Content使用dialog与aria-labelledby，打开后聚焦首个可操作元素。',
		'Escape、外部pointer和focus只关闭LayerStack最顶层，并恢复Trigger焦点。',
		'onEscape、onPointerOutside与onFocusOutside收到typed可取消事件，nested adapter可在不复制document监听器的前提下协调父层。',
		'Presence计时、Floating observers、FocusScope和dismiss branch全部使用当前Content/Trigger owner realm并在替换或卸载时清理。',
		'Popover只接受真实元素Trigger；不采用任意asChild、虚拟坐标ContextMenu或Tooltip hover intent。',
		'参考React Aria/MUI/Ant/Naive Popover定位与焦点原则，继续复用现有LayerManager。'
	]
});
