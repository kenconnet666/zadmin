import { toastMetadata, toasterMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import LifecycleDemo from './LifecycleDemo.svelte';
import lifecycleSource from './LifecycleDemo.svelte?raw';
import TonesDemo from './TonesDemo.svelte';
import tonesSource from './TonesDemo.svelte?raw';
import { toastApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const toastDoc = defineComponentDoc(toastMetadata, {
	members: [toasterMetadata],
	profiles: ['animated', 'layer', 'service'],
	sourceApi: toastApiFacts,
	teaching: {
		props: {
			actionLabel: {
				default: 'undefined',
				description: '可选单一操作文案；复杂操作集合应改用Dialog或页面内反馈。'
			},
			description: { default: 'undefined', description: '简短补充说明，不重复标题。' },
			dismissLabel: {
				default: "'Dismiss notification'",
				description: '独立Toast关闭按钮的可访问名称；队列默认结合标题生成。'
			},
			dismissible: {
				default: 'true',
				description: '展示关闭按钮；持久消息应保持可关闭、可操作或可被程序清理。'
			},
			onPauseChange: {
				description: '向所属Queue报告hover和focus暂停原因；独立渲染时可自行消费。'
			}
		},
		summary:
			'提供独立live-region消息与显式Queue/Toaster服务，在Provider边界内完成公平入场、暂停、操作和Presence退出。'
	},
	demos: [
		{
			covers: ['basic-render', 'portal', 'resource-cleanup'],
			component: FormDemo,
			description: '显式队列驱动消息、操作、关闭与持久时长。',
			id: 'toast-queue',
			source,
			title: '通知队列'
		},
		{
			covers: ['accessible-name', 'basic-render', 'variants-and-states'],
			component: TonesDemo,
			description: '独立Toast展示不同tone与公告优先级，队列不是渲染的前置条件。',
			id: 'toast-tones',
			source: tonesSource,
			title: '独立Toast语义'
		},
		{
			covers: ['full-motion', 'portal', 'resource-cleanup'],
			component: LifecycleDemo,
			description: '验证FIFO容量、稳定id更新、操作清理、定时消息和显式队列状态。',
			id: 'toast-lifecycle',
			source: lifecycleSource,
			title: '生产生命周期与公平排队'
		}
	],
	accessibility: [
		'polite Toast使用role=status，danger默认使用assertive alert；不要把普通成功消息升级为assertive。',
		'鼠标悬停、键盘焦点与页面隐藏分别暂停剩余时长，所有原因恢复后才继续计时。',
		'maxVisible控制实际入场容量；排队消息没有计时器，前一条完成Presence退出后才按FIFO进入，动态缩容会把最新的超额消息重新排队而不是dismiss。',
		'ZToaster默认Portal到当前Document，并继承ZProvider portalContainer以支持ShadowRoot或局部挂载边界。',
		'ZToaster不创建全局单例；一个Queue对应一个Toaster，应用显式持有Queue并在所属生命周期结束时dispose。',
		'持久Toast必须提供关闭按钮，操作完成后队列按action原因移除；同一id再次push会原位更新。'
	],
	keywords: ['toast', 'toaster', 'notification', 'live region', 'queue']
});
