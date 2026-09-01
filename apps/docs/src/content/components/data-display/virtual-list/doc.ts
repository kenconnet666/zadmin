import { virtualListMetadata } from '@zadmin/zui/metadata';
import ControllerDemo from './ControllerDemo.svelte';
import controllerSource from './ControllerDemo.svelte?raw';
import DynamicHeightsDemo from './DynamicHeightsDemo.svelte';
import dynamicHeightsSource from './DynamicHeightsDemo.svelte?raw';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import InitialPositionDemo from './InitialPositionDemo.svelte';
import initialPositionSource from './InitialPositionDemo.svelte?raw';
import StatesDemo from './StatesDemo.svelte';
import statesSource from './StatesDemo.svelte?raw';
import { virtualListApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const virtualListDoc = defineComponentDoc(virtualListMetadata, {
	profiles: ['collection', 'data-view', 'virtualized'],
	sourceApi: virtualListApiFacts,
	teaching: {
		props: {
			ariaLabel: {
				default: '—',
				description: '旧版兼容alias；新代码使用原生aria-label，并可用aria-labelledby关联可见标题。'
			},
			estimateSize: {
				default: '—',
				description: '一旦提供即启用动态DOM测量；应估算常见或偏大高度，避免首帧滚动范围剧烈收缩。'
			},
			height: {
				default: '320',
				description: '数值像素viewport高度；真实挂载后由ResizeObserver校准。'
			},
			initialIndex: {
				default: '—',
				description: '兼容固定数据的首次索引定位；动态、排序或分页数据优先使用initialKey。'
			},
			initialKey: {
				default: '—',
				description: '首次客户端挂载后按稳定业务key定位；未知key会明确报错。'
			},
			itemDisabled: {
				default: 'false',
				description: '只投射aria-disabled/data-disabled；跳过规则仍由外部CollectionNavigation拥有。'
			},
			itemId: {
				default: '—',
				description:
					'生成当前真实wrapper id；应使用ActiveDescendant.idFor的opaque id，不直接拼业务key。'
			},
			itemExpanded: {
				default: '—',
				description: '仅在treeitem wrapper投射aria-expanded；展开状态仍由LogicalTree owner提供。'
			},
			itemLevel: {
				default: '—',
				description: '仅在treeitem wrapper投射正整数aria-level。'
			},
			itemPosInSet: {
				default: '—',
				description: '仅在treeitem wrapper投射同级正整数aria-posinset，不能用全局虚拟索引替代。'
			},
			itemRole: {
				default: '由role推导',
				description:
					'list/listbox/tree/grid分别推导listitem/option/treeitem/row；复杂消费者可选presentation。'
			},
			itemSelected: {
				default: '—',
				description:
					'把外部SelectionModel结果投射为option/treeitem aria-selected；option缺失回调仍明确false，tree selectionMode=none可省略。'
			},
			itemSetSize: {
				default: '—',
				description: '仅在treeitem wrapper投射同级正整数aria-setsize。'
			},
			itemSize: {
				default: '40',
				description: '精确固定高度fast path，不创建逐项ResizeObserver测量；与estimateSize互斥。'
			},
			loading: {
				default: 'false',
				description: '投射aria-busy；已有项不会被清空，首次空加载才显示loadingContent。'
			},
			onItemMount: {
				default: '—',
				description:
					'把真实wrapper登记到MountedElements；返回cleanup防止旧ref卸载误删后来替换的节点。'
			},
			overscan: {
				default: '4',
				description: '可见窗口上下额外项数；更高值减少快速滚动空白，但增加DOM和渲染成本。'
			},
			role: {
				default: "'list'",
				description:
					'支持list/listbox/tree/grid语义；焦点、active与selection仍由组合组件owner控制。'
			},
			ssrViewportSize: {
				default: 'height',
				description:
					'服务端唯一可用的viewport提示；hydration前维持同一估算窗口，挂载后再提交真实测量。'
			}
		},
		summary:
			'生产级纵向Virtual List：固定高度走低开销fast path，动态高度按typed key缓存真实测量，并用key锚定处理插入、排序和尺寸变化；controller只负责窗口与滚动，不拥有业务active或selection。'
	},
	demos: [
		{
			component: FormDemo,
			covers: ['basic-render', 'native-props', 'variants-and-states'],
			description: '一万条记录只渲染viewport与overscan窗口，固定高度路径不承担逐项测量成本。',
			id: 'virtual-list-large',
			source,
			title: '一万条固定高度记录'
		},
		{
			component: DynamicHeightsDemo,
			covers: ['resource-cleanup', 'variants-and-states'],
			description:
				'按ownerDocument批量观察真实高度，测量按key缓存；顶部插入后保持原首个可见key与项内偏移。',
			id: 'virtual-list-dynamic-heights',
			source: dynamicHeightsSource,
			title: '动态高度、测量与滚动锚定'
		},
		{
			component: ControllerDemo,
			covers: ['disabled', 'focus', 'keyboard', 'reduced-motion', 'rtl'],
			description:
				'controller按key确保目标进入窗口；真实option挂载后才向焦点owner暴露aria-activedescendant。',
			id: 'virtual-list-controller',
			source: controllerSource,
			title: 'Controller与ActiveDescendant握手'
		},
		{
			component: InitialPositionDemo,
			covers: ['ssr', 'variants-and-states'],
			description:
				'initialIndex保留兼容，ssrViewportSize决定服务端窗口；动态数据应改用initialKey避免索引漂移。',
			id: 'virtual-list-initial-position',
			source: initialPositionSource,
			title: '初始定位与SSR窗口'
		},
		{
			component: StatesDemo,
			covers: ['accessible-name', 'loading'],
			description:
				'loading和empty是集合状态而非伪造disabled item；已有数据在loading-more期间继续保留。',
			id: 'virtual-list-states',
			source: statesSource,
			title: '加载与空集合边界'
		}
	],
	accessibility: [
		'viewport保留原生aria-label/aria-labelledby、aria-busy和适用HTML属性；默认是list，可切换到listbox、tree或grid。',
		'item wrapper按root role推导listitem、option、treeitem或row；普通一维集合使用全局aria-posinset/aria-setsize，LogicalTree通过四个窄callback投射真实层级，grid使用aria-rowindex/aria-rowcount。',
		'虚拟器从不拥有active、selected或disabled跳过策略；itemDisabled只投射状态，CollectionNavigation和SelectionModel仍是唯一业务owner。',
		'ActiveDescendant先调用controller.ensureKey，再等待controller.isRendered为true，最后才设置指向itemId的aria-activedescendant，避免悬空引用。',
		'itemKey使用稳定typed业务key，数字1和字符串1不同；拒绝重复、NaN、Infinity与-0，业务key不应直接拼入DOM id。',
		'固定itemSize适合表格和统一行高；estimateSize启用动态测量，单个ownerDocument ResizeObserver批量提交当前窗口尺寸；viewport宽度或字体变化会失效旧测量。',
		'测量、数据插入、排序与删除前保存首个可见key和项内偏移；key被删除时选择原顺序后继，再选择前驱。',
		'SSR仅使用height/ssrViewportSize和estimate，未读取window/document；hydration挂载后才切换到真实clientHeight和DOM测量。',
		'ResizeObserver、matchMedia和document.fonts都来自viewport.ownerDocument/defaultView，卸载时断开；iframe、ShadowRoot和WebView不借用global realm。',
		'controller平滑定位遵循真实scroll事件逐窗渲染；Provider或系统reduced motion会把smooth请求降级为即时定位。',
		'loading使用aria-busy并在空首载显示loadingContent；empty不进入items、aria-setsize或键盘序列，loading-more保留已有项。',
		'虚拟化会缩减可访问树，全文搜索、打印和导出应由应用提供非虚拟数据路径；不把屏外业务项伪装成隐藏DOM。',
		'能力取舍：采用TanStack Virtual的estimate/measure/overscan与React Aria的Collection分层，保留MUI式固定高度fast path；暂不承诺window virtualizer、horizontal、masonry、sticky rangeExtractor或二维DataGrid。'
	],
	keywords: [
		'virtual list',
		'virtualizer',
		'overscan',
		'dynamic height',
		'scroll anchor',
		'scrollToKey',
		'active descendant',
		'large data',
		'SSR',
		'ShadowRoot'
	]
});
