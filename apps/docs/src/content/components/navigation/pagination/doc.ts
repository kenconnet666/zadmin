import { paginationMetadata } from '@zadmin/zui/metadata';
import InteractiveDemo from './InteractiveDemo.svelte';
import interactiveSource from './InteractiveDemo.svelte?raw';
import ModesDemo from './ModesDemo.svelte';
import modesSource from './ModesDemo.svelte?raw';
import PageSizeDemo from './PageSizeDemo.svelte';
import pageSizeSource from './PageSizeDemo.svelte?raw';
import RangesDemo from './RangesDemo.svelte';
import rangesSource from './RangesDemo.svelte?raw';
import ServerOwnerDemo from './ServerOwnerDemo.svelte';
import serverOwnerSource from './ServerOwnerDemo.svelte?raw';
import { paginationApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const paginationDoc = defineComponentDoc(paginationMetadata, {
	profiles: ['data-view'],
	sourceApi: paginationApiFacts,
	teaching: {
		props: {
			boundaryCount: {
				default: '1',
				description: 'default模式首尾持续显示的非负页码数量，采用MUI的稳定窗口概念。'
			},
			defaultPage: {
				default: '1',
				description: '非受控页码初值；会在首帧按解析后的总页数夹紧。'
			},
			defaultPageSize: {
				default: '10',
				description: 'totalItems模式的非受控页尺寸初值；totalPages模式禁止传入。'
			},
			disabled: {
				default: 'false',
				description: '禁用前后页、页码、simple输入和页尺寸选择器，同时保留可读状态。'
			},
			dir: {
				default: 'Provider direction',
				description: '显式覆盖LTR/RTL，并同步逻辑布局、图标与方向键。'
			},
			mode: {
				default: "componentDefaults.pagination.mode或'default'",
				description:
					'显式mode优先于严格Provider组件默认；default显示窗口页码，simple提供原生页码输入，compact只显示本地化页码状态。'
			},
			onPageChange: {
				default: '—',
				description: '仅用户页码操作调用；外部总数收缩导致的静默夹紧会写回binding但不伪造事件。'
			},
			onPageSizeChange: {
				default: '—',
				description: '用户选择新页尺寸时调用一次；若页码越界，再独立调用onPageChange。'
			},
			page: {
				default: 'undefined',
				description: '从1开始的Svelte bindable页码，适合URL、query/cache或服务端owner。'
			},
			pageSize: {
				default: 'undefined（内部10）',
				description: 'totalItems模式的Svelte bindable正整数页尺寸。'
			},
			pageSizeOptions: {
				default: 'undefined',
				description: '提供后才显示原生select；所有值必须为唯一正整数，外部自定义当前值会自动加入。'
			},
			ref: { default: 'null', description: '真实nav引用，用于聚焦、测量或宿主集成。' },
			siblingCount: {
				default: '1',
				description: 'default模式当前页两侧显示的非负页码数量。'
			},
			totalItems: {
				default: 'undefined',
				description: '非负数据总量，与pageSize推导至少一页；组件不会据此发请求、筛选或持有行数据。'
			},
			totalPages: {
				default: '1（未传totalItems时）',
				description: '兼容已完成分页计算的owner；必须是正整数，且不能同时传totalItems或页尺寸API。'
			}
		},
		summary:
			'生产分页导航：用互斥totalPages/totalItems合同避免双重总量事实，提供受控页尺寸、三种呈现、RTL和动态焦点恢复，但把请求、URL、筛选与DataTable状态留给调用方owner。'
	},
	demos: [
		{
			component: InteractiveDemo,
			covers: ['controlled', 'focus', 'keyboard', 'variants-and-states'],
			description: '外部owner可跳页或动态收缩总页数；组件写回合法页码但只为真实用户操作发出回调。',
			id: 'pagination-interactive',
			source: interactiveSource,
			title: '受控页码与动态边界'
		},
		{
			component: PageSizeDemo,
			covers: ['controlled', 'locale', 'native-props'],
			description:
				'totalItems与bind:pageSize推导唯一总页数；原生select改变页尺寸并在需要时夹紧页码。',
			id: 'pagination-page-size',
			source: pageSizeSource,
			title: '总条数与每页条数'
		},
		{
			component: ModesDemo,
			covers: ['accessible-name', 'controlled', 'keyboard', 'rtl'],
			description: 'simple适合直接跳页，compact适合窄表面；RTL同步逻辑顺序、Lucide图标和方向键。',
			id: 'pagination-modes',
			source: modesSource,
			title: 'Simple、Compact与RTL'
		},
		{
			component: ServerOwnerDemo,
			covers: ['composition', 'controlled', 'variants-and-states'],
			description:
				'调用方组合筛选、切片、DataTable和Pagination；Pagination不拥有请求或表格数据状态。',
			id: 'pagination-server-owner',
			source: serverOwnerSource,
			title: 'DataTable与服务端Owner边界'
		},
		{
			component: RangesDemo,
			covers: ['disabled', 'uncontrolled', 'variants-and-states'],
			description: '少量页、大边界窗口与整体禁用覆盖MUI式页码范围，同时说明未照搬的高成本扩展。',
			id: 'pagination-ranges',
			source: rangesSource,
			title: '页数规模、禁用与能力取舍'
		}
	],
	accessibility: [
		'根节点使用带Provider本地化名称的nav；按钮、number input和select全部保留原生语义。',
		'当前页使用aria-current=page并获得独立本地化名称；前后页在边界使用原生disabled。',
		'Tab保持所有操作控件可达；页码按钮额外支持ArrowLeft/ArrowRight/Home/End，RTL按视觉方向反转。',
		'simple输入通过min/max、可访问名称和aria-valuetext表达当前页与总页数，Escape恢复当前合法值。',
		'动态总页数移除当前聚焦按钮时，焦点恢复到夹紧后的当前页或首个可用边界控件。',
		'禁用状态不隐藏当前页、总页数或总条数，辅助技术仍可读取数据位置。'
	],
	keywords: [
		'pagination',
		'page size',
		'total items',
		'simple',
		'compact',
		'rtl',
		'keyboard',
		'data table',
		'server controlled'
	]
});
