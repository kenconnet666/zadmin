import { treeSelectMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import StatesDemo from './StatesDemo.svelte';
import statesSource from './StatesDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
export const treeSelectDoc = defineComponentDoc(treeSelectMetadata, {
	demos: [
		{
			component: FormDemo,
			description: 'Trigger显示节点标签，Popup复用完整ZTree层级键盘，选择后关闭并提交稳定key。',
			id: 'tree-select-form',
			source,
			title: '树节点选择'
		},
		{
			component: StatesDemo,
			description: '空值placeholder、初始展开和禁用稳定值继续复用Tree键盘。',
			id: 'tree-select-states',
			source: statesSource,
			title: '空值、展开与禁用'
		}
	],
	accessibility: [
		'Trigger使用aria-haspopup=tree；Popup内部直接复用ZTree，不复制树键盘算法。',
		'选择节点后关闭并恢复Trigger，Escape只dismiss不改变值。',
		'name提交稳定key，reset同时恢复value与expandedKeys。'
	]
});
