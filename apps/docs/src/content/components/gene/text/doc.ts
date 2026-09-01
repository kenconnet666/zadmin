import { textMetadata } from '@zadmin/zui/metadata';
import SemanticsDemo from './SemanticsDemo.svelte';
import semanticsSource from './SemanticsDemo.svelte?raw';
import ElementsDemo from './ElementsDemo.svelte';
import elementsSource from './ElementsDemo.svelte?raw';
import { textApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const textDoc = defineComponentDoc(textMetadata, {
	profiles: ['primitive'],
	sourceApi: textApiFacts,
	teaching: {
		props: {
			as: { default: "'span'", description: '选择有限集合中的真实文本语义元素。' },
			ref: { default: 'null', description: '绑定最终渲染的真实HTMLElement。' },
			size: { default: "'medium'", description: '使用Theme字号token。' },
			tone: { default: "'default'", description: '设置语义文本颜色，不改变元素语义。' },
			truncate: {
				default: 'false',
				description: '在调用方提供可收缩宽度时应用单行省略。'
			},
			weight: { default: "'normal'", description: '使用Theme字重token。' }
		},
		summary: '把语义元素与字号、字重、tone和单行截断视觉轴保持正交的文本原语。'
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
		}
	],
	accessibility: ['视觉tone不会改变真实元素。', '需要标题时继续使用原生h1–h6。']
});
