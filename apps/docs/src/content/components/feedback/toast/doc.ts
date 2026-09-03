import { toastMetadata, toasterMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import LifecycleDemo from './LifecycleDemo.svelte';
import lifecycleSource from './LifecycleDemo.svelte?raw';
import TonesDemo from './TonesDemo.svelte';
import tonesSource from './TonesDemo.svelte?raw';
import UpdateDemo from './UpdateDemo.svelte';
import updateSource from './UpdateDemo.svelte?raw';
import TaskDemo from './TaskDemo.svelte';
import taskSource from './TaskDemo.svelte?raw';
import AnnouncementsDemo from './AnnouncementsDemo.svelte';
import announcementsSource from './AnnouncementsDemo.svelte?raw';
import { toastApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const toastDoc = defineComponentDoc(toastMetadata, {
	additionalApi: [
		{
			description:
				'ToastQueue由应用显式创建和持有；下列方法是调用方服务面，视口连接、暂停和Presence收尾由ZToaster内部协调。',
			id: 'toast-queue-service',
			rows: [
				{
					description:
						'返回冻结的connected、viewportCount、disposed与可选debugName快照，仅用于ownership诊断。',
					feature: 'service',
					name: 'diagnostics',
					type: 'Readonly<ToastQueueDiagnostics>'
				},
				{
					description: '创建或按同id完整替换Toast，并返回稳定id。',
					feature: 'service',
					name: 'push',
					type: '(options: ToastOptions) => string'
				},
				{
					description: '仅更新已有记录的显式字段；不存在时返回false且不创建消息。',
					feature: 'service',
					name: 'update',
					type: '(id: string, update: ToastUpdate) => boolean'
				},
				{
					description: '观察调用方Promise并以同一id迁移状态；返回Toast id，不包装原Promise。',
					feature: 'service',
					name: 'task',
					type: '<TResult, TError = unknown>(promise: PromiseLike<TResult>, options: ToastTaskOptions<TResult, TError>) => string'
				},
				{
					description: '按原因关闭单条记录；不存在或已经退出时为空操作。',
					feature: 'service',
					name: 'dismiss',
					type: '(id: string, reason?: ToastDismissReason) => void'
				},
				{
					description: '关闭并清空当前队列中的全部记录。',
					feature: 'service',
					name: 'clear',
					type: '() => void'
				},
				{
					description:
						'终止计时器、任务generation和连接资源；终态且幂等，之后创建、更新、配置或连接操作会fail-fast。',
					feature: 'service',
					name: 'dispose',
					type: '() => void'
				}
			],
			title: 'ToastQueue Service'
		}
	],
	members: [toasterMetadata],
	profiles: ['animated', 'layer', 'service'],
	sourceApi: toastApiFacts,
	teaching: {
		props: {
			announce: {
				default: 'true',
				description:
					'独立ZToast自行建立live语义；Queue内Toast由ZToaster集中公告，避免视觉更新重复朗读。'
			},
			actionLabel: {
				default: 'undefined',
				description: '可选单一操作文案；复杂操作集合应改用Dialog或页面内反馈。'
			},
			description: { default: 'undefined', description: '简短补充说明，不重复标题。' },
			dismissLabel: {
				default: 'localePack.feedback.dismissNotification',
				description: '独立Toast关闭按钮的可访问名称；队列默认用typed locale结合标题生成。'
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
			'ZToast负责单条通知内容与操作；ZToaster负责把调用方拥有的ToastQueue连接到viewport、live region和Presence。需要跨页面通知时由服务层持有Queue，需要局部反馈时直接渲染ZToast；组件不创建全局单例。'
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
		},
		{
			component: UpdateDemo,
			covers: ['controlled', 'portal', 'resource-cleanup', 'variants-and-states'],
			description:
				'update(id, partial)只修改显式字段；description、回调、阶段和已消耗的剩余计时不会被无关更新重置。',
			id: 'toast-partial-update',
			source: updateSource,
			title: '显式局部更新'
		},
		{
			component: TaskDemo,
			covers: ['controlled', 'loading', 'portal', 'resource-cleanup'],
			description:
				'task只观察调用方Promise并用同一id迁移loading/success/error；generation阻止旧任务迟到覆盖新任务。',
			id: 'toast-task',
			source: taskSource,
			title: '调用方拥有的异步Task'
		},
		{
			component: AnnouncementsDemo,
			covers: ['accessible-name', 'portal', 'resource-cleanup', 'variants-and-states'],
			description:
				'视觉列表和live region解耦：同实例更新不重复公告，连续assertive按序节流，普通success保持polite。',
			id: 'toast-announcements',
			source: announcementsSource,
			title: '公告去重与Assertive节流'
		}
	],
	accessibility: [
		'polite Toast使用role=status，danger默认使用assertive alert；不要把普通成功消息升级为assertive。',
		'鼠标悬停、键盘焦点与页面隐藏分别暂停剩余时长，所有原因恢复后才继续计时。',
		'maxVisible控制实际入场容量；排队消息没有计时器，前一条完成Presence退出后才按FIFO进入，动态缩容会把最新的超额消息重新排队而不是dismiss。',
		'ZToaster默认Portal到当前Document，并继承ZProvider portalContainer以支持ShadowRoot或局部挂载边界。',
		'ZToaster不创建全局单例；一个Queue对应一个Toaster，应用显式持有Queue并在所属生命周期结束时dispose。',
		'Queue由调用方拥有；替换时ZToaster先断开旧Queue再连接新Queue且不dispose任一实例。debugName与只读diagnostics用于诊断ownership；dispose是终态，迟到task结果不会复活记录。',
		'update只接受已有id并保留未提供字段与剩余计时；push负责创建或完整替换，避免“局部还是全量”依赖猜测。',
		'task返回Toast id但不替代原Promise；AbortController、catch、重试和业务结果继续由调用方拥有，generation只防止旧结果覆盖新状态。',
		'Queue内视觉Toast不直接承担live role；Toaster用独立polite/assertive区域公告新实例，同id更新不重复，连续assertive至少间隔一秒。',
		'持久Toast必须提供关闭按钮，操作完成后队列按action原因移除；普通success默认polite，只有danger/error默认assertive。',
		'参考取舍：采用React Aria的队列所有权与pause原则、Radix的前景/背景敏感度、Sonner与Ant的同id更新/task体验、MUI的连续消息克制；拒绝静态全局单例和隐藏Promise控制权。'
	],
	keywords: [
		'toast',
		'toaster',
		'notification',
		'live region',
		'queue',
		'partial update',
		'promise task',
		'assertive throttle'
	]
});
