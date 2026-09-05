import { tableMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import CompactDemo from './CompactDemo.svelte';
import compactSource from './CompactDemo.svelte?raw';
import ScrollLabelsDemo from './ScrollLabelsDemo.svelte';
import scrollLabelsSource from './ScrollLabelsDemo.svelte?raw';
import InteractiveDemo from './InteractiveDemo.svelte';
import interactiveSource from './InteractiveDemo.svelte?raw';
import ResponsiveDemo from './ResponsiveDemo.svelte';
import responsiveSource from './ResponsiveDemo.svelte?raw';
import RtlContrastDemo from './RtlContrastDemo.svelte';
import rtlContrastSource from './RtlContrastDemo.svelte?raw';
import SpansDemo from './SpansDemo.svelte';
import spansSource from './SpansDemo.svelte?raw';
import { tableApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const tableDoc = defineComponentDoc(tableMetadata, {
	profiles: ['data-view'],
	sourceApi: tableApiFacts,
	teaching: {
		props: {
			scrollLabelledBy: {
				default: 'undefined',
				description: '真实溢出时为scroll region引用标题元素ID；无溢出时不会写入wrapper。'
			},
			scrollDescribedBy: {
				default: 'undefined',
				description: '真实溢出时为scroll region引用说明元素ID；无溢出时不会写入wrapper。'
			},
			caption: {
				default: '必填',
				description: '真实caption是Table名称，不能以外部Heading或aria-label替代。'
			},
			captionHidden: {
				default: 'false',
				description: '使用共享ZVisuallyHidden隐藏文字，同时保留真实caption直接子元素。'
			},
			children: {
				default: 'undefined',
				description: '调用方拥有tbody中的真实tr/th/td、scope、rowspan与colspan。'
			},
			density: {
				default: 'Provider density',
				description: '显式compact/comfortable/spacious优先，否则完整继承Provider density轴。'
			},
			footer: { default: 'undefined', description: '真实tfoot行。' },
			header: { default: 'undefined', description: '真实thead行。' },
			striped: {
				default: 'false',
				description: '只改变tbody偶数行背景，表头关系和边框仍由原生语义表达。'
			}
		},
		summary:
			'Table只拥有原生结构、caption、密度和有限横向scroll owner；数据模型、排序、选择、分页、请求和虚拟化属于ZDataTable或调用方。'
	},
	demos: [
		{
			component: ScrollLabelsDemo,
			covers: ['accessible-name', 'composition', 'focus'],
			description: 'scrollLabelledBy与scrollDescribedBy仅在真实横向溢出时应用到可聚焦region。',
			id: 'table-scroll-labels',
			source: scrollLabelsSource,
			title: 'Scroll区域命名'
		},
		{
			component: FormDemo,
			covers: ['basic-render', 'native-props'],
			description: '调用方直接提供原生tr/th/td，Table只提供结构壳与视觉。',
			id: 'table-native',
			source,
			title: '原生表格'
		},
		{
			component: CompactDemo,
			covers: ['density', 'native-props', 'variants-and-states'],
			description: '紧凑密度和tfoot适合高信息密度汇总表。',
			id: 'table-compact',
			source: compactSource,
			title: '紧凑表格与汇总'
		},
		{
			component: ResponsiveDemo,
			covers: ['accessible-name', 'focus', 'native-props', 'resource-cleanup'],
			description: '宽表保留真实table/ref，并仅在测得横向溢出时让具名wrapper进入Tab顺序。',
			id: 'table-responsive-scroll',
			source: responsiveSource,
			title: '真实溢出的响应式Scroll Owner'
		},
		{
			component: SpansDemo,
			covers: ['accessible-name', 'basic-render', 'native-props'],
			description: 'rowspan、colspan、scope=colgroup/rowgroup继续由调用方使用原生HTML表达。',
			id: 'table-spans-headers',
			source: spansSource,
			title: '跨行跨列与Header关系'
		},
		{
			component: InteractiveDemo,
			covers: ['composition', 'focus', 'keyboard'],
			description: '单元格组合ZLink、ZButton与ZTag，Table不接管其Tab顺序和业务动作。',
			id: 'table-interactive-cells',
			source: interactiveSource,
			title: '交互子控件'
		},
		{
			component: RtlContrastDemo,
			covers: ['density', 'rtl', 'variants-and-states'],
			description: 'RTL、高对比与spacious Provider density不改变DOM/阅读顺序。',
			id: 'table-rtl-contrast',
			source: rtlContrastSource,
			title: 'RTL、高对比与Density继承'
		}
	],
	accessibility: [
		'caption为必填、非空的真实table名称；captionHidden复用ZVisuallyHidden但caption仍是table直接子元素。',
		'列/行标题由调用方使用th与scope明确表达；复杂表可使用colgroup、rowgroup、rowspan、colspan、id与headers。',
		'scroll=auto只允许横向滚动；ResizeObserver测得真实溢出后，wrapper才获得role=region、名称和tabindex=0。',
		'无溢出或scroll=none时wrapper不加入Tab顺序，避免为每个普通Table制造无意义焦点站。',
		'wrapperRef指向稳定scroll owner，ref始终指向真实table；原生table attributes继续落到table而不是wrapper。',
		'RTL只改变逻辑视觉方向，不反转DOM列顺序；高对比下单元格边框和真实header关系仍然存在。',
		'单元格内ZButton/ZLink等真实控件自行拥有键盘、焦点和动作；Table不创建row click或cell roving。',
		'参考WAI原生Table/caption/scope指导与MUI TableContainer的横向wrapper，但拒绝Ant Table的数据、columns、sort、selection、pagination、fixed、sticky和virtual状态机；这些属于ZDataTable。'
	],
	keywords: [
		'table',
		'caption',
		'thead',
		'tbody',
		'semantic',
		'responsive table',
		'horizontal scroll',
		'scope'
	]
});
