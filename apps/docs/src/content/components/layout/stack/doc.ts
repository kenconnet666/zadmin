import { stackMetadata } from '@zadmin/zui/metadata';
import LayoutDemo from './LayoutDemo.svelte';
import layoutSource from './LayoutDemo.svelte?raw';
import AlignmentDemo from './AlignmentDemo.svelte';
import alignmentSource from './AlignmentDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const stackDoc = defineComponentDoc(stackMetadata, {
	demos: [
		{
			component: LayoutDemo,
			description: '切换direction，观察真实Flex布局与稳定gap token。',
			id: 'stack-layout',
			source: layoutSource,
			title: '方向与间距'
		},
		{
			component: AlignmentDemo,
			description: '对齐、分布和数值gap直接映射到Flex与作用域变量。',
			id: 'stack-alignment',
			source: alignmentSource,
			title: '对齐与分布'
		}
	],
	accessibility: ['保持div原生语义。', '不会因视觉方向变化重排DOM或键盘顺序。']
});
