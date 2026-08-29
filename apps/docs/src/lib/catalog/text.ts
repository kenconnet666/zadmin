import SemanticsDemo from '../demos/text/SemanticsDemo.svelte';
import semanticsSource from '../demos/text/SemanticsDemo.svelte?raw';
import { defineComponentDoc } from './types.js';

export const textDoc = defineComponentDoc({
	id: 'text',
	category: 'gene',
	name: 'ZText',
	summary: '在有限语义元素集合上应用字号、字重、tone和截断，不用视觉variant改变语义。',
	importStatement: "import { ZText } from '@zadmin/zui';",
	source: 'ui/zui/src/lib/components/gene/ZText.svelte',
	demos: [
		{
			id: 'text-semantics',
			title: '语义与视觉',
			description: 'as决定真实元素；size、weight和tone只影响视觉。',
			component: SemanticsDemo,
			source: semanticsSource
		}
	],
	api: [
		{
			title: 'Props',
			rows: [
				{
					name: 'as',
					type: "'label' | 'p' | 'small' | 'span' | 'strong'",
					default: "'span'",
					description: '有限的真实语义元素。'
				},
				{
					name: 'size',
					type: "keyof ZuiTheme['fontSize']",
					default: "'medium'",
					description: 'Theme字号token。'
				},
				{
					name: 'weight',
					type: "keyof ZuiTheme['fontWeight']",
					default: "'regular'",
					description: 'Theme字重token。'
				},
				{
					name: 'tone',
					type: "'default' | 'muted' | 'primary' | 'danger'",
					default: "'default'",
					description: '语义颜色。'
				},
				{ name: 'truncate', type: 'boolean', default: 'false', description: '单行省略显示。' },
				{
					name: 'ref',
					type: 'HTMLElement | null',
					default: 'null',
					description: '真实文本元素引用。'
				}
			]
		}
	],
	accessibility: [
		'视觉tone不会改变真实元素。',
		'需要标题时继续使用原生h1–h6，而不是伪造文本variant。'
	]
});
