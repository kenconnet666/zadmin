import { codeMetadata } from '@zadmin/zui/metadata';
import HighlightDemo from './HighlightDemo.svelte';
import highlightSource from './HighlightDemo.svelte?raw';
import InlineDemo from './InlineDemo.svelte';
import inlineSource from './InlineDemo.svelte?raw';
import SchemeDemo from './SchemeDemo.svelte';
import schemeSource from './SchemeDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const codeDoc = defineComponentDoc(codeMetadata, {
	demos: [
		{
			component: HighlightDemo,
			description: 'SSR先输出纯文本，客户端按需加载Shiki并安全渲染tokens。',
			id: 'code-highlight',
			source: highlightSource,
			title: '按需语法高亮'
		},
		{
			component: InlineDemo,
			description: 'inline、wrap和普通代码块覆盖命令与结构化数据场景。',
			id: 'code-inline',
			source: inlineSource,
			title: '行内与换行代码'
		},
		{
			component: SchemeDemo,
			description: '显式亮暗scheme与theme覆盖Provider，embedded模式嵌入已有ZCard容器。',
			id: 'code-scheme-embedded',
			source: schemeSource,
			title: '主题与嵌入容器'
		}
	],
	accessibility: [
		'源码始终保留为可选择和复制的文本。',
		'行号为装饰内容，不进入可访问名称。',
		'未知语言或高亮失败时回退纯文本。'
	]
});
