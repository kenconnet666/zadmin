import { textMetadata } from '@zadmin/zui/metadata';
import SemanticsDemo from './SemanticsDemo.svelte';
import semanticsSource from './SemanticsDemo.svelte?raw';
import ElementsDemo from './ElementsDemo.svelte';
import elementsSource from './ElementsDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const textDoc = defineComponentDoc(textMetadata, {
	demos: [
		{
			component: SemanticsDemo,
			description: 'as决定真实元素；size、weight和tone只影响视觉。',
			id: 'text-semantics',
			source: semanticsSource,
			title: '语义与视觉'
		},
		{
			component: ElementsDemo,
			description: 'p、strong、small和label由as选择真实语义，视觉轴保持独立。',
			id: 'text-elements',
			source: elementsSource,
			title: '真实文本元素'
		}
	],
	accessibility: ['视觉tone不会改变真实元素。', '需要标题时继续使用原生h1–h6。']
});
