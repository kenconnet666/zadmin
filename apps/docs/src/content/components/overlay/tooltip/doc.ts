import {
	tooltipContentMetadata,
	tooltipGroupMetadata,
	tooltipMetadata,
	tooltipTriggerMetadata
} from '@zadmin/zui/metadata';
import DisabledDemo from './DisabledDemo.svelte';
import disabledSource from './DisabledDemo.svelte?raw';
import GroupDemo from './GroupDemo.svelte';
import groupSource from './GroupDemo.svelte?raw';
import HoverableMotionDemo from './HoverableMotionDemo.svelte';
import hoverableMotionSource from './HoverableMotionDemo.svelte?raw';
import InteractiveDemo from './InteractiveDemo.svelte';
import interactiveSource from './InteractiveDemo.svelte?raw';
import PlacementsDemo from './PlacementsDemo.svelte';
import placementsSource from './PlacementsDemo.svelte?raw';
import { tooltipApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const tooltipDoc = defineComponentDoc(tooltipMetadata, {
	members: [tooltipGroupMetadata, tooltipTriggerMetadata, tooltipContentMetadata],
	profiles: ['layer', 'animated', 'service'],
	sourceApi: tooltipApiFacts,
	teaching: {
		summary:
			'focus即时打开；pointer hover通过作用域Group共享warmup/cooldown并保持唯一active；Content可停留但持续拒绝任何可聚焦或交互后代。'
	},
	demos: [
		{
			covers: ['basic-render', 'controlled', 'focus', 'keyboard', 'portal'],
			component: InteractiveDemo,
			description:
				'focus即时打开，hover使用显式delay；Content通过Portal定位并只在打开时建立describedby。',
			id: 'tooltip-interactive',
			source: interactiveSource,
			title: '焦点与Hover提示'
		},
		{
			covers: ['focus', 'full-motion', 'portal', 'variants-and-states'],
			component: PlacementsDemo,
			description: '主要位置使用同一focus/hover状态、Floating flip/shift和完整Presence动画。',
			id: 'tooltip-placements',
			source: placementsSource,
			title: '位置与即时显示'
		},
		{
			covers: ['focus', 'resource-cleanup', 'variants-and-states'],
			component: GroupDemo,
			description: 'Group让首次hover warmup，cooldown窗口内后续Tooltip即时打开，同时关闭旧active。',
			id: 'tooltip-group-hysteresis',
			source: groupSource,
			title: 'Group Warmup与Cooldown'
		},
		{
			covers: ['accessible-name', 'disabled', 'native-props'],
			component: DisabledDemo,
			description:
				'disabled原生button由非Tab inline wrapper提供pointer提示；键盘原因必须同时以常驻文本呈现。',
			id: 'tooltip-disabled-trigger',
			source: disabledSource,
			title: 'Disabled Control策略'
		},
		{
			covers: ['controlled', 'reduced-motion', 'resource-cleanup', 'rtl'],
			component: HoverableMotionDemo,
			description:
				'pointer可移入非交互Content保持打开；RTL定位与reduced motion由Provider/Floating共享。',
			id: 'tooltip-hoverable-reduced-rtl',
			source: hoverableMotionSource,
			title: '可停留内容、RTL与减少动画'
		}
	],
	accessibility: [
		'Trigger仅在打开期间使用aria-describedby关联tooltip；focus不会移入Content。',
		'键盘focus即时显示，pointer hover才使用warmup；Escape或Trigger激活立即关闭且不移动Trigger焦点。',
		'ZTooltipGroup只在自身Svelte上下文内协调一个active Tooltip，cooldown timer始终来自当前Trigger owner Window。',
		'hoverable允许pointer停留在说明上以满足hover/focus内容可停留要求，但运行时继续拒绝链接、按钮、表单控件、交互role与可聚焦后代；交互内容必须改用ZPopover。',
		'原生disabled button不可键盘聚焦：wrapper只补pointer hover，不制造假的Tab stop；不可用原因必须同时提供常驻文本、ZAlert或业务帮助入口。',
		'没有实现touch long-press；触摸提示需要真实移动产品决定阈值、滚动与取消合同。'
	],
	keywords: [
		'tooltip',
		'tooltip group',
		'hysteresis',
		'disabled trigger',
		'hoverable content',
		'focus'
	]
});
