import { commandMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import FilterDemo from './FilterDemo.svelte';
import filterSource from './FilterDemo.svelte?raw';
import ExternalDemo from './ExternalDemo.svelte';
import externalSource from './ExternalDemo.svelte?raw';
import { commandApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const commandDoc = defineComponentDoc(commandMetadata, {
	profiles: ['collection'],
	sourceApi: commandApiFacts,
	teaching: {
		props: {
			autofocus: {
				default: 'false',
				description: '挂载后只在真实输入可用且未禁用时聚焦一次；动态关闭会重新允许下一次显式开启。'
			},
			defaultQuery: {
				default: "''",
				description: '非受控查询初值，也是最近form reset时恢复的查询快照。'
			},
			disabled: {
				default: 'false',
				description: '禁用输入、active移动和action，同时保留结果与分组可读性。'
			},
			emptyText: {
				default: 'localePack.command.empty',
				description: '零结果时的本地化空状态；它不进入logical option集合。'
			},
			filter: {
				default: 'scoreCommand',
				description: '返回false排除、true保留原序或有限数值参与稳定相关性排序。'
			},
			inputLabel: {
				default: 'localePack.command.inputLabel',
				description: 'combobox输入的可访问名称。'
			},
			inputRef: {
				default: 'null',
				description: '真实输入引用；输入始终拥有DOM焦点与aria-activedescendant。'
			},
			items: {
				default: '必填',
				description: '稳定typed key、标签、分组、关键词、说明、快捷键和disabled状态的完整事实源。'
			},
			listLabel: {
				default: 'localePack.command.listLabel',
				description: '结果listbox及无名分组的可访问名称。'
			},
			loop: {
				default: 'true',
				description: '方向键在enabled结果边界循环；false时夹紧。'
			},
			maxResults: {
				default: '50',
				description: '排序后最多渲染的正整数结果数，避免无界命令面板DOM。'
			},
			onAction: {
				default: '—',
				description: 'Enter或指针激活时发送可取消CommandActionEvent，携带原始事件与typed item。'
			},
			onEscape: {
				default: '—',
				description: '输入收到Escape时交给宿主清空查询或关闭组合层。'
			},
			onQueryChange: {
				default: '—',
				description: '仅用户输入与reset导致查询变更时由ControllableState协调通知。'
			},
			placeholder: {
				default: 'localePack.command.placeholder',
				description: '本地化输入提示；不能替代inputLabel。'
			},
			query: {
				default: 'undefined',
				description: 'Svelte bindable查询；外部owner可持有服务端或跨页面搜索状态。'
			},
			ref: {
				default: 'null',
				description: '真实Command根节点引用。'
			},
			resultsLabel: {
				default: 'localePack.command.results',
				description: '把当前结果数转换为polite live status；显式格式化优先于Provider locale。'
			},
			shouldFilter: {
				default: 'true',
				description: '关闭后保留输入、键盘与action，但结果过滤、排序和异步生命周期归外部owner。'
			}
		},
		summary:
			'生产Command collection：输入保持唯一DOM焦点，LogicalCollection与ActiveDescendant拥有typed结果导航，相关性排序或外部结果owner保持正交，并用本地化live status公告结果数量。'
	},
	demos: [
		{
			component: FormDemo,
			covers: ['controlled', 'focus', 'keyboard', 'locale'],
			description: '输入保持焦点；结果按标签、词首、关键词和子序列相关性排序，并保留稳定分组。',
			id: 'command-ranked',
			source,
			title: '相关性命令搜索'
		},
		{
			component: FilterDemo,
			covers: ['keyboard', 'uncontrolled', 'variants-and-states'],
			description: '自定义前缀策略、结果上限、非循环导航与Escape回调保持正交。',
			id: 'command-filter',
			source: filterSource,
			title: '过滤策略与结果上限'
		},
		{
			component: ExternalDemo,
			covers: ['controlled', 'loading', 'resource-cleanup'],
			description:
				'shouldFilter=false把过滤、排序与远程结果所有权交给父状态，Command只保留键盘和action。',
			id: 'command-external-results',
			source: externalSource,
			title: '外部结果所有权'
		}
	],
	accessibility: [
		'输入使用combobox与aria-activedescendant，结果是分组listbox；disabled命令可见但不可active。',
		'输入通过aria-describedby关联polite、atomic结果数量状态；结果格式随Provider locale变化，也可由resultsLabel覆盖。',
		'ArrowUp/Down按loop策略移动，Home/End定位边界，Enter发送可取消CommandActionEvent。',
		'shouldFilter=false时ZCommand只管理键盘与action，允许服务端或业务层提供已排序结果。'
	],
	keywords: ['command', 'ranked filter', 'active descendant', 'keyboard', 'action']
});
