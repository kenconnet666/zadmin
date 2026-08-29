import { textMetadata } from '@zadmin/zui/metadata';
import SemanticsDemo from './SemanticsDemo.svelte';
import semanticsSource from './SemanticsDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const textDoc = defineComponentDoc(textMetadata, {
	demos: [
		{
			component: SemanticsDemo,
			description: 'as决定真实元素；size、weight和tone只影响视觉。',
			id: 'text-semantics',
			source: semanticsSource,
			title: '语义与视觉'
		}
	],
	accessibility: ['视觉tone不会改变真实元素。', '需要标题时继续使用原生h1–h6。']
});
