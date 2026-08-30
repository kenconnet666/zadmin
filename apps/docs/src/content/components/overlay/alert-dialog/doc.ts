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
	demos: [
		{
			component: InteractiveDemo,
			description: '危险操作必须通过显式Cancel或Action结束，不响应Overlay pointer或Escape。',
			id: 'alert-dialog-explicit-action',
			source: interactiveSource,
			title: '强制显式决策'
		},
		{
			component: PreventDemo,
			description: 'Action回调可preventDefault保持顶层AlertDialog打开，重试后再关闭。',
			id: 'alert-dialog-prevent',
			source: preventSource,
			title: '阻止关闭与重试'
		}
	],
	accessibility: [
		'Content固定使用alertdialog与aria-modal，并由Title和Description提供稳定可访问名称与后果说明。',
		'打开后焦点进入内容并被限制在modal内；Overlay pointer与Escape不会隐式选择结果。',
		'Cancel和Action均使用原生button语义；业务onclick可同步preventDefault，并在异步确认完成后自行控制open。'
	]
});
