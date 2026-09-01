import { textMetadata } from '@zadmin/zui/metadata';
import SemanticsDemo from './SemanticsDemo.svelte';
import semanticsSource from './SemanticsDemo.svelte?raw';
import ElementsDemo from './ElementsDemo.svelte';
import elementsSource from './ElementsDemo.svelte?raw';
import LineHeightDemo from './LineHeightDemo.svelte';
import lineHeightSource from './LineHeightDemo.svelte?raw';
import NumbersDemo from './NumbersDemo.svelte';
import numbersSource from './NumbersDemo.svelte?raw';
import OverflowDemo from './OverflowDemo.svelte';
import overflowSource from './OverflowDemo.svelte?raw';
import { textApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const textDoc = defineComponentDoc(textMetadata, {
	profiles: ['primitive'],
	sourceApi: textApiFacts,
	teaching: {
		props: {
			as: { default: "'span'", description: '选择有限集合中的真实文本语义元素。' },
			lineClamp: {
				default: 'undefined',
				description: '使用正整数限制可见行数；与truncate互斥，非法组合立即抛错。'
			},
			lineHeight: { default: "'normal'", description: '使用Theme行高token。' },
			ref: { default: 'null', description: '绑定最终渲染的真实HTMLElement。' },
			size: { default: "'medium'", description: '使用Theme字号token。' },
			tabularNumbers: {
				default: 'false',
				description: '启用tabular-nums；不负责数字格式化或本地化。'
			},
			tone: { default: "'default'", description: '设置语义文本颜色，不改变元素语义。' },
			truncate: {
				default: 'false',
				description: '在调用方提供可收缩宽度时应用单行省略。'
			},
			weight: { default: "'normal'", description: '使用Theme字重token。' }
		},
		summary: '把正文语义元素与字号、行高、字重、tone、单/多行省略和表格数字保持正交的文本原语。'
	},
	demos: [
		{
			covers: ['basic-render', 'native-props', 'variants-and-states'],
			component: SemanticsDemo,
			description: 'as决定真实元素；size、weight和tone只影响视觉。',
			id: 'text-semantics',
			source: semanticsSource,
			title: '语义与视觉'
		},
		{
			covers: ['composition', 'native-props'],
			component: ElementsDemo,
			description: 'p、strong、small和label由as选择真实语义，视觉轴保持独立。',
			id: 'text-elements',
			source: elementsSource,
			title: '真实文本元素'
		},
		{
			covers: ['native-props', 'variants-and-states'],
			component: OverflowDemo,
			description: 'truncate处理单行，lineClamp处理多行；二者互斥且都要求调用方拥有布局宽度。',
			id: 'text-overflow',
			source: overflowSource,
			title: '单行与多行省略'
		},
		{
			covers: ['basic-render', 'native-props', 'variants-and-states'],
			component: NumbersDemo,
			description: 'tabular-nums稳定指标列字形宽度，但不替代Intl格式化。',
			id: 'text-tabular-numbers',
			source: numbersSource,
			title: '表格数字'
		},
		{
			covers: ['composition', 'variants-and-states'],
			component: LineHeightDemo,
			description: 'compact、normal和relaxed使用Theme行高token，不改变真实元素。',
			id: 'text-line-height',
			source: lineHeightSource,
			title: '正文行高节奏'
		}
	],
	accessibility: [
		'视觉tone、size、weight和lineHeight都不会改变真实元素。',
		'truncate与lineClamp只裁剪视觉呈现；辅助技术仍读取完整文本，关键内容不能只依赖被裁剪区域。',
		'组件不自动生成Tooltip或展开按钮；需要交互式完整内容时由调用方显式组合。',
		'标题必须使用ZHeading的真实h1–h6，不能用放大的ZText伪造文档层级。'
	]
});
