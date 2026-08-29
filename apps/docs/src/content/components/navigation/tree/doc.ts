import { treeMetadata } from '@zadmin/zui/metadata';
import InteractiveDemo from './InteractiveDemo.svelte';
import source from './InteractiveDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
export const treeDoc = defineComponentDoc(treeMetadata, {
	demos: [
		{
			component: InteractiveDemo,
			description:
				'扁平nodes经TreeIndex验证并投影为可见treeitems，展开、选择、typeahead与表单共享稳定key。',
			id: 'tree-navigation',
			source,
			title: '展开与键盘导航'
		}
	],
	accessibility: [
		'Root使用tree，节点使用treeitem及level/posinset/setsize/expanded/selected完整层级语义。',
		'Right展开或进入子节点，Left折叠或返回父节点，Up/Down/Home/End只遍历可见enabled节点。',
		'当前阶段面向静态和中等数据；虚拟化大数据树在S8基于同一TreeIndex扩展。'
	]
});
