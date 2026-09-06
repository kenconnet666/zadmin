import { simpleGridMetadata } from '@zadmin/zui/metadata';
import AdaptiveDemo from './AdaptiveDemo.svelte';
import adaptiveSource from './AdaptiveDemo.svelte?raw';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import LongContentRtlDemo from './LongContentRtlDemo.svelte';
import longContentRtlSource from './LongContentRtlDemo.svelte?raw';
import ResponsiveQueryDemo from './ResponsiveQueryDemo.svelte';
import responsiveQuerySource from './ResponsiveQueryDemo.svelte?raw';
import { simpleGridApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const simpleGridDoc = defineComponentDoc(simpleGridMetadata, {
	profiles: ['primitive'],
	sourceApi: simpleGridApiFacts,
	teaching: {
		props: {
			columns: {
				default: '3',
				description: '固定等宽列数，接受base/small/medium/large断点对象；和minItemWidth互斥。'
			},
			minItemWidth: {
				default: '—',
				description:
					'切换为CSS auto-fit。number按px；string支持长度、百分比与var/calc/min/max/clamp，直接由CSS解析；响应式对象省略base时使用Theme.size.gridItemMinWidth。'
			},
			query: {
				default: "'viewport'",
				description: '传入{ container }时，祖先ZContainer必须用相同queryName声明CSS容器。'
			},
			ref: { default: 'null', description: '真实网格div引用。' }
		},
		summary:
			'普通children的等宽CSS Grid：固定columns适合明确编排，minItemWidth用auto-fit适应可用空间；它不提供跨列、GridItem或布局上下文。'
	},
	demos: [
		{
			component: BasicDemo,
			covers: ['basic-render', 'composition', 'native-props'],
			description: '固定三列适合简单入口与信息卡片，普通children按DOM顺序自动放置。',
			id: 'simple-grid-columns',
			source: basicSource,
			title: '固定等宽列'
		},
		{
			component: AdaptiveDemo,
			covers: ['basic-render', 'native-props', 'ssr', 'variants-and-states'],
			description: 'minItemWidth直接发出auto-fit/minmax CSS；窄容器不会把最小列宽撑出自身。',
			id: 'simple-grid-auto-fit',
			source: adaptiveSource,
			title: '自适应最小列宽'
		},
		{
			component: ResponsiveQueryDemo,
			covers: ['composition', 'native-props', 'ssr', 'variants-and-states'],
			description: '同一断点对象可改为命名容器查询；没有observer、JavaScript测量或hydration状态。',
			id: 'simple-grid-container-query',
			source: responsiveQuerySource,
			title: '命名容器查询'
		},
		{
			component: LongContentRtlDemo,
			covers: ['composition', 'native-props', 'rtl'],
			description: '网格根和子项保留min-width:0；内容自己的换行策略与RTL可独立组合。',
			id: 'simple-grid-long-content-rtl',
			source: longContentRtlSource,
			title: '长内容与RTL'
		}
	],
	accessibility: [
		'根保持原生div，不增加role或焦点模型；列表、导航、区域等语义应由调用方选择相应原生元素或组件。',
		'普通children按DOM顺序自动放置；列数、auto-fit和RTL不改变阅读顺序或键盘顺序。',
		'每个直接子项获得min-width:0以允许其自身采用换行/截断策略；SimpleGrid不替调用方强制文本截断或隐藏内容。',
		'minItemWidth使用repeat(auto-fit, minmax(min(100%, width), 1fr))，单项最小宽度永远不会大于网格可用宽度。',
		'命名容器查询只生成CSS @container；祖先没有匹配queryName时，base样式仍完整且不会产生JS测量或SSR差异。'
	],
	keywords: [
		'simple grid',
		'css grid',
		'auto-fit',
		'minmax',
		'responsive',
		'container query',
		'rtl'
	]
});
