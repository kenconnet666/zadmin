import { tableMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const tableDoc = defineComponentDoc(tableMetadata, {
	demos: [
		{
			component: FormDemo,
			description: '调用方直接提供原生tr/th/td，Table只提供结构壳与视觉。',
			id: 'table-native',
			source,
			title: '原生表格'
		}
	],
	accessibility: [
		'caption为必填表格名称；captionHidden只做视觉隐藏。',
		'列标题和行标题仍由调用方使用th与scope明确表达。',
		'排序、选择和虚拟化属于ZDataTable，不向ZTable加入隐式数据模型。'
	],
	keywords: ['table', 'caption', 'thead', 'tbody', 'semantic']
});
