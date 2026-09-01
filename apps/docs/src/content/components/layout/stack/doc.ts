import { stackMetadata } from '@zadmin/zui/metadata';
import LayoutDemo from './LayoutDemo.svelte';
import layoutSource from './LayoutDemo.svelte?raw';
import AlignmentDemo from './AlignmentDemo.svelte';
import alignmentSource from './AlignmentDemo.svelte?raw';
import { stackApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const stackDoc = defineComponentDoc(stackMetadata, {
	sourceApi: stackApiFacts,
	teaching: {
		props: {
			align: { description: '交叉轴对齐。', default: "'stretch'" },
			direction: { description: 'Flex主轴方向。', default: "'column'" },
			gap: { description: 'Theme间距token或明确px值。', default: "'none'" },
			justify: { description: '主轴分布。', default: "'start'" },
			ref: { description: '真实div引用。', default: 'null' },
			wrap: { description: '是否允许Flex换行。', default: 'false' }
		},
		summary: '类型安全的Flex布局容器，支持方向、间距、对齐、分布和换行。'
	},
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
