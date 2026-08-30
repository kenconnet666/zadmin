import {
	popconfirmActionMetadata,
	popconfirmCancelMetadata,
	popconfirmContentMetadata,
	popconfirmDescriptionMetadata,
	popconfirmMetadata,
	popconfirmTitleMetadata,
	popconfirmTriggerMetadata
} from '@zadmin/zui/metadata';
import InteractiveDemo from './InteractiveDemo.svelte';
import interactiveSource from './InteractiveDemo.svelte?raw';
import PreventDemo from './PreventDemo.svelte';
import preventSource from './PreventDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const popconfirmDoc = defineComponentDoc(popconfirmMetadata, {
	members: [
		popconfirmTriggerMetadata,
		popconfirmContentMetadata,
		popconfirmTitleMetadata,
		popconfirmDescriptionMetadata,
		popconfirmCancelMetadata,
		popconfirmActionMetadata
	],
	demos: [
		{
			component: InteractiveDemo,
			description: '在Trigger旁就地说明后果并聚焦Cancel；outside pointer和Escape可安全dismiss。',
			id: 'popconfirm-danger-action',
			source: interactiveSource,
			title: '就地危险操作确认'
		},
		{
			component: PreventDemo,
			description: '业务校验失败时Action阻止关闭并在浮层内显示错误。',
			id: 'popconfirm-prevent',
			source: preventSource,
			title: '输入确认与阻止关闭'
		}
	],
	accessibility: [
		'Content保持非modal dialog语义，由Title和Description建立稳定可访问名称与后果说明。',
		'打开后焦点移到第一个安全操作Cancel；确认、取消、Escape和outside dismiss后均恢复Trigger焦点。',
		'适用于上下文明确的短确认；复杂后果、不可逆多步骤操作应升级为ZAlertDialog。'
	]
});
