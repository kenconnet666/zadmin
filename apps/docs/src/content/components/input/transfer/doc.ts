import { transferMetadata } from '@zadmin/zui/metadata';
import AsyncDemo from './AsyncDemo.svelte';
import asyncSource from './AsyncDemo.svelte?raw';
import FormDemo from './FormDemo.svelte';
import formSource from './FormDemo.svelte?raw';
import LocaleDemo from './LocaleDemo.svelte';
import localeSource from './LocaleDemo.svelte?raw';
import StatesDemo from './StatesDemo.svelte';
import statesSource from './StatesDemo.svelte?raw';
import VirtualDemo from './VirtualDemo.svelte';
import virtualSource from './VirtualDemo.svelte?raw';
import { transferApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const transferDoc = defineComponentDoc(transferMetadata, {
	profiles: ['form-control', 'collection', 'data-view', 'virtualized'],
	sourceApi: transferApiFacts,
	teaching: {
		props: {
			emptyText: {
				default: 'Provider localePack.transfer.empty',
				description: 'pane view为空且不在loading时的状态文本；异步孤儿使用独立locale状态。'
			},
			form: {
				default: '最近祖先form',
				description: '把最终value的重复同名entries关联到DOM外部form；两侧筛选草稿不会参与。'
			},
			invalid: {
				default: '继承Field或false',
				description: '投射到根和来源业务listbox，不把筛选输入伪装成业务值owner。'
			},
			moveToSourceLabel: {
				default: 'Provider localePack.transfer.moveToSource',
				description: '返回来源pane按钮的可访问名称。'
			},
			moveToTargetLabel: {
				default: 'Provider localePack.transfer.moveToTarget',
				description: '移入目标pane按钮的可访问名称。'
			},
			required: {
				default: '继承Field或false',
				description: '投射到来源业务listbox；最终value校验仍由Field/Form schema拥有。'
			},
			searchPlaceholder: {
				default: 'Provider localePack.transfer.filterPlaceholder',
				description: '两侧辅助筛选输入的placeholder；查询不是表单字段。'
			},
			sourceTitle: {
				default: 'Provider localePack.transfer.sourceTitle',
				description: '来源pane标题和listbox可访问名称。'
			},
			targetTitle: {
				default: 'Provider localePack.transfer.targetTitle',
				description: '目标pane标题和listbox可访问名称。'
			}
		},
		summary:
			'生产双栏Transfer：完整LogicalCollection是唯一数据顺序，来源/目标view和两套SelectionModel分别拥有过滤与临时勾选，最终value、FormData和异步孤儿由Root独立拥有；两栏可共享固定行VirtualList而不复制状态。'
	},
	demos: [
		{
			component: FormDemo,
			covers: ['form-data', 'form-reset', 'keyboard', 'uncontrolled'],
			description:
				'两侧独立过滤和勾选；disabled项目不能移动，最终typed key以重复同名字段提交并可无回调reset。',
			id: 'transfer-filter',
			source: formSource,
			title: '筛选、双向移动与表单'
		},
		{
			component: StatesDemo,
			covers: ['disabled', 'readonly', 'variants-and-states'],
			description:
				'无筛选、原生disabled与保持可聚焦导航/提交但不能修改的readonly使用同一双pane模型。',
			id: 'transfer-states',
			source: statesSource,
			title: '无筛选、禁用与只读'
		},
		{
			component: LocaleDemo,
			covers: ['accessible-name', 'locale', 'rtl'],
			description:
				'Provider typed locale pack动态切换标题、筛选、空状态与按钮名称；方向图标使用逻辑来源/目标而非物理左右。',
			id: 'transfer-locale',
			source: localeSource,
			title: '动态Locale与逻辑方向'
		},
		{
			component: AsyncDemo,
			covers: ['controlled', 'external-clear', 'loading'],
			description:
				'owner替换异步页面和loading；暂未加载的最终key不会被组件裁剪，重新出现后回到目标pane。',
			id: 'transfer-async',
			source: asyncSource,
			title: '异步分页、loading与孤儿key'
		},
		{
			component: VirtualDemo,
			covers: ['focus', 'keyboard', 'resource-cleanup'],
			description:
				'1000项数据的两栏各自维护virtual controller、active descendant和挂载注册表；筛选与移动仍使用完整逻辑view。',
			id: 'transfer-virtual',
			source: virtualSource,
			title: '千项双栏固定行虚拟化'
		}
	],
	accessibility: [
		'每侧是独立命名、容器焦点的aria-multiselectable listbox；aria-activedescendant只引用该pane当前真实挂载option。',
		'Arrow/Home/End通过各自CollectionNavigation移动active key；Enter/Space通过各自SelectionModel切换临时勾选；disabled item同时退出导航、勾选和移动。',
		'普通筛选不会清空既有勾选；Ctrl/Meta+A明确调用selectAllScope=view，把该pane的临时勾选替换为当前过滤结果中的enabled key，作用域不扩散到隐藏项或另一栏。',
		'Typeahead使用Provider locale的Intl.Collator；IME composing和legacy keyCode 229期间不接管导航、勾选或select-all。',
		'筛选输入是Field auxiliary descendant，使用空name且不参与FormValueBridge；查询、草稿、typeahead buffer都不会进入FormData。ArrowUp/Down可从筛选输入进入对应listbox。',
		'来源listbox是Field业务焦点owner；label点击聚焦它，invalid/required/description也投射到它，而不是偶然的第一个筛选input。',
		'两个pane都从同一个完整LogicalCollection派生；最终value与临时source/target checked严格分离，移动后loaded key按items source order稳定输出。',
		'异步items变化不裁剪最终value中的未知key；未知key继续提交并显示本地化“尚未加载”状态，重新加载后自动回到目标pane。只有owner更新value才真正删除孤儿。',
		'loading保留已有items并设置aria-busy；请求、transport、取消、节流、分页缓存和竞态世代由业务数据层拥有，Transfer不发起网络请求。',
		'virtual为两个pane各建一个固定行ZVirtualList、MountedElements和ActiveDescendant握手；虚拟器只拥有窗口/scroll，SelectionModel和最终value不会迁入虚拟器。',
		'只承诺无分组固定行虚拟化；TransferItem没有group合同，也不伪造dynamic-height、sticky group、拖拽排序或跨栏drag-and-drop。',
		'readonly保持listbox可聚焦、可滚动、可typeahead且value继续提交，但筛选input只读、SelectionModel为none、移动按钮禁用；disabled另行退出焦点和FormData。',
		'form reset恢复defaultValue，清空两侧查询、临时勾选和导航瞬态，不触发onValueChange。',
		'API取舍：沿用现有value/defaultValue/onValueChange，未创建values复数别名；吸收Ant/Naive的双栏、筛选、disabled和locale，吸收React Aria的key/view/selection分层；不复制MUI示例式应用状态拼装或大型transfer DSL。'
	],
	keywords: [
		'transfer',
		'dual list',
		'logical collection',
		'multiple selection',
		'filter',
		'virtual list',
		'async orphan',
		'form reset',
		'readonly'
	]
});
