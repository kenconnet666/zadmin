import { gridItemMetadata, gridMetadata } from '@zadmin/zui/metadata';
import { gridApiFacts, gridItemApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import ResponsiveDemo from './ResponsiveDemo.svelte';
import responsiveSource from './ResponsiveDemo.svelte?raw';
import NamedContainerDemo from './NamedContainerDemo.svelte';
import namedContainerSource from './NamedContainerDemo.svelte?raw';
import RtlDemo from './RtlDemo.svelte';
import rtlSource from './RtlDemo.svelte?raw';
import AxisGapsDemo from './AxisGapsDemo.svelte';
import axisGapsSource from './AxisGapsDemo.svelte?raw';

export const gridDoc = defineComponentDoc(gridMetadata, {
	members: [gridItemMetadata],
	memberApis: [gridItemApiFacts],
	profiles: ['primitive'],
	sourceApi: gridApiFacts,
	teaching: {
		props: {
			align: { default: "'stretch'", description: '栅格项块轴对齐。' },
			columns: { default: '12', description: '正整数列数，支持base/small/medium/large。' },
			gap: { default: "'medium'", description: '双轴间距token或非负px值。' },
			query: { default: "'viewport'", description: 'viewport或命名祖先容器。' }
		},
		summary: '用显式列轨道和响应式查询建立可组合的逻辑栅格，ZGridItem负责跨列、起始列与跨行。'
	},
	demos: [
		{
			component: BasicDemo,
			covers: ['basic-render', 'composition', 'native-props'],
			description: '12列栅格中同时展示span、start和rowSpan，列数与轨道由真实CSS Grid生成。',
			id: 'grid-placement',
			source: basicSource,
			title: '12列与跨列布局'
		},
		{
			component: ResponsiveDemo,
			covers: ['composition', 'native-props', 'ssr'],
			description: 'columns与span分别在断点级联，DOM顺序保持不变，窄容器不会被固定宽度撑出。',
			id: 'grid-responsive',
			source: responsiveSource,
			title: '响应式列数与跨列'
		},
		{
			component: NamedContainerDemo,
			covers: ['composition', 'native-props', 'variants-and-states'],
			description:
				'命名inline-size容器驱动Grid断点；拖动容器右下角改变可用宽度，观察列数和跨列规则。',
			id: 'grid-named-container',
			source: namedContainerSource,
			title: '命名容器查询'
		},
		{
			component: AxisGapsDemo,
			covers: ['composition', 'native-props', 'ssr', 'variants-and-states'],
			description:
				'按钮切换命名容器最大宽度；ZStack与ZGrid共享断点gap，rowGap=3与columnGap=5分别覆盖对应轴。',
			id: 'grid-axis-gaps',
			source: axisGapsSource,
			title: '命名容器与轴向间距'
		},
		{
			component: RtlDemo,
			covers: ['composition', 'rtl'],
			description: 'RTL下使用逻辑起始列和可换行长内容，视觉方向变化不重写DOM阅读顺序。',
			id: 'grid-rtl-long-content',
			source: rtlSource,
			title: 'RTL与长内容'
		}
	],
	accessibility: [
		'栅格本身保持div语义；需要表格、列表或landmark语义时由调用方选择对应元素。',
		'跨列和视觉顺序不会改变DOM与Tab阅读顺序；不要用order制造逻辑阅读顺序。',
		'长内容必须允许真实换行或扩展；组件不通过截断和横向隐藏掩盖布局问题。'
	]
});
