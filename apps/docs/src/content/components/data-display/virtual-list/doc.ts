import { virtualListMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import InitialPositionDemo from './InitialPositionDemo.svelte';
import initialPositionSource from './InitialPositionDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const virtualListDoc = defineComponentDoc(virtualListMetadata, {
	demos: [
		{
			component: FormDemo,
			description: '一万条记录只渲染viewport与overscan窗口。',
			id: 'virtual-list-large',
			source,
			title: '固定项高窗口化'
		},
		{
			component: InitialPositionDemo,
			description: 'initialIndex直接定位深处记录，并用较小overscan限制DOM数量。',
			id: 'virtual-list-initial-position',
			source: initialPositionSource,
			title: '初始定位与Overscan'
		}
	],
	accessibility: [
		'viewport使用具名list，可见项保留listitem、aria-posinset和aria-setsize。',
		'itemKey必须来自稳定业务key，排序与过滤后不使用数组索引替代。',
		'当前公共合同刻意限定固定itemSize；可变高度测量在拥有真实消费者前不加入。',
		'虚拟化会减少可访问树节点，搜索与完整导出应由应用提供非虚拟路径。'
	],
	keywords: ['virtual list', 'virtualizer', 'overscan', 'large data']
});
