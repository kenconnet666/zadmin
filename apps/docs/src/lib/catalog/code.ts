import { codeMetadata } from '@zadmin/zui/metadata';
import CodeHighlightDemo from '../demos/CodeHighlightDemo.svelte';
import codeHighlightSource from '../demos/CodeHighlightDemo.svelte?raw';
import { defineComponentDoc } from './types.js';

export const codeDoc = defineComponentDoc(codeMetadata, {
	demos: [
		{
			component: CodeHighlightDemo,
			description: 'SSR先输出纯文本，客户端按需加载Shiki并安全渲染tokens。',
			id: 'code-highlight',
			source: codeHighlightSource,
			title: '按需语法高亮'
		}
	],
	accessibility: [
		'源码始终保留为可选择和复制的文本。',
		'行号为装饰内容，不进入可访问名称。',
		'未知语言或高亮失败时回退纯文本。'
	]
});
