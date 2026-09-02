import {
	dialogCloseMetadata,
	dialogContentMetadata,
	dialogDescriptionMetadata,
	dialogMetadata,
	dialogOverlayMetadata,
	dialogTitleMetadata,
	dialogTriggerMetadata
} from '@zadmin/zui/metadata';
import InteractiveDemo from './InteractiveDemo.svelte';
import interactiveSource from './InteractiveDemo.svelte?raw';
import NestedDemo from './NestedDemo.svelte';
import nestedSource from './NestedDemo.svelte?raw';
import AriaDemo from './AriaDemo.svelte';
import ariaSource from './AriaDemo.svelte?raw';
import DismissDemo from './DismissDemo.svelte';
import dismissSource from './DismissDemo.svelte?raw';
import FocusPolicyDemo from './FocusPolicyDemo.svelte';
import focusPolicySource from './FocusPolicyDemo.svelte?raw';
import { dialogApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const dialogDoc = defineComponentDoc(dialogMetadata, {
	members: [
		dialogTriggerMetadata,
		dialogOverlayMetadata,
		dialogContentMetadata,
		dialogTitleMetadata,
		dialogDescriptionMetadata,
		dialogCloseMetadata
	],
	profiles: ['layer', 'animated'],
	sourceApi: dialogApiFacts,
	teaching: {
		props: {
			defaultOpen: { default: 'false', description: '非受控modal初始状态。' },
			onOpenChange: {
				default: 'undefined',
				description: '真实用户打开/关闭后调用；外部同步不伪造回调。'
			},
			open: { default: 'undefined', description: 'Svelte bindable modal状态。' }
		},
		summary:
			'modal-only Dialog根，统一Portal/Layer/Presence；Content拥有真实ARIA引用、typed outside事件与initial/restore焦点策略。'
	},
	demos: [
		{
			component: InteractiveDemo,
			covers: ['basic-render', 'focus', 'keyboard', 'portal', 'resource-cleanup'],
			description:
				'modal Layer统一管理Portal、焦点循环、scroll lock、inert、outside dismiss和Presence。',
			id: 'dialog-interactive',
			source: interactiveSource,
			title: 'Modal生命周期'
		},
		{
			component: NestedDemo,
			covers: ['composition', 'focus', 'keyboard', 'portal'],
			description: '嵌套Dialog验证顶层Escape所有权、独立FocusScope和逐层焦点恢复。',
			id: 'dialog-nested',
			source: nestedSource,
			title: '嵌套层与焦点恢复'
		},
		{
			component: FocusPolicyDemo,
			covers: ['controlled', 'focus', 'keyboard', 'native-props'],
			description: 'initialFocus、restoreFocus和restoreTarget直接配置FocusScope，不复制焦点实现。',
			id: 'dialog-focus-policy',
			source: focusPolicySource,
			title: '初始与恢复焦点策略'
		},
		{
			component: AriaDemo,
			covers: ['accessible-name', 'native-props', 'ssr'],
			description: 'Title提供SSR稳定关联；Description只在真实挂载时关联，无Title时显式ariaLabel。',
			id: 'dialog-aria-contract',
			source: ariaSource,
			title: 'Title、Description与显式ARIA'
		},
		{
			component: DismissDemo,
			covers: ['controlled', 'keyboard', 'variants-and-states'],
			description:
				'typed Escape/pointer outside事件可preventDefault；显式Close仍保留原生按钮路径。',
			id: 'dialog-dismissible-events',
			source: dismissSource,
			title: '可取消Dismiss事件'
		}
	],
	accessibility: [
		'Content使用dialog与aria-modal；Title提供稳定名称，Description按实际说明内容选择性关联。',
		'Tab/Shift+Tab在最顶层Dialog循环，Escape或Overlay pointer关闭并恢复Trigger焦点。',
		'打开期间锁定滚动并inert Portal容器中的其他兄弟；嵌套资源使用引用计数恢复。',
		'Dialog保持modal-only；非模态浮层使用Popover role=dialog，避免两套outside-focus合同。',
		'默认Title id在SSR稳定；Description仅在真实注册或显式ariaDescribedBy时输出，不制造悬空引用。',
		'参考WAI-ARIA/React Aria、MUI/Ant/Naive modal焦点与命名原则；不采用任意asChild或重写LayerManager。'
	]
});
