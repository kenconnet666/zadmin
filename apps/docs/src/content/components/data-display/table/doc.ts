import { tableMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import CompactDemo from './CompactDemo.svelte';
import compactSource from './CompactDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const tableDoc = defineComponentDoc(tableMetadata, {
	demos: [
		{
			component: FormDemo,
			description: '调用方直接提供原生tr/th/td，Table只提供结构壳与视觉。',
			id: 'table-native',
			source,
			title: '原生表格'
		},
		{
			component: CompactDemo,
			description: '紧凑密度和tfoot适合高信息密度汇总表。',
			id: 'table-compact',
			source: compactSource,
			title: '紧凑表格与汇总'
		}
	],
	accessibility: [
		'caption为必填表格名称；captionHidden只做视觉隐藏。',
		'列标题和行标题仍由调用方使用th与scope明确表达。',
		'排序、选择和虚拟化属于ZDataTable，不向ZTable加入隐式数据模型。'
	],
	keywords: ['table', 'caption', 'thead', 'tbody', 'semantic']
});
