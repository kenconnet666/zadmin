import { dataTableMetadata } from '@zadmin/zui/metadata';
import AsyncStatesDemo from './AsyncStatesDemo.svelte';
import asyncStatesSource from './AsyncStatesDemo.svelte?raw';
import BoundaryDemo from './BoundaryDemo.svelte';
import boundarySource from './BoundaryDemo.svelte?raw';
import CompactDemo from './CompactDemo.svelte';
import compactSource from './CompactDemo.svelte?raw';
import FormDemo from './FormDemo.svelte';
import virtualSource from './FormDemo.svelte?raw';
import ExpansionDemo from './ExpansionDemo.svelte';
import expansionSource from './ExpansionDemo.svelte?raw';
import SelectionDemo from './SelectionDemo.svelte';
import selectionSource from './SelectionDemo.svelte?raw';
import ServerControlledDemo from './ServerControlledDemo.svelte';
import serverControlledSource from './ServerControlledDemo.svelte?raw';
import { dataTableApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const dataTableDoc = defineComponentDoc(dataTableMetadata, {
	sourceApi: dataTableApiFacts,
	profiles: ['collection', 'data-view', 'virtualized'],
	teaching: {
		props: {
			caption: {
				default: '必填',
				description: '表格的可访问名称；视觉隐藏但必须描述当前数据集合。'
			},
			columns: {
				default: '必填',
				description:
					'稳定列模型；每列提供id、header、accessor，并可选择sortable、compare、width与cell Snippet。'
			},
			defaultColumnVisibility: {
				default: '{}',
				description: '非受控列可见性初值；稀疏record只需写例外，缺失列回退到column.defaultHidden。'
			},
			defaultColumnWidths: {
				default: '{}',
				description: '非受控列宽初值；记录用户调整后的有限正数像素宽度。'
			},
			defaultExpandedKeys: {
				default: '[]',
				description: '非受控展开行初值；使用和rowKey相同的typed业务key。'
			},
			defaultSelectedKeys: {
				default: '[]',
				description: '非受控选择初值；rowKey在排序和数据更新后仍用于保持业务身份。'
			},
			defaultSort: {
				default: 'undefined',
				description: '非受控初始排序描述；列必须存在且声明sortable。'
			},
			density: {
				default: "'comfortable'",
				description: '传给底层ZTable的行密度；大数据和高频操作界面可显式使用compact。'
			},
			emptyLabel: {
				default: "'No rows'",
				description: 'rows为空时跨全部列显示的文案；生产应用应提供本地化且有行动含义的文本。'
			},
			expandedRowEstimate: {
				default: '96',
				description: '虚拟模式在详情首次测量前使用的像素估值；ResizeObserver随后按typed key校正。'
			},
			expansionLabel: {
				default: "(_row, expanded) => expanded ? 'Collapse row details' : 'Expand row details'",
				description: '逐行展开按钮的本地化可访问名称生成器。'
			},
			height: {
				default: '320',
				description: 'virtualized=true时滚动viewport的固定像素高度。'
			},
			isRowDisabled: {
				default: '() => false',
				description: '禁止指定行参与选择；行内容仍保持可阅读和可排序。'
			},
			isRowExpandable: {
				default: '() => true',
				description: '在提供expandedRow后，按行控制是否显示展开按钮。'
			},
			loadingLabel: {
				default: "'Loading rows'",
				description: '默认Spinner的可访问加载名称；生产应用应本地化。'
			},
			overscan: {
				default: '4',
				description: '虚拟窗口前后额外渲染的行数，用于平衡滚动稳定性与DOM数量。'
			},
			rowHeight: {
				default: '44',
				description:
					'虚拟模式首次渲染的行高估值；真实主行和展开详情由owner-realm ResizeObserver按key测量。'
			},
			rowIndexOffset: {
				default: '0',
				description: '服务端分页当前快照之前的数据行数，用于生成全局aria-rowindex。'
			},
			rowKey: {
				default: '必填',
				description: '返回稳定且唯一的业务key；禁止使用会随排序或分页变化的数组index。'
			},
			rows: {
				default: '必填',
				description:
					'当前由调用方提供的数据快照；筛选、分页、请求、缓存和URL生命周期不由DataTable隐式持有。'
			},
			resizeLabel: {
				default: '(column) => `Resize ${column.header} column`',
				description: '可聚焦列分隔线的本地化名称；支持pointer与方向键调整。'
			},
			selectAllLabel: {
				default: "'Select all rows'",
				description: '多选表头checkbox的可访问名称；仅操作当前rows中的非禁用行。'
			},
			selectionLabel: {
				default: '(_row, index) => `Select row ${index + 1}`',
				description: '逐行checkbox/radio的可访问名称生成器；应包含业务可识别信息。'
			},
			selectionMode: {
				default: "'none'",
				description: '关闭选择、单选radio或多选checkbox；选择状态支持受控与非受控模式。'
			},
			ssrViewportSize: {
				default: 'height',
				description: 'SSR首屏窗口估算高度，让服务端输出保持有界且与客户端首屏接近。'
			},
			striped: {
				default: 'false',
				description: '使用底层ZTable斑马纹增强宽表逐行扫描。'
			},
			totalRowCount: {
				default: 'rowIndexOffset + rows.length',
				description: '服务端分页或增量数据的全局数据行数，用于aria-rowcount。'
			},
			virtualized: {
				default: 'false',
				description: '启用固定行高窗口化；保留aria-rowcount和aria-rowindex表达全局位置。'
			}
		},
		summary:
			'面向后台数据浏览的原生语义DataTable，负责稳定排序、行选择、自定义cell和可选固定行高虚拟化；请求、筛选、分页与异步状态由调用方组合。' +
			'DataQuery可作为外部owner与ZPagination组合的纯序列化查询描述，不持有请求或缓存。'
	},
	demos: [
		{
			component: SelectionDemo,
			covers: ['accessible-name', 'basic-render', 'controlled', 'keyboard', 'variants-and-states'],
			description: '小数据集组合稳定排序、多选、全选和受控状态回显，是常规后台清单的起点。',
			id: 'data-table-selection',
			source: selectionSource,
			title: '基础排序与选择'
		},
		{
			component: FormDemo,
			covers: ['controlled', 'focus', 'resource-cleanup', 'ssr', 'variants-and-states'],
			description:
				'一千行只挂载当前窗口；typed-key锚点在顶部插入后保留位置，控制器可滚动并恢复行控件焦点。',
			id: 'data-table-virtual',
			source: virtualSource,
			title: '固定高度虚拟大数据'
		},
		{
			component: AsyncStatesDemo,
			covers: ['accessible-name', 'composition', 'loading', 'variants-and-states'],
			description:
				'组件负责aria-busy、Spinner、Alert和Empty表面，同时保留旧rows；请求、重试和缓存仍由外部owner持有。',
			id: 'data-table-async-states',
			source: asyncStatesSource,
			title: '加载、空数据与错误'
		},
		{
			component: ServerControlledDemo,
			covers: ['composition', 'controlled', 'locale'],
			description:
				'外部owner组合筛选、受控sort与Pagination，并只把当前页rows交给DataTable；组件本身不发请求。',
			id: 'data-table-server-owner',
			source: serverControlledSource,
			title: '服务端所有权组合'
		},
		{
			component: CompactDemo,
			covers: [
				'composition',
				'controlled',
				'density',
				'disabled',
				'keyboard',
				'variants-and-states'
			],
			description:
				'紧凑多选表组合逻辑方向sticky、列可见性、pointer/keyboard列宽调整、ellipsis、自定义cell和禁用行。',
			id: 'data-table-rich-cells',
			source: compactSource,
			title: '长文本、自定义单元格与禁用行'
		},
		{
			component: ExpansionDemo,
			covers: ['accessible-name', 'controlled', 'keyboard', 'variants-and-states'],
			description:
				'受控expandedKeys以typed row key持有详情状态；展开按钮同步aria-expanded与aria-controls。',
			id: 'data-table-expanded-rows',
			source: expansionSource,
			title: '可访问展开行'
		},
		{
			component: BoundaryDemo,
			covers: ['composition'],
			description:
				'对照Ant Table、Naive UI DataTable和MUI X后，明确轻量核心、调用方数据层与未来DataGrid/X轨道的边界。',
			id: 'data-table-boundaries',
			source: boundarySource,
			title: '成熟组件库对照与能力边界'
		}
	],
	accessibility: [
		'底层保持caption/thead/tbody/th/td原生表格；caption是必填可访问名称。',
		'排序只由具名button触发并同步th aria-sort；稳定排序不会打乱相等值。',
		'选择使用原生checkbox/radio；业务rowKey在排序、滚动与动态数据后保持不变。',
		'展开按钮同步aria-expanded/aria-controls；详情行与主行共享typed key测量。',
		'禁用行只退出选择操作，数据内容仍可被阅读；逐行和全选控件需要本地化名称。',
		'虚拟模式通过aria-rowcount/aria-rowindex保留全局位置，并按key测量动态主行与详情行。',
		'列宽separator支持pointer、ArrowLeft/ArrowRight、Home/End并公开aria-valuenow。',
		'loading/error只表达当前表面；请求、重试、筛选、分页和缓存仍由外部owner持有。',
		'DataTable不声明grid角色，也不截获单元格方向键；交互控件继续使用原生Tab顺序。'
	],
	keywords: [
		'data table',
		'sort',
		'selection',
		'virtualization',
		'server controlled',
		'pagination',
		'filter',
		'custom cell',
		'loading',
		'empty',
		'error',
		'disabled row',
		'expanded row',
		'column visibility',
		'column resize',
		'sticky header'
	]
});
