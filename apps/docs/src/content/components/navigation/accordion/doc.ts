import {
	accordionContentMetadata,
	accordionItemMetadata,
	accordionMetadata,
	accordionTriggerMetadata
} from '@zadmin/zui/metadata';
import InteractiveDemo from './InteractiveDemo.svelte';
import interactiveSource from './InteractiveDemo.svelte?raw';
import MultipleDemo from './MultipleDemo.svelte';
import multipleSource from './MultipleDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const accordionDoc = defineComponentDoc(accordionMetadata, {
	members: [accordionItemMetadata, accordionTriggerMetadata, accordionContentMetadata],
	demos: [
		{
			component: InteractiveDemo,
			description: 'single状态、roving focus、disabled跳过与退出Presence共享同一Item合同。',
			id: 'accordion-interactive',
			source: interactiveSource,
			title: '展开与生命周期'
		},
		{
			component: MultipleDemo,
			description: 'multiple模式允许独立展开；loop=false夹紧Trigger焦点。',
			id: 'accordion-multiple',
			source: multipleSource,
			title: '多项展开与导航边界'
		}
	],
	accessibility: [
		'Trigger使用原生button与aria-expanded/aria-controls，Content使用region与aria-labelledby。',
		'ArrowUp、ArrowDown、Home和End在Trigger间移动并跳过disabled。',
		'关闭时Content进入inert退出阶段，动画结束后卸载；reduced motion立即卸载。'
	]
});
