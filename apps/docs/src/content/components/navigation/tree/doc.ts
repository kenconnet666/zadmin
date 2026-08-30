import { treeMetadata } from '@zadmin/zui/metadata';
import InteractiveDemo from './InteractiveDemo.svelte';
import source from './InteractiveDemo.svelte?raw';
import LargeDemo from './LargeDemo.svelte';
import largeSource from './LargeDemo.svelte?raw';
import MultipleDemo from './MultipleDemo.svelte';
import multipleSource from './MultipleDemo.svelte?raw';
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
		},
		{
			component: LargeDemo,
			description: '五千个平级节点只渲染viewport与overscan，End仍把焦点送到全局最后节点。',
			id: 'tree-virtual',
			source: largeSource,
			title: '大数据Tree'
		},
		{
			component: MultipleDemo,
			description: 'bare外观保留完整tree语义，多选状态同步FormData并在原生reset后恢复默认集合。',
			id: 'tree-multiple-bare',
			source: multipleSource,
			title: '裸样式多选与表单'
		}
	],
	accessibility: [
		'Root使用tree，节点使用treeitem及level/posinset/setsize/expanded/selected完整层级语义。',
		'Right展开或进入子节点，Left折叠或返回父节点，Up/Down/Home/End只遍历可见enabled节点。',
		'virtualized使用固定itemSize与共享Virtualizer，键盘目标离开窗口时先滚动再聚焦。'
	],
	keywords: ['tree', 'virtual tree', 'large data', 'selection', 'typeahead']
});
