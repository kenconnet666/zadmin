import SizingDemo from './SizingDemo.svelte';
import sizingSource from './SizingDemo.svelte?raw';
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
import RequestOwnerDemo from './RequestOwnerDemo.svelte';
import requestOwnerSource from './RequestOwnerDemo.svelte?raw';
import { transferApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const transferDoc = defineComponentDoc(transferMetadata, {
	profiles: ['form-control', 'collection', 'data-view', 'virtualized'],
	sourceApi: transferApiFacts,
	teaching: {
		props: {
			size: {
				default: 'Field size，其次为 Provider density',
				description:
					'五档同步两侧面板留白、过滤输入、列表文字与转移按钮；虚拟模式仍显式使用 virtualItemSize，不用尺寸覆盖行高。'
			},
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
			component: SizingDemo,
			covers: ['composition', 'variants-and-states'],
			description:
				'五档尺寸按组件用途同步文字、留白和内部控件；Field/Form 显式尺寸优先于 Provider density。',
			id: 'transfer-sizing',
			source: sizingSource,
			title: '五档尺寸与组合比例'
		},
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
			component: RequestOwnerDemo,
			covers: [
				'controlled',
				'external-clear',
				'form-data',
				'form-reset',
				'keyboard',
				'resource-cleanup'
			],
			description:
				'request模式由外部owner人工写回nextValue并确认；启用dragDrop后pointer与Alt+方向键可发起跨栏事务，auto/full/reduced只控制布局反馈，也可拒绝/抛错；外部快照变化自动终止过期请求，原生FormData不做去重或预期值替代。',
			id: 'transfer-request-owner',
			source: requestOwnerSource,
			title: '外部请求确认与结算'
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
		'loading只表示数据加载，保留已有items；数据请求、transport、节流和分页缓存由业务数据层拥有，Transfer不发起网络请求。',
		'immediate是默认移动模式，由组件写一次value并通知onValueChange。request必须提供onMoveRequest且不能同时提供onValueChange；callback返回true后，还需value与request.nextValue精确同序回声一致才报告accepted，无回声或false报告rejected。',
		'移动pending通过独立data-state和aria-busy表达，阻止重复移动与勾选，但允许筛选、导航和滚动。原始value或预期nextValue都可作为等待中的合法快照；items的key/order/disabled或不相关value变化报告stale并abort，label变化不是membership变化。',
		'FormData始终取唯一canonical value，不取临时checked或候选值；外部owner提前写入value会真实反映在FormData中，后续拒绝不会替调用方回滚已经发生的外部写入。',
		'onMoveEnd区分accepted/rejected/cancelled/stale/error。readonly、disabled和原生reset终止待决事务；卸载abort并释放但不再通知、公告或聚焦。业务必须响应request.signal释放自己持有的等待资源。',
		'accepted只清理来源侧本次movingKeys，保留其他checked；pointer保留拖起锚点，焦点仍由listbox容器与语义active key表达。用户等待期间主动移焦时不抢回；唯一live region只公告真实终态。',
		'布局反馈与Sortable共用几何生命周期：等待期间滚动、容器或已测量项尺寸变化使旧动画失效，业务接受结果不变；提前回写已独立呈现后不倒播，reduced或零时长不采集历史几何。',
		'virtual为两个pane各建一个固定行ZVirtualList、MountedElements和ActiveDescendant握手；虚拟器只拥有窗口/scroll，SelectionModel和最终value不会迁入虚拟器。',
		'dragDrop=true时可选桌面pointer跨栏membership；触屏短滑用于滚动，长按后拖动才跨栏，tap不移动canonical；所有移动仍进入同一immediate/request事务。',
		'listbox上的Alt+逻辑方向箭头是键盘跨栏快捷键；拖checked项移动该pane全部enabled checked，未checked项只移动自身。同栏reorder、分组数据结构、sticky和动态行高不属于该API；布局动画只随auto/full/reduced反馈，不接管canonical。普通与虚拟模式已有Chromium触屏模拟回归，真机及其他引擎的触屏验收仍需独立完成。',
		'readonly保持listbox可聚焦、可滚动、可typeahead且value继续提交，但筛选input只读、SelectionModel为none、移动按钮禁用；disabled另行退出焦点和FormData。',
		'form reset恢复defaultValue，清空两侧查询、临时勾选和导航瞬态，不触发onValueChange。',
		'API取舍：保留value/defaultValue和immediate模式的onValueChange，不创建values复数别名；请求模式显式区分membership事务与数据加载，保持单一value owner。吸收双栏、筛选、typed key/view/selection和locale分层，不增加大型transfer DSL。'
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
