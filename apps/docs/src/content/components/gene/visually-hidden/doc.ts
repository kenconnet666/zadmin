import { visuallyHiddenMetadata } from '@zadmin/zui/metadata';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import StatusDemo from './StatusDemo.svelte';
import statusSource from './StatusDemo.svelte?raw';
import BoundaryDemo from './BoundaryDemo.svelte';
import boundarySource from './BoundaryDemo.svelte?raw';
import LiveRegionDemo from './LiveRegionDemo.svelte';
import liveRegionSource from './LiveRegionDemo.svelte?raw';
import { visuallyHiddenApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const visuallyHiddenDoc = defineComponentDoc(visuallyHiddenMetadata, {
	profiles: ['primitive'],
	sourceApi: visuallyHiddenApiFacts,
	teaching: {
		props: { ref: { default: 'null', description: '真实span引用；内容仍位于可访问树。' } },
		summary: '只负责视觉裁切且保留辅助技术内容的span原语；不提供focusable或asChild模式。'
	},
	demos: [
		{
			component: BasicDemo,
			covers: ['accessible-name', 'basic-render', 'composition'],
			description: '图标按钮保留辅助文本；组件不设置aria-hidden，也不移出可访问树。',
			id: 'visually-hidden-basic',
			source: basicSource,
			title: '辅助技术文本'
		},
		{
			component: StatusDemo,
			covers: ['accessible-name', 'controlled', 'variants-and-states'],
			description: '动态数量同时进入按钮名称和视觉隐藏辅助文本。',
			id: 'visually-hidden-status',
			source: statusSource,
			title: '动态图标按钮名称'
		},
		{
			component: LiveRegionDemo,
			covers: ['controlled', 'native-props', 'variants-and-states'],
			description: '原生role/aria-live/atomic投射到隐藏span；组件不创建自己的公告策略。',
			id: 'visually-hidden-live-region',
			source: liveRegionSource,
			title: 'Live Region内容'
		},
		{
			component: BoundaryDemo,
			covers: ['composition', 'native-props', 'ssr'],
			description: '明确拒绝隐藏可聚焦控件；裁切不依赖颜色、透明度或屏幕尺寸。',
			id: 'visually-hidden-boundary',
			source: boundarySource,
			title: 'Focusable、打印与高对比边界'
		}
	],
	accessibility: [
		'内容仍被屏幕阅读器读取，只从视觉布局中裁切。',
		'不能用于隐藏仍可聚焦的交互控件；skip link必须使用真实ZLink和focus样式。',
		'不提供focusable/asChild模式，避免一个组件同时拥有隐藏说明与交互显示状态。',
		'裁切方案在forced-colors和打印中仍不占视觉布局；不要用display:none、visibility:hidden或aria-hidden替代。',
		'参考Chakra VisuallyHidden的辅助技术边界，但拒绝asChild以保留固定span与精确原生属性。'
	]
});
