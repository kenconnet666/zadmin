import { cascaderMetadata } from '@zadmin/zui/metadata';
import { cascaderApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
import ControlledDemo from './ControlledDemo.svelte';
import controlledSource from './ControlledDemo.svelte?raw';
import FormDemo from './FormDemo.svelte';
import formSource from './FormDemo.svelte?raw';
import LazyDemo from './LazyDemo.svelte';
import lazySource from './LazyDemo.svelte?raw';
import SearchDemo from './SearchDemo.svelte';
import searchSource from './SearchDemo.svelte?raw';
import StatesDemo from './StatesDemo.svelte';
import statesSource from './StatesDemo.svelte?raw';
import VirtualDemo from './VirtualDemo.svelte';
import virtualSource from './VirtualDemo.svelte?raw';

export const cascaderDoc = defineComponentDoc(cascaderMetadata, {
	profiles: ['collection', 'form-control', 'layer', 'virtualized'],
	sourceApi: cascaderApiFacts,
	teaching: {
		props: {
			clearLabel: {
				default: 'localePack.common.clear',
				description: '独立清空按钮的可访问名称和title；显式值优先。'
			},
			controlId: {
				default: 'Field controlId或生成ID',
				description: '真实Trigger ID，也是Field label的focus owner。'
			},
			defaultOpen: {
				default: 'false',
				description: '非受控Popover初值；form reset只通过统一owner恢复，不制造打开回调。'
			},
			emptyText: {
				default: 'localePack.collection.empty',
				description: '空根列、空子列或零搜索结果状态。'
			},
			filter: {
				default: 'loaded path text includes query',
				description: '只筛选当前nodes中完整加载的叶子路径；远程搜索仍由owner提供新nodes。'
			},
			form: {
				default: '最近祖先form',
				description: '把唯一FormValueBridge关联到指定外部form id。'
			},
			gutter: {
				default: '4',
				description: 'Trigger与Popover之间的Floating UI间距px。'
			},
			invalid: {
				default: 'Field context或false',
				description: '投射到Trigger aria-invalid和根状态。'
			},
			loadingText: {
				default: 'localePack.collection.loading',
				description: '全局loading或空列的状态文本。'
			},
			matchWidth: {
				default: 'false',
				description: '让Popover至少匹配Trigger宽度；列仍可在内部逻辑方向滚动。'
			},
			onLoadChildren: {
				default: '—',
				description:
					'hasChildren branch的lazy请求；signal在节点删除、同key identity替换、form reset、禁用、只读或卸载时abort，owner负责更新nodes。'
			},
			placeholder: {
				default: 'localePack.collection.selectPath',
				description: '空路径Trigger文本，同时作为默认loaded-path搜索提示。'
			},
			placement: {
				default: "'bottom-start'",
				description: 'Popover首选逻辑方位；碰撞和RTL由共享Floating层处理。'
			},
			required: {
				default: 'Field context或false',
				description:
					'由Field标签与根data-required呈现；业务提交阻断由ZForm schema拥有，隐藏FormValue不冒充原生Constraint控件。'
			},
			searchPlaceholder: {
				default: 'placeholder',
				description: 'searchable模式辅助输入的名称和提示；该输入不继承Field name或参与FormData。'
			},
			size: {
				default: 'Field size，其次为Provider density',
				description: '统一Trigger和清空按钮尺寸。'
			}
		},
		summary:
			'生产级单路径Cascader：LogicalTree只拥有层级，每列各自拥有Collection导航与DOM active，根统一管理路径、loaded search、lazy请求、Popover和FormValue。'
	},
	demos: [
		{
			component: FormDemo,
			covers: ['focus', 'form-data', 'form-reset', 'keyboard', 'uncontrolled'],
			description:
				'父节点只推进下一列，叶节点才提交完整typed路径；Field拥有label/name/required，唯一FormValueBridge参与reset。',
			id: 'cascader-path',
			source: formSource,
			title: '逐级路径、Field与表单'
		},
		{
			component: ControlledDemo,
			covers: ['controlled', 'external-clear', 'focus', 'keyboard'],
			description:
				'open与value由外部独立持有；number 1和string "1"保持不同身份，空数组是明确清空。',
			id: 'cascader-controlled-typed',
			source: controlledSource,
			title: '受控路径、打开与Typed Key'
		},
		{
			component: SearchDemo,
			covers: ['controlled', 'keyboard', 'locale', 'variants-and-states'],
			description:
				'筛选只作用于已加载叶子路径并公告结果数量；disabled祖先或叶子不会因搜索绕过完整路径禁用。',
			id: 'cascader-loaded-search',
			source: searchSource,
			title: 'Loaded Path Search'
		},
		{
			component: LazyDemo,
			covers: ['keyboard', 'loading', 'locale', 'resource-cleanup'],
			description:
				'hasChildren声明lazy branch；请求去重、错误可由指针或逻辑展开键重试，节点删除和卸载会abort。',
			id: 'cascader-lazy-retry',
			source: lazySource,
			title: 'Lazy、错误、重试与Abort'
		},
		{
			component: VirtualDemo,
			covers: ['focus', 'keyboard', 'resource-cleanup', 'ssr'],
			description:
				'千项子列通过固定行KeyedVirtualizer保持DOM有界；End先更新logical active，再滚动并挂载真实option。',
			id: 'cascader-virtual',
			source: virtualSource,
			title: '千项Virtual Column'
		},
		{
			component: StatesDemo,
			covers: ['disabled', 'invalid', 'readonly', 'rtl', 'variants-and-states'],
			description:
				'readonly保留路径、焦点和FormData但不打开；loading保留数据并阻止写入；disabled移除成功值。',
			id: 'cascader-states',
			source: statesSource,
			title: 'Readonly、Loading、Disabled与尺寸'
		}
	],
	accessibility: [
		'每一级是独立命名listbox并保持容器DOM焦点；option通过aria-activedescendant暴露active，虚拟窗口外不会产生悬空ID。',
		'Up/Down/Home/End在当前列移动，逻辑展开/返回键在RTL翻转；Enter/Space推进branch、重试失败或提交叶节点。',
		'Trigger是唯一Field focus owner；Delete/Backspace和独立Lucide清空按钮只在可编辑且非空时出现。',
		'loaded-path搜索输入是辅助filter，不是第二个业务值控件；Arrow键可进入结果listbox，结果数由polite status公告。',
		'selectionDisabled branch仍可展开，叶子仍可聚焦和导航但不会提交，并以data-selection-disabled暴露状态而不伪装aria-disabled。',
		'lazy loading/error继续保留branch可聚焦性；请求错误使用本地化status，AbortSignal和source identity避免reset、删除或同key替换后的迟到结果污染当前节点。',
		'ZUI保持单路径叶子提交，没有复制Ant多选级联、半选传播或任意semantic slotProps；这些需要独立选择和FormData设计。',
		'MUI没有Cascader，因此ZUI不会把普通Select伪装成多级树；扁平TreeNode继续适合数据库、IPC和增量异步更新。'
	],
	keywords: [
		'cascader',
		'logical tree',
		'active descendant',
		'lazy children',
		'loaded path search',
		'virtual column',
		'typed key',
		'form value'
	]
});
