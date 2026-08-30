import { cascaderMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import StatesDemo from './StatesDemo.svelte';
import statesSource from './StatesDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
export const cascaderDoc = defineComponentDoc(cascaderMetadata, {
	demos: [
		{
			component: FormDemo,
			description: '父节点推进下一列，叶节点才提交完整path并关闭，Trigger显示完整标签路径。',
			id: 'cascader-path',
			source,
			title: '逐级路径选择'
		},
		{
			component: StatesDemo,
			description: '空值placeholder、自定义分隔符与禁用完整路径保持一致。',
			id: 'cascader-states',
			source: statesSource,
			title: '占位与禁用状态'
		}
	],
	accessibility: [
		'每一级是独立命名listbox，节点是option并以aria-selected表示当前草稿路径。',
		'Up/Down/Home/End在同列移动，Right进入子列，Left返回父列，Enter推进或提交。',
		'value始终是完整有序路径；表单序列化可配置，reset恢复defaultValue。'
	]
});
