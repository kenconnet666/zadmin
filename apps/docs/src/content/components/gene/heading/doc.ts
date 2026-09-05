import { headingMetadata } from '@zadmin/zui/metadata';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
import HierarchyDemo from './HierarchyDemo.svelte';
import hierarchySource from './HierarchyDemo.svelte?raw';
import LevelsDemo from './LevelsDemo.svelte';
import levelsSource from './LevelsDemo.svelte?raw';
import NativeDemo from './NativeDemo.svelte';
import nativeSource from './NativeDemo.svelte?raw';
import VisualScaleDemo from './VisualScaleDemo.svelte';
import visualScaleSource from './VisualScaleDemo.svelte?raw';
import { headingApiFacts } from '../../../../framework/component-api.generated.js';

export const headingDoc = defineComponentDoc(headingMetadata, {
	profiles: ['primitive'],
	sourceApi: headingApiFacts,
	teaching: {
		props: {
			level: { default: '2', description: '唯一决定真实h1–h6元素；必须按文档层级选择。' },
			lineHeight: { default: "'compact'", description: '独立Theme行高token。' },
			ref: { default: 'null', description: '绑定真实HTMLHeadingElement。' },
			size: {
				default: "'xlarge'",
				description: '独立于level的Theme字号token；xxlarge默认32px，用于页面标题。'
			},
			tone: { default: "'default'", description: '语义颜色，不改变heading level。' },
			weight: { default: "'bold'", description: 'Theme字重token。' }
		},
		summary: '始终输出真实h1–h6，并明确分离文档层级与视觉字号、行高、字重、tone。'
	},
	demos: [
		{
			covers: ['accessible-name', 'basic-render', 'native-props'],
			component: LevelsDemo,
			description: 'level 1–6分别渲染真实h1–h6；相同size证明语义和视觉解耦。',
			id: 'heading-levels',
			source: levelsSource,
			title: '真实Heading层级'
		},
		{
			covers: ['variants-and-states'],
			component: VisualScaleDemo,
			description: '同一个h2可使用不同视觉size，视觉层级不能代替文档大纲。',
			id: 'heading-visual-scale',
			source: visualScaleSource,
			title: '独立视觉字号'
		},
		{
			covers: ['composition', 'native-props'],
			component: HierarchyDemo,
			description: '在article/section中按h1→h2→h3建立连续结构，同时自由选择视觉size。',
			id: 'heading-hierarchy',
			source: hierarchySource,
			title: '页面大纲与组合'
		},
		{
			covers: ['accessible-name', 'native-props', 'variants-and-states'],
			component: NativeDemo,
			description: 'id、aria-label及视觉token透传到真实HTMLHeadingElement。',
			id: 'heading-native',
			source: nativeSource,
			title: '原生属性与视觉轴'
		}
	],
	accessibility: [
		'level决定真实h1–h6，不能为了视觉大小跳过或倒置文档层级。',
		'页面通常只有一个描述主要主题的h1；可复用组件应让页面owner决定level。',
		'size、weight、lineHeight和tone只影响视觉，不改变辅助技术读取的大纲。',
		'ZHeading不提供任意as覆盖，从API层阻止视觉组件伪装错误标题语义。'
	],
	keywords: ['heading', 'h1', 'h2', 'document outline', 'typography', 'semantic html']
});
