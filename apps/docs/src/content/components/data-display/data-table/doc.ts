import { dataTableMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const dataTableDoc = defineComponentDoc(dataTableMetadata, {
	demos: [
		{
			component: FormDemo,
			description: '一千行共享稳定sort、selection与固定行高虚拟窗口。',
			id: 'data-table-virtual',
			source,
			title: '虚拟化部署表'
		}
	],
	accessibility: [
		'底层仍是caption/thead/tbody/th/td原生表格；虚拟模式用aria-rowcount和aria-rowindex保留全局位置。',
		'排序只由具名button触发并同步th aria-sort，稳定排序不会打乱相等值。',
		'选择使用原生checkbox/radio；业务rowKey在排序、滚动与动态数据后保持不变。',
		'虚拟化使用固定rowHeight和上下spacer，不把ZTable升级成数据状态容器。'
	],
	keywords: ['data table', 'sort', 'selection', 'virtualization', 'large data']
});
