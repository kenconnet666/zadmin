import { treeMetadata } from '@zadmin/zui/metadata';
import ControllerDemo from './ControllerDemo.svelte';
import controllerSource from './ControllerDemo.svelte?raw';
import InteractiveDemo from './InteractiveDemo.svelte';
import source from './InteractiveDemo.svelte?raw';
import LargeDemo from './LargeDemo.svelte';
import largeSource from './LargeDemo.svelte?raw';
import LazyDemo from './LazyDemo.svelte';
import lazySource from './LazyDemo.svelte?raw';
import MultipleDemo from './MultipleDemo.svelte';
import multipleSource from './MultipleDemo.svelte?raw';
import { treeApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const treeDoc = defineComponentDoc(treeMetadata, {
	profiles: ['collection', 'form-control', 'virtualized'],
	sourceApi: treeApiFacts,
	teaching: {
		props: {
			controller: {
				default: 'null',
				description: '按typed key聚焦、定位、重试lazy branch并读取active。'
			},
			defaultExpandedKeys: { default: '[]', description: '非受控展开初值；reset恢复该快照。' },
			defaultSelectedKeys: { default: '[]', description: '非受控选择初值；reset恢复该快照。' },
			empty: { default: '默认空状态', description: '替换空tree状态，不进入logical key序列。' },
			emptyText: {
				default: 'localePack.collection.empty',
				description: '没有empty snippet时的空状态文本。'
			},
			expandedKeys: {
				default: '[]',
				description: '受控或bindable展开keys；层级数据仍由nodes唯一拥有。'
			},
			form: { default: '最近form', description: '把FormValueBridge关联到外部form id。' },
			height: { default: '320', description: 'virtualized viewport高度px。' },
			item: {
				default: 'node.label',
				description: 'typed节点正文；不能接管treeitem角色、ID或键盘。'
			},
			itemSize: { default: '36', description: 'virtualized固定行高px。' },
			onLoadChildren: {
				default: '—',
				description: '展开lazy branch时调用；signal在节点删除或卸载时abort。'
			},
			onLoadError: {
				default: '—',
				description: '非abort lazy失败通知；错误仍由Tree呈现并允许键盘/指针重试。'
			},
			onExpandedChange: { default: '—', description: '只为真实用户或controller展开动作通知。' },
			onSelectionChange: {
				default: '—',
				description: '只为用户选择动作通知，不为nodes同步伪造事件。'
			},
			overscan: { default: '4', description: 'ZVirtualList窗口前后额外挂载项数。' },
			ref: { default: 'null', description: '唯一tree容器焦点owner；虚拟和非虚拟模式一致。' },
			resetOnForm: { default: 'true', description: '复合owner可关闭内部reset并由外层统一恢复。' },
			selectedKeys: { default: '[]', description: '受控或bindable选择keys；异步orphan保持。' },
			ssrViewportSize: { default: 'height', description: 'SSR首帧虚拟窗口估算高度。' },
			virtualized: {
				default: 'false',
				description: '使用P2 keyed ZVirtualList与ActiveDescendant挂载握手。'
			}
		},
		summary:
			'LogicalTree只规范完整typed层级；SelectionModel、CollectionNavigation、ActiveDescendant、lazy coordinator和ZVirtualList分别拥有选择、active、DOM、请求与窗口。'
	},
	demos: [
		{
			covers: ['controlled', 'form-data', 'form-reset', 'keyboard', 'uncontrolled'],
			component: InteractiveDemo,
			description:
				'扁平nodes经LogicalTree验证并生成level/posinset/setsize，容器焦点、展开、选择、locale typeahead与FormValueBridge共享typed key。',
			id: 'tree-navigation',
			source,
			title: '展开、选择与键盘导航'
		},
		{
			covers: ['focus', 'keyboard', 'rtl', 'variants-and-states'],
			component: ControllerDemo,
			description:
				'controller按key展开祖先并聚焦；删除active后按旧logical顺序选择nearest，RTL只交换层级左右键。',
			id: 'tree-controller-dynamic-rtl',
			source: controllerSource,
			title: 'Controller、动态节点与RTL'
		},
		{
			covers: ['form-data', 'form-reset', 'keyboard', 'variants-and-states'],
			component: MultipleDemo,
			description:
				'checkbox是strict multiple选择样式：Space/点击切换稳定key，disabled与selectionDisabled被SelectionModel统一跳过。',
			id: 'tree-multiple-checkbox',
			source: multipleSource,
			title: 'Checkbox多选与表单'
		},
		{
			covers: ['keyboard', 'loading', 'locale', 'resource-cleanup'],
			component: LazyDemo,
			description:
				'hasChildren声明未加载branch；请求去重、错误状态、指针/逻辑展开键重试、AbortSignal和调用方nodes更新形成清晰边界。',
			id: 'tree-lazy-retry',
			source: lazySource,
			title: 'Lazy children、错误与重试'
		},
		{
			covers: ['focus', 'keyboard', 'resource-cleanup', 'ssr'],
			component: LargeDemo,
			description:
				'五千个节点只挂载viewport窗口；End先更新完整logical active，再滚动、挂载并暴露真实aria-activedescendant。',
			id: 'tree-virtual',
			source: largeSource,
			title: '大数据Virtual Tree'
		}
	],
	accessibility: [
		'Root是唯一tab stop并使用aria-activedescendant；treeitem不争夺DOM焦点，虚拟窗口外active不会暴露悬空ID。',
		'每个treeitem显式投射level、posinset、setsize、expanded、selected与disabled；string "1"和number 1仍是不同业务key。',
		'Up/Down/Home/End只遍历可见enabled节点；逻辑展开键在RTL翻转，collapse active descendant时active回到被折叠branch。',
		'multiple采用APG推荐的modifierless Space/点击toggle，并补Shift范围与Ctrl/Cmd+A；active与selection始终独立。',
		'checkbox当前是strict selection，不传播父子、不伪造half-check；half-check与可访问DnD在独立设计完成前明确后置。',
		'lazy branch在loading/error时仍可聚焦；错误通过polite status公告，逻辑展开键与switcher都可重试。'
	],
	keywords: [
		'tree',
		'logical tree',
		'active descendant',
		'lazy children',
		'virtual tree',
		'large data',
		'selection',
		'typeahead'
	]
});
