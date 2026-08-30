import { transferMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import StatesDemo from './StatesDemo.svelte';
import statesSource from './StatesDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const transferDoc = defineComponentDoc(transferMetadata, {
	demos: [
		{
			component: FormDemo,
			description: '两侧独立过滤和多选；disabled项目不能移动，目标key以重复隐藏字段提交。',
			id: 'transfer-filter',
			source,
			title: '过滤与双向转移'
		},
		{
			component: StatesDemo,
			description: '关闭过滤与禁用整个Transfer覆盖精简和只读业务场景。',
			id: 'transfer-states',
			source: statesSource,
			title: '无筛选与禁用状态'
		}
	],
	accessibility: [
		'每侧是命名的aria-multiselectable listbox；方向键、Home/End和typeahead只在enabled项目间移动。',
		'Ctrl/Meta+A只选择当前过滤结果，移动后按items顺序生成确定的目标value。',
		'过滤只改变可见集合，不丢失已选key；表单reset同时恢复defaultValue并清空过滤与临时勾选。'
	],
	keywords: ['transfer', 'dual list', 'multiple selection', 'filter', 'form']
});
