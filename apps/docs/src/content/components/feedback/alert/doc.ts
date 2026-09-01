import { alertMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import TonesDemo from './TonesDemo.svelte';
import tonesSource from './TonesDemo.svelte?raw';
import CustomDemo from './CustomDemo.svelte';
import customSource from './CustomDemo.svelte?raw';
import DynamicDemo from './DynamicDemo.svelte';
import dynamicSource from './DynamicDemo.svelte?raw';
import HighContrastDemo from './HighContrastDemo.svelte';
import highContrastSource from './HighContrastDemo.svelte?raw';
import { alertApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const alertDoc = defineComponentDoc(alertMetadata, {
	profiles: ['primitive'],
	sourceApi: alertApiFacts,
	teaching: {
		props: {
			action: {
				default: 'undefined',
				description: '真实ZButton/ZLink等操作；不会让整条Alert可点击，也不会自动关闭。'
			},
			children: { default: 'undefined', description: '标题后的持久正文。' },
			dismissible: {
				default: 'false',
				description: '仅展示关闭按钮；是否移除仍由调用方响应onDismiss。'
			},
			dismissLabel: {
				default: 'localePack.feedback.dismissAlert',
				description: 'typed locale默认值；同页多条Alert应传入包含上下文的名称。'
			},
			live: {
				default: 'polite',
				description: 'off用于首屏静态内容；polite用于普通动态状态；assertive仅用于紧急动态失败。'
			},
			onDismiss: {
				description: '关闭请求回调；组件不持有visible状态，也不做自动消失动画。'
			},
			title: { default: '必填', description: '稳定、简短且能独立理解的字符串标题。' },
			tone: {
				default: 'info',
				description: 'info/success/warning/danger同时驱动边框和非颜色Lucide图标。'
			}
		},
		summary:
			'Alert是页面内持久、非阻塞反馈：统一tone、title/body/action/dismiss和显式live；Toast负责短暂队列通知，AlertDialog负责中断式确认。'
	},
	demos: [
		{
			component: FormDemo,
			covers: ['accessible-name', 'controlled', 'keyboard'],
			description: '关闭只发送动作，是否移除由调用方持有。',
			id: 'alert-live',
			source,
			title: '行内反馈'
		},
		{
			component: TonesDemo,
			covers: ['native-props', 'variants-and-states'],
			description: '四种语义tone与live优先级分别表达静态、礼貌和紧急反馈。',
			id: 'alert-tones',
			source: tonesSource,
			title: '语义与Live优先级'
		},
		{
			component: DynamicDemo,
			covers: ['controlled', 'focus', 'keyboard', 'variants-and-states'],
			description: '动态插入polite/assertive消息并保持触发控件焦点；移除由页面owner决定。',
			id: 'alert-dynamic-insertion',
			source: dynamicSource,
			title: '动态插入与焦点保持'
		},
		{
			component: CustomDemo,
			covers: ['composition', 'native-props', 'variants-and-states'],
			description: '自定义或隐藏decorative图标，并以真实ZLink/ZButton组合长正文和操作。',
			id: 'alert-custom-composition',
			source: customSource,
			title: '自定义图标、长内容与Action'
		},
		{
			component: HighContrastDemo,
			covers: ['accessible-name', 'composition', 'rtl', 'variants-and-states'],
			description: '高对比与RTL仍使用逻辑布局、边框和Lucide图标表达状态。',
			id: 'alert-high-contrast-rtl',
			source: highContrastSource,
			title: '高对比与RTL'
		}
	],
	accessibility: [
		'polite映射role=status，assertive映射role=alert；WAI-ARIA Alert只用于重要动态消息且不移动焦点。',
		'live=off用于页面首屏已有的静态说明；频繁更新或自动消失的队列消息使用Toast，不在Alert复制计时与堆叠。',
		'默认Lucide图标aria-hidden并与tone边框共同表达状态，高对比模式不只依赖背景色；自定义icon同样是decorative。',
		'action中的真实控件保留Tab顺序；Alert根、标题和正文不获取焦点，不承担AlertDialog的中断职责。',
		'默认关闭名称来自Provider localePack.feedback.dismissAlert；同页存在多个Alert时应显式提供包含消息上下文的dismissLabel。',
		'参考Ant Design的title/description/action/closable分区与MUI的severity/icon/action边界；保留显式live并拒绝内部visible、自动消失和ErrorBoundary。'
	],
	keywords: ['alert', 'status', 'live region', 'feedback', 'dismiss', 'high contrast']
});
