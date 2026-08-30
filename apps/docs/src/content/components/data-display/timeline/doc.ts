import { timelineMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const timelineDoc = defineComponentDoc(timelineMetadata, {
	demos: [
		{
			component: FormDemo,
			description: '发布事件保持有序列表、状态与机器可读时间。',
			id: 'timeline-release',
			source,
			title: '发布历程'
		}
	],
	accessibility: [
		'根是具名ol，每个事件始终是li；marker仅装饰。',
		'存在机器时间时以datetime传给原生time，显示文案可本地化。',
		'自定义item snippet只替换li正文，不破坏列表顺序和状态属性。'
	],
	keywords: ['timeline', 'ol', 'time', 'status']
});
