import {
	drawerCloseMetadata,
	drawerContentMetadata,
	drawerDescriptionMetadata,
	drawerMetadata,
	drawerOverlayMetadata,
	drawerTitleMetadata,
	drawerTriggerMetadata
} from '@zadmin/zui/metadata';
import DismissPolicyDemo from './DismissPolicyDemo.svelte';
import dismissPolicySource from './DismissPolicyDemo.svelte?raw';
import InteractiveDemo from './InteractiveDemo.svelte';
import interactiveSource from './InteractiveDemo.svelte?raw';
import NestedDemo from './NestedDemo.svelte';
import nestedSource from './NestedDemo.svelte?raw';
import PreferencesDemo from './PreferencesDemo.svelte';
import preferencesSource from './PreferencesDemo.svelte?raw';
import SizesDemo from './SizesDemo.svelte';
import sizesSource from './SizesDemo.svelte?raw';
import { drawerApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const drawerDoc = defineComponentDoc(drawerMetadata, {
	profiles: ['layer', 'animated'],
	sourceApi: drawerApiFacts,
	teaching: {
		summary:
			'复用Dialog的modal生命周期，提供四个逻辑方向、主题预设与CSS尺寸、窄屏边界和完整动画偏好。'
	},
	members: [
		drawerTriggerMetadata,
		drawerOverlayMetadata,
		drawerContentMetadata,
		drawerTitleMetadata,
		drawerDescriptionMetadata,
		drawerCloseMetadata
	],
	demos: [
		{
			covers: ['basic-render', 'controlled', 'focus', 'keyboard', 'portal'],
			component: InteractiveDemo,
			description: '同一modal合同支持top、bottom及随文字方向翻转的start、end面板。',
			id: 'drawer-logical-placement',
			source: interactiveSource,
			title: '逻辑方向与尺寸'
		},
		{
			covers: ['composition', 'ssr', 'uncontrolled', 'variants-and-states'],
			component: SizesDemo,
			description:
				'主题预设、number/string CSS尺寸和full viewport模式共享同一响应边界与Dialog内核。',
			id: 'drawer-sizes',
			source: sizesSource,
			title: '预设、自定义与全屏尺寸'
		},
		{
			covers: ['focus', 'keyboard', 'portal', 'resource-cleanup'],
			component: NestedDemo,
			description: '嵌套Drawer复用LayerStack、FocusScope和滚动锁引用计数，逐层恢复焦点。',
			id: 'drawer-nested',
			source: nestedSource,
			title: '嵌套层与焦点恢复'
		},
		{
			covers: ['full-motion', 'reduced-motion', 'rtl', 'variants-and-states'],
			component: PreferencesDemo,
			description:
				'逻辑start/end随direction翻转；auto、full与reduced由Dialog中的单一偏好owner解析。',
			id: 'drawer-preferences',
			source: preferencesSource,
			title: 'RTL与动画偏好'
		},
		{
			covers: ['keyboard', 'resource-cleanup', 'variants-and-states'],
			component: DismissPolicyDemo,
			description: '默认支持Escape与遮罩关闭；重要流程可分别禁用两种隐式dismiss。',
			id: 'drawer-dismiss-policy',
			source: dismissPolicySource,
			title: '关闭策略'
		}
	],
	accessibility: [
		'Content沿用dialog与aria-modal、稳定Title/Description关系、焦点循环、scroll lock和inert。',
		'start/end使用CSS逻辑属性并随Provider direction翻转；top/bottom不受文字方向影响。',
		'auto跟随prefers-reduced-motion，full显式保留动画，reduced立即完成Presence退出。',
		'modal语义固定焦点陷阱与body scroll lock；persistent/permanent侧栏属于Layout，不混入Drawer。',
		'触摸滑动、可拖拽尺寸与Ant式push没有跨输入设备的稳定需求，留待独立交互模型验证后加入。'
	]
});
