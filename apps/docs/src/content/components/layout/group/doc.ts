import { groupMetadata } from '@zadmin/zui/metadata';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import ResponsiveDemo from './ResponsiveDemo.svelte';
import responsiveSource from './ResponsiveDemo.svelte?raw';
import SizingDemo from './SizingDemo.svelte';
import sizingSource from './SizingDemo.svelte?raw';
import { groupApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const groupDoc = defineComponentDoc(groupMetadata, {
	profiles: ['primitive'],
	sourceApi: groupApiFacts,
	teaching: {
		props: {
			itemSizing: {
				default: "'auto'",
				description:
					'唯一的直接子项宽度轴：auto保留内容尺寸，grow使用flex: 1 1 auto，equal使用flex: 1 1 0。'
			},
			preventGrowOverflow: {
				default: 'true',
				description: '直接子项可在其min-content宽度之下收缩；子项内部仍要自行换行或截断。'
			},
			ref: { default: 'null', description: '真实固定row div引用。' }
		},
		summary:
			'固定row的ZStack便利层，保留普通children顺序，提供响应式间距/对齐/换行以及唯一itemSizing轴的auto、grow、equal直接子项宽度策略。'
	},
	demos: [
		{
			component: BasicDemo,
			covers: ['basic-render', 'composition', 'native-props'],
			description: '标题与操作保持一行真实DOM顺序，Group只负责row布局。',
			id: 'group-basic',
			source: basicSource,
			title: '固定Row操作组'
		},
		{
			component: SizingDemo,
			covers: ['composition', 'native-props', 'variants-and-states'],
			description: 'itemSizing在单一闭合集合中选择grow或equal，各自拥有确定的flex basis。',
			id: 'group-sizing',
			source: sizingSource,
			title: '直接子项宽度策略'
		},
		{
			component: ResponsiveDemo,
			covers: ['composition', 'native-props', 'rtl', 'ssr'],
			description: '断点只生成CSS；长内容仍由子项的换行策略拥有。',
			id: 'group-responsive',
			source: responsiveSource,
			title: '响应式对齐与换行'
		}
	],
	accessibility: [
		'根保持div语义；需要toolbar、list、navigation或group名称时由调用方选择对应语义元素或role。',
		'Group永远是row布局。itemSizing、wrap和RTL只改变视觉布局，绝不重排DOM、阅读或Tab顺序。',
		'preventGrowOverflow给直接子项min-inline-size:0和max-inline-size:100%，使其flex盒可以收缩；组件不会隐式截断、隐藏或改写子项内容。'
	],
	keywords: ['group', 'row', 'flex', 'grow', 'equal width', 'wrap', 'responsive']
});
