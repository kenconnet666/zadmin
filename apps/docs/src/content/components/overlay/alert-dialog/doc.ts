import {
	alertDialogActionMetadata,
	alertDialogCancelMetadata,
	alertDialogContentMetadata,
	alertDialogDescriptionMetadata,
	alertDialogMetadata,
	alertDialogOverlayMetadata,
	alertDialogTitleMetadata,
	alertDialogTriggerMetadata
} from '@zadmin/zui/metadata';
import InteractiveDemo from './InteractiveDemo.svelte';
import interactiveSource from './InteractiveDemo.svelte?raw';
import PreventDemo from './PreventDemo.svelte';
import preventSource from './PreventDemo.svelte?raw';
import AsyncErrorDemo from './AsyncErrorDemo.svelte';
import asyncErrorSource from './AsyncErrorDemo.svelte?raw';
import AsyncSuccessDemo from './AsyncSuccessDemo.svelte';
import asyncSuccessSource from './AsyncSuccessDemo.svelte?raw';
import FocusDemo from './FocusDemo.svelte';
import focusSource from './FocusDemo.svelte?raw';
import { alertDialogApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const alertDialogDoc = defineComponentDoc(alertDialogMetadata, {
	members: [
		alertDialogTriggerMetadata,
		alertDialogOverlayMetadata,
		alertDialogContentMetadata,
		alertDialogTitleMetadata,
		alertDialogDescriptionMetadata,
		alertDialogCancelMetadata,
		alertDialogActionMetadata
	],
	profiles: ['layer', 'animated'],
	sourceApi: alertDialogApiFacts,
	teaching: {
		props: {
			defaultOpen: { default: 'false', description: '非受控初始状态。' },
			onOpenChange: { default: 'undefined', description: '打开、取消或成功确认后的用户状态通知。' },
			open: { default: 'undefined', description: 'Svelte bindable modal状态。' }
		},
		summary:
			'强制显式决策的modal alertdialog：默认Cancel焦点，pending统一锁定Action/Cancel/dismiss，caller拥有Promise与错误展示。'
	},
	demos: [
		{
			component: InteractiveDemo,
			covers: ['accessible-name', 'focus', 'keyboard', 'portal'],
			description: '危险操作必须通过显式Cancel或Action结束，不响应Overlay pointer或Escape。',
			id: 'alert-dialog-explicit-action',
			source: interactiveSource,
			title: '强制显式决策'
		},
		{
			component: PreventDemo,
			covers: ['controlled', 'keyboard', 'variants-and-states'],
			description: 'Action回调可preventDefault保持顶层AlertDialog打开，重试后再关闭。',
			id: 'alert-dialog-prevent',
			source: preventSource,
			title: '阻止关闭与重试'
		},
		{
			component: AsyncSuccessDemo,
			covers: ['controlled', 'focus', 'loading', 'resource-cleanup'],
			description: 'Action Promise由调用方创建；pending防重复决策，当前generation resolve后关闭。',
			id: 'alert-dialog-async-success',
			source: asyncSuccessSource,
			title: '异步确认与Pending'
		},
		{
			component: AsyncErrorDemo,
			covers: ['controlled', 'focus', 'invalid', 'loading'],
			description: 'reject保持打开、解除pending、恢复Action焦点并把错误所有权交给调用方。',
			id: 'alert-dialog-async-error',
			source: asyncErrorSource,
			title: '异步失败与错误呈现'
		},
		{
			component: FocusDemo,
			covers: ['accessible-name', 'focus', 'keyboard', 'ssr'],
			description: 'Cancel是默认initialFocus；Title与Description都是AlertDialog的强制语义。',
			id: 'alert-dialog-focus',
			source: focusSource,
			title: '默认Cancel焦点与后果说明'
		}
	],
	accessibility: [
		'Content固定使用alertdialog与aria-modal，并由Title和Description提供稳定可访问名称与后果说明。',
		'打开后焦点进入内容并被限制在modal内；Overlay pointer与Escape不会隐式选择结果。',
		'Cancel和Action均使用原生button语义；业务onclick可同步preventDefault。',
		'默认焦点优先Cancel；pending时Action/Cancel均disabled，Escape/outside继续不可关闭，避免两次决策。',
		'Promise、AbortController、重试和错误文案由调用方拥有；generation只阻止迟到结果覆盖当前Dialog。',
		'参考WAI-ARIA AlertDialog与React Aria/MUI/Ant/Naive destructive confirmation；不复制表单或请求框架。'
	]
});
