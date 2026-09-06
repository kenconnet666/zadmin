import { overflowListMetadata } from '@zadmin/zui/metadata';
import ResizeDemo from './ResizeDemo.svelte';
import resizeSource from './ResizeDemo.svelte?raw';
import RowsDemo from './RowsDemo.svelte';
import rowsSource from './RowsDemo.svelte?raw';
import PinnedRtlDemo from './PinnedRtlDemo.svelte';
import pinnedRtlSource from './PinnedRtlDemo.svelte?raw';
import DynamicLabelsDemo from './DynamicLabelsDemo.svelte';
import dynamicLabelsSource from './DynamicLabelsDemo.svelte?raw';
import { overflowListApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const overflowListDoc = defineComponentDoc(overflowListMetadata, {
	profiles: ['primitive'],
	sourceApi: overflowListApiFacts,
	teaching: {
		props: {
			collapse: {
				default: 'true',
				description: 'false完整显示并停止测量；suspended保留已有拆分。'
			},
			collapseFrom: { default: "'end'", description: '按数据逻辑顺序从start或end移除未固定项目。' },
			itemKey: {
				default: '必填',
				description: '稳定唯一string/number身份，区分number 1与string "1"。'
			},
			maxRows: { default: '1', description: '正整数flex行数预算。' },
			maxVisibleItems: { default: '—', description: '非负可见数量上限。' },
			pinnedKeys: { default: '[]', description: '始终保留的项目key。' },
			ref: { default: 'null', description: '真实集合根；每个item只挂载一个DOM wrapper。' },
			suspended: { default: 'false', description: '复杂交互打开时暂停当前测量拆分。' }
		},
		summary: '用真实CSS布局尺寸折叠集合，保留唯一item DOM、逻辑顺序、固定项目和可访问的溢出入口。'
	},
	demos: [
		{
			component: ResizeDemo,
			covers: ['basic-render', 'composition', 'native-props', 'variants-and-states'],
			description: '拖动外层宽度观察ResizeObserver驱动的可见/溢出拆分；SSR初始显示全部项目。',
			id: 'overflow-list-resize',
			source: resizeSource,
			title: '动态宽度与溢出入口'
		},
		{
			component: RowsDemo,
			covers: ['composition', 'native-props', 'variants-and-states'],
			description: 'maxRows=2与maxVisibleItems同时约束布局，overflow snippet收到完整隐藏项目。',
			id: 'overflow-list-rows',
			source: rowsSource,
			title: '两行与可见数量上限'
		},
		{
			component: PinnedRtlDemo,
			covers: ['composition', 'rtl', 'native-props'],
			description: 'RTL不反转数据顺序；collapseFrom=start保留末端路径，pinnedKeys固定当前项目。',
			id: 'overflow-list-pinned-rtl',
			source: pinnedRtlSource,
			title: '从起点折叠、固定项目与RTL'
		},
		{
			component: DynamicLabelsDemo,
			covers: ['composition', 'keyboard', 'native-props', 'variants-and-states'],
			description:
				'标签动态变长时通过MutationObserver/字体与显式refresh重新测量；Popover打开期间绑定suspended保留拆分。',
			id: 'overflow-list-dynamic-labels',
			source: dynamicLabelsSource,
			title: '动态标签与暂停测量'
		}
	],
	accessibility: [
		'每个项目只有一个真实DOM wrapper；折叠项目使用inert与aria-hidden，不创建隐藏的重复交互副本。',
		'overflow snippet必须提供真实可访问入口，例如按钮与Popover；不要只显示静态“还有N项”而丢失隐藏操作。',
		'焦点落在即将折叠项目时，组件会尝试转移到溢出入口或集合根；调用方应保持稳定itemKey。',
		'collapseFrom表达数据逻辑顺序，RTL只改变视觉方向，不重排items。'
	]
});
