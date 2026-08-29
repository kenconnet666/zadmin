import LayoutDemo from '../demos/stack/LayoutDemo.svelte';
import layoutSource from '../demos/stack/LayoutDemo.svelte?raw';
import { defineComponentDoc } from './types.js';

export const stackDoc = defineComponentDoc({
	id: 'stack',
	name: 'ZStack',
	summary: '类型安全的Flex布局容器，覆盖方向、间距、对齐、分布和换行。',
	importStatement: "import { ZStack } from '@zadmin/zui';",
	source: 'ui/zui/src/lib/components/stack/ZStack.svelte',
	demos: [
		{
			id: 'stack-layout',
			title: '方向与间距',
			description: '切换direction，观察真实Flex布局与稳定gap token。',
			component: LayoutDemo,
			source: layoutSource
		}
	],
	api: [
		{
			title: 'Props',
			rows: [
				{
					name: 'direction',
					type: "'row' | 'row-reverse' | 'column' | 'column-reverse'",
					default: "'column'",
					description: '主轴方向。'
				},
				{
					name: 'gap',
					type: "keyof ZuiTheme['space'] | number",
					default: "'none'",
					description: 'Theme间距token或明确像素数值。'
				},
				{
					name: 'align',
					type: "'start' | 'center' | 'end' | 'baseline' | 'stretch'",
					default: "'stretch'",
					description: '交叉轴对齐。'
				},
				{
					name: 'justify',
					type: "'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'",
					default: "'start'",
					description: '主轴分布。'
				},
				{ name: 'wrap', type: 'boolean', default: 'false', description: '是否允许Flex换行。' },
				{
					name: 'ref',
					type: 'HTMLDivElement | null',
					default: 'null',
					description: '真实div引用。'
				}
			]
		}
	],
	accessibility: ['保持div原生语义。', '不会因视觉方向变化重排DOM或键盘顺序。']
});
