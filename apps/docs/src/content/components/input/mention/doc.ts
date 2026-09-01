import { mentionMetadata } from '@zadmin/zui/metadata';
import { mentionApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
import AsyncDemo from './AsyncDemo.svelte';
import asyncSource from './AsyncDemo.svelte?raw';
import ControlledDemo from './ControlledDemo.svelte';
import controlledSource from './ControlledDemo.svelte?raw';
import FormDemo from './FormDemo.svelte';
import formSource from './FormDemo.svelte?raw';
import TriggersDemo from './TriggersDemo.svelte';
import triggersSource from './TriggersDemo.svelte?raw';
import VirtualDemo from './VirtualDemo.svelte';
import virtualSource from './VirtualDemo.svelte?raw';

export const mentionDoc = defineComponentDoc(mentionMetadata, {
	profiles: ['collection', 'form-control', 'layer', 'virtualized'],
	sourceApi: mentionApiFacts,
	teaching: {
		props: {
			emptyText: {
				default: 'localePack.collection.mentionEmpty',
				description: '查询存在但没有建议时的本地化状态。'
			},
			filter: {
				default: 'label/value/keywords contains',
				description: '派生当前LogicalCollection view；不会修改完整items或textarea值。'
			},
			listLabel: {
				default: 'localePack.collection.mentionList',
				description: '建议listbox可访问名称。'
			},
			loadingText: {
				default: 'localePack.collection.loading',
				description: '异步owner尚未返回建议时的状态文本。'
			},
			placement: {
				default: "'bottom-start'",
				description: '建议Popover首选逻辑方位；碰撞、RTL和Portal由共享层处理。'
			}
		},
		summary:
			'光标感知的原生textarea Mention：LogicalCollection和ActiveDescendant拥有typed建议，外部owner可异步更新结果，固定行窗口支持大型目录。'
	},
	demos: [
		{
			component: FormDemo,
			covers: ['focus', 'form-data', 'form-reset', 'keyboard', 'uncontrolled'],
			description:
				'在光标前输入@或#过滤成员；提交后只替换当前片段，textarea焦点、光标、FormData和reset保持同步。',
			id: 'mention-caret',
			source: formSource,
			title: '光标感知建议与表单'
		},
		{
			component: TriggersDemo,
			covers: ['composition', 'keyboard', 'locale', 'variants-and-states'],
			description: '自定义触发符、查询门槛、数量上限和插入空格策略保持独立。',
			id: 'mention-triggers',
			source: triggersSource,
			title: '触发符、IME与查询策略'
		},
		{
			component: ControlledDemo,
			covers: ['controlled', 'external-clear', 'readonly', 'variants-and-states'],
			description:
				'外部owner可替换或清空完整文本而不伪造用户回调；readonly保留焦点、选择和FormData但不打开建议。',
			id: 'mention-controlled',
			source: controlledSource,
			title: '受控文本、外部清空与Readonly'
		},
		{
			component: AsyncDemo,
			covers: ['controlled', 'loading', 'resource-cleanup', 'variants-and-states'],
			description:
				'onSearchChange把请求、取消、缓存和竞态交给owner；loading/empty和typed number/string key仍由同一建议collection呈现。',
			id: 'mention-async',
			source: asyncSource,
			title: '异步Owner与自定义Item'
		},
		{
			component: VirtualDemo,
			covers: ['focus', 'keyboard', 'resource-cleanup', 'ssr'],
			description:
				'一千条建议只挂载viewport窗口；End先更新logical active，再确保真实option挂载后更新textarea的aria-activedescendant。',
			id: 'mention-virtual',
			source: virtualSource,
			title: '千项Virtual Suggestions'
		}
	],
	accessibility: [
		'trigger只在文本开头、空白或标点后生效，避免把邮箱等普通文本误判为mention。',
		'textarea始终持有DOM焦点并通过aria-controls和aria-activedescendant关联真实listbox/option；虚拟屏外ID不会提前暴露。',
		'ArrowUp/Down/Home/End由CollectionNavigation处理；Enter/Tab提交，Escape只关闭，disabled建议永远不会成为active。',
		'中文输入法组合期间不重算或提交建议，compositionend后再按真实光标位置解析。',
		'异步请求、debounce、AbortController和缓存属于调用方owner；Mention只消费loading和最新items，不保存transport状态。',
		'自定义item snippet只接管可见正文，不能替换option角色、ID、active、pointer或键盘所有权。'
	],
	keywords: [
		'mention',
		'textarea',
		'trigger',
		'caret',
		'active descendant',
		'async suggestions',
		'virtual suggestions',
		'IME'
	]
});
