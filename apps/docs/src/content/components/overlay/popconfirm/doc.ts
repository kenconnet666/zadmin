import {
	popconfirmActionMetadata,
	popconfirmCancelMetadata,
	popconfirmContentMetadata,
	popconfirmDescriptionMetadata,
	popconfirmMetadata,
	popconfirmTitleMetadata,
	popconfirmTriggerMetadata
} from '@zadmin/zui/metadata';
import AsyncErrorDemo from './AsyncErrorDemo.svelte';
import asyncErrorSource from './AsyncErrorDemo.svelte?raw';
import AsyncSuccessDemo from './AsyncSuccessDemo.svelte';
import asyncSuccessSource from './AsyncSuccessDemo.svelte?raw';
import ControlledLifecycleDemo from './ControlledLifecycleDemo.svelte';
import controlledLifecycleSource from './ControlledLifecycleDemo.svelte?raw';
import InteractiveDemo from './InteractiveDemo.svelte';
import interactiveSource from './InteractiveDemo.svelte?raw';
import PreventDemo from './PreventDemo.svelte';
import preventSource from './PreventDemo.svelte?raw';
import { popconfirmApiFacts } from '../../../../framework/component-api.generated.js';
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
	profiles: ['layer', 'animated'],
	sourceApi: popconfirmApiFacts,
	teaching: {
		summary:
			'Popover继续唯一拥有定位、dismiss与焦点恢复；Popconfirm只增加最小Promise generation、pending防重复和安全可访问错误，不接管transport或业务重试。'
	},
	demos: [
		{
			covers: ['basic-render', 'focus', 'full-motion', 'keyboard', 'portal'],
			component: InteractiveDemo,
			description:
				'在Trigger旁说明后果并聚焦Cancel；确认、取消、outside与Escape共享Popover焦点恢复。',
			id: 'popconfirm-danger-action',
			source: interactiveSource,
			title: '就地危险操作确认'
		},
		{
			covers: ['controlled', 'keyboard', 'variants-and-states'],
			component: PreventDemo,
			description: '同步业务前置校验仍可通过原生click preventDefault阻止进入confirm生命周期。',
			id: 'popconfirm-prevent',
			source: preventSource,
			title: '输入确认与阻止关闭'
		},
		{
			covers: ['controlled', 'focus', 'reduced-motion', 'resource-cleanup', 'variants-and-states'],
			component: AsyncSuccessDemo,
			description:
				'Promise pending期间Action显示busy并防止重复；resolve后关闭，Cancel仍允许用户退出并使结果失效。',
			id: 'popconfirm-async-resolve',
			source: asyncSuccessSource,
			title: '异步Resolve与Pending'
		},
		{
			covers: ['accessible-name', 'focus', 'variants-and-states'],
			component: AsyncErrorDemo,
			description: 'reject保持浮层打开，以polite status公告安全格式化错误；内部异常不会默认泄漏。',
			id: 'popconfirm-async-reject',
			source: asyncErrorSource,
			title: 'Reject与可访问错误'
		},
		{
			covers: ['controlled', 'focus', 'keyboard', 'resource-cleanup'],
			component: ControlledLifecycleDemo,
			description:
				'受控关闭、Cancel、outside或Escape都会递增generation；旧Promise迟到settle不能改变新实例。',
			id: 'popconfirm-controlled-generation',
			source: controlledLifecycleSource,
			title: '受控Open与迟到结果'
		}
	],
	accessibility: [
		'Content保持非modal dialog语义，由Title和Description建立稳定可访问名称与后果说明。',
		'受控owner要表达“关闭旧实例再打开新实例”时，必须让open=false跨过一次Svelte flush或以key重挂载；同一批次false→true没有对子组件形成可观察关闭。',
		'打开后焦点移到第一个安全操作Cancel；确认resolve、取消、Escape和outside dismiss后均恢复当前真实Trigger。',
		'pending Action使用真实busy/loading并拒绝重复confirm；Cancel保持可操作，关闭后迟到Promise只由业务继续拥有，不能回写UI。',
		'reject保持dialog打开；错误通过aria-live=polite的status公告，并加入Action的aria-describedby。',
		'formatConfirmError默认返回Provider本地化安全文案；不得直接把服务器异常、路径或敏感payload暴露给用户。',
		'适用于上下文明确的短确认；复杂后果、不可逆多步骤操作、需要焦点trap的流程应升级为ZAlertDialog。'
	],
	keywords: [
		'popconfirm',
		'confirmation',
		'async confirm',
		'pending',
		'generation',
		'focus restore'
	]
});
