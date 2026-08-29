import BasicDemo from '../demos/box/BasicDemo.svelte';
import basicSource from '../demos/box/BasicDemo.svelte?raw';
import { defineComponentDoc } from './types.js';

export const boxDoc = defineComponentDoc({
	id: 'box',
	name: 'ZBox',
	summary: '严格的div容器，用于验证class、style、ref和ICSS变量落到真实根元素。',
	importStatement: "import { ZBox } from '@zadmin/zui';",
	source: 'ui/zui/src/lib/components/box/ZBox.svelte',
	demos: [
		{
			id: 'box-basic',
			title: '真实根元素',
			description: '使用ICSS class为ZBox添加视觉样式，不产生包装层。',
			component: BasicDemo,
			source: basicSource
		}
	],
	api: [
		{
			title: 'Props',
			description: '除下列属性外，ZBox转发适用的HTMLAttributes<HTMLDivElement>。',
			rows: [
				{ name: 'children', type: 'Snippet', default: '—', description: '容器内容。' },
				{
					name: 'ref',
					type: 'HTMLDivElement | null',
					default: 'null',
					description: '支持bind:ref的真实div引用。'
				},
				{
					name: 'class',
					type: 'ClassValue',
					default: '—',
					description: '与组件内部class合并到真实div。'
				},
				{
					name: 'style',
					type: 'string | StyleProperties',
					default: '—',
					description: '转发到真实div。'
				}
			]
		}
	],
	accessibility: ['不伪造role。', '原生aria-*、data-*和事件直接转发到div。']
});
