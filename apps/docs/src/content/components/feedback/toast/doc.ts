import { toastMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import TonesDemo from './TonesDemo.svelte';
import tonesSource from './TonesDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const toastDoc = defineComponentDoc(toastMetadata, {
	demos: [
		{
			component: FormDemo,
			description: '显式队列驱动消息、操作、关闭与持久时长。',
			id: 'toast-queue',
			source,
			title: '通知队列'
		},
		{
			component: TonesDemo,
			description: '独立Toast展示不同tone与公告优先级，队列不是渲染的前置条件。',
			id: 'toast-tones',
			source: tonesSource,
			title: '独立Toast语义'
		}
	],
	accessibility: [
		'polite Toast使用role=status，danger默认使用assertive alert；不要把普通成功消息升级为assertive。',
		'鼠标悬停、键盘焦点与页面隐藏分别暂停剩余时长，所有原因恢复后才继续计时。',
		'ZToaster不创建全局单例；应用显式持有ToastQueue并在所属生命周期结束时dispose。',
		'持久Toast必须提供关闭按钮，操作完成后队列按action原因移除。'
	],
	keywords: ['toast', 'toaster', 'notification', 'live region', 'queue']
});
