import { badgeMetadata } from '@zadmin/zui/metadata';
import { badgeApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
import CountsDemo from './CountsDemo.svelte';
import countsSource from './CountsDemo.svelte?raw';
import DotDemo from './DotDemo.svelte';
import dotSource from './DotDemo.svelte?raw';
import DynamicDemo from './DynamicDemo.svelte';
import dynamicSource from './DynamicDemo.svelte?raw';
import FormDemo from './FormDemo.svelte';
import formSource from './FormDemo.svelte?raw';
import PlacementDemo from './PlacementDemo.svelte';
import placementSource from './PlacementDemo.svelte?raw';

export const badgeDoc = defineComponentDoc(badgeMetadata, {
	profiles: ['data-view', 'animated'],
	sourceApi: badgeApiFacts,
	teaching: {
		props: {
			ref: {
				default: 'null',
				description: '真实根span；动画和direction都从该节点的Provider/owner realm解析。'
			}
		},
		summary:
			'Badge只表达附着于对象的通知数量或紧凑圆点；可读状态文本属于ZTag，不再让两个语义共享一套含混API。'
	},
	demos: [
		{
			component: FormDemo,
			covers: ['accessible-name', 'basic-render', 'composition', 'full-motion'],
			description:
				'Badge把计数定位到真实ZButton anchor；交互名称由按钮拥有，并显式包含完整业务数量。',
			id: 'badge-anchors',
			source: formSource,
			title: '通知Anchor'
		},
		{
			component: CountsDemo,
			covers: ['basic-render', 'locale', 'variants-and-states'],
			description:
				'0默认隐藏，showZero显式保留；max只压缩视觉文本，可访问名称继续保留完整格式化数量。',
			id: 'badge-counts',
			source: countsSource,
			title: 'Standalone、Max与Show Zero'
		},
		{
			component: DotDemo,
			covers: ['accessible-name', 'composition', 'variants-and-states'],
			description:
				'Dot不依靠颜色单独传达业务状态；有意义的圆点提供label，交互anchor自身也保留完整名称。',
			id: 'badge-dot',
			source: dotSource,
			title: '具名Dot'
		},
		{
			component: PlacementDemo,
			covers: ['composition', 'rtl', 'variants-and-states'],
			description:
				'四个placement使用逻辑start/end；circular overlap与向外offset不会写死LTR物理方向。',
			id: 'badge-placement',
			source: placementSource,
			title: '逻辑角落与Circular Overlap'
		},
		{
			component: DynamicDemo,
			covers: [
				'controlled',
				'full-motion',
				'reduced-motion',
				'resource-cleanup',
				'variants-and-states'
			],
			description:
				'动态数量更新复用同一indicator；reduced motion取消WAAPI缩放，实时公告由业务live region单独拥有。',
			id: 'badge-dynamic',
			source: dynamicSource,
			title: '动态计数、隐藏与Reduced Motion'
		}
	],
	accessibility: [
		'视觉max只显示“99+”一类摘要，indicator内的隐藏文本仍是完整count；不要把压缩后的视觉文本当成真实数量。',
		'当Badge放在Button或Link内部且anchor已有aria-label时，anchor名称应主动包含完整数量，因为父级aria-label会覆盖后代文本。',
		'dot且没有count时默认是装饰并从可访问树隐藏；当圆点表达“在线”或“有更新”等信息时必须提供label，并在附近保留非颜色线索。',
		'Badge不创建live region。频繁数量变化是否公告取决于业务重要性，应由单独、可节流的status区域拥有，避免每次动画都打断读屏。',
		'placement使用逻辑start/end并跟随Provider RTL；offset表示沿当前逻辑inline/block边缘向外移动的像素。',
		'count必须是非负安全整数，max必须是正安全整数；不接受任意Snippet计数，避免视觉摘要与可访问真实值分叉。',
		'状态文字、筛选标签和可移除实体统一使用ZTag；Badge不再兼任status pill。'
	],
	keywords: ['badge', 'count', 'dot', 'max', 'show zero', 'anchor', 'overlap', 'notification']
});
