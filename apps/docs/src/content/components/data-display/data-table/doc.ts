import { dataTableMetadata } from '@zadmin/zui/metadata';
import AsyncStatesDemo from './AsyncStatesDemo.svelte';
import asyncStatesSource from './AsyncStatesDemo.svelte?raw';
import BoundaryDemo from './BoundaryDemo.svelte';
import boundarySource from './BoundaryDemo.svelte?raw';
import CompactDemo from './CompactDemo.svelte';
import compactSource from './CompactDemo.svelte?raw';
import FormDemo from './FormDemo.svelte';
import virtualSource from './FormDemo.svelte?raw';
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
		omitMetadataProps: ['rowHeight / height'],
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
				description:
					'rows为空时跨全部列显示的文案；生产应用应提供本地化且有行动含义的文本。'
			},
			height: {
				default: '320',
				description: 'virtualized=true时滚动viewport的固定像素高度。'
			},
			isRowDisabled: {
				default: '() => false',
				description: '禁止指定行参与选择；行内容仍保持可阅读和可排序。'
			},
			overscan: {
				default: '4',
				description: '虚拟窗口前后额外渲染的行数，用于平衡滚动稳定性与DOM数量。'
			},
			rowHeight: {
				default: '44',
				description: '虚拟模式的固定像素行高；含可变高度内容时不要启用当前虚拟化。'
			},
			rowKey: {
				default: '必填',
				description: '返回稳定且唯一的业务key；禁止使用会随排序或分页变化的数组index。'
			},
			rows: {
				default: '必填',
				description:
					'当前由调用方提供的数据快照；筛选、分页和请求生命周期不由DataTable隐式持有。'
			},
			selectAllLabel: {
				default: "'Select all rows'",
				description: '多选表头checkbox的可访问名称；仅操作当前rows中的非禁用行。'
			},
			selectionLabel: {
				default: "(_row, index) => `Select row ${index + 1}`",
				description: '逐行checkbox/radio的可访问名称生成器；应包含业务可识别信息。'
			},
			selectionMode: {
				default: "'none'",
				description: '关闭选择、单选radio或多选checkbox；选择状态支持受控与非受控模式。'
			},
			striped: {
				default: 'false',
				description: '使用底层ZTable斑马纹增强宽表逐行扫描。'
			},
			virtualized: {
				default: 'false',
				description: '启用固定行高窗口化；保留aria-rowcount和aria-rowindex表达全局位置。'
			}
		},
		summary:
			'面向后台数据浏览的原生语义DataTable，负责稳定排序、行选择、自定义cell和可选固定行高虚拟化；请求、筛选、分页与异步状态由调用方组合。'
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
			covers: ['controlled', 'resource-cleanup', 'variants-and-states'],
			description:
				'一千行共享稳定sort、selection与固定rowHeight虚拟窗口；滚动容器高度保持确定。',
			id: 'data-table-virtual',
			source: virtualSource,
			title: '固定高度虚拟大数据'
		},
		{
			component: AsyncStatesDemo,
			covers: ['accessible-name', 'composition', 'loading', 'variants-and-states'],
			description:
				'loading、error和重试由调用方用Skeleton/Alert组合；DataTable只负责ready与empty数据表面。',
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
			covers: ['composition', 'density', 'disabled', 'variants-and-states'],
			description:
				'紧凑多选表展示列宽、长文本、自定义cell Snippet和不可选择行，而不改变行内容语义。',
			id: 'data-table-rich-cells',
			source: compactSource,
			title: '长文本、自定义单元格与禁用行'
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
		'禁用行只退出选择操作，数据内容仍可被阅读；逐行和全选控件需要本地化名称。',
		'虚拟模式通过aria-rowcount/aria-rowindex保留全局位置，并要求固定rowHeight。',
		'loading和error由外部live region表达，避免把请求生命周期隐式塞进表格状态机。'
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
		'disabled row'
	]
});
