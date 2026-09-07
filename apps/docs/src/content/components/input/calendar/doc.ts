import SizingDemo from './SizingDemo.svelte';
import MultiMonthDemo from './MultiMonthDemo.svelte';
import multiMonthSource from './MultiMonthDemo.svelte?raw';
import RangeSelectionDemo from './RangeSelectionDemo.svelte';
import rangeSelectionSource from './RangeSelectionDemo.svelte?raw';
import sizingSource from './SizingDemo.svelte?raw';
import { calendarMetadata } from '@zadmin/zui/metadata';
import { calendarApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
import ConstraintsDemo from './ConstraintsDemo.svelte';
import constraintsSource from './ConstraintsDemo.svelte?raw';
import FocusedDemo from './FocusedDemo.svelte';
import focusedSource from './FocusedDemo.svelte?raw';
import FormDemo from './FormDemo.svelte';
import formSource from './FormDemo.svelte?raw';
import LocaleTimeZoneDemo from './LocaleTimeZoneDemo.svelte';
import localeTimeZoneSource from './LocaleTimeZoneDemo.svelte?raw';
import RangeDemo from './RangeDemo.svelte';
import rangeSource from './RangeDemo.svelte?raw';

export const calendarDoc = defineComponentDoc(calendarMetadata, {
	profiles: ['form-control', 'collection'],
	sourceApi: calendarApiFacts,
	teaching: {
		props: {
			disabled: {
				default: 'Field context或false',
				description: '停用月份导航、日期焦点和FormData。'
			},
			form: { default: '最近祖先form', description: '把唯一FormValueBridge关联到指定form id。' },
			invalid: {
				default: 'Field context或false',
				description: '投射aria-invalid和data-invalid，不改变日期可用性。'
			},
			name: { default: 'Field context或—', description: '以ISO CalendarDate字符串参与FormData。' },
			onFocusedValueChange: {
				default: 'undefined',
				description: '用户键盘、指针焦点日期真正变化时触发。'
			},
			onValueChange: {
				default: 'undefined',
				description: '按selectionMode返回单日期、日期数组或nullable端点范围；Delete可清空。'
			},
			highlightRange: {
				default: 'null',
				description: '额外视觉范围；真实范围选择使用selectionMode="range"与value。'
			},
			readonly: {
				default: 'Field context或false',
				description: '保留网格焦点和月份浏览，阻止选择写入。'
			},
			ref: { default: 'null', description: '真实Calendar根，用于Picker initialFocus和测试。' },
			required: {
				default: 'Field context或false',
				description: '空选择进入无效状态并暴露必填ARIA语义，不阻止Delete清空。'
			}
		},
		summary:
			'统一single/multiple/range的Calendar，一个owner覆盖多月窗口、独立focusedValue、周号、范围preview与连续性约束；每月固定6周网格，跨月不重复交互日期。'
	},
	demos: [
		{
			component: MultiMonthDemo,
			source: multiMonthSource,
			id: 'calendar-multiple-months',
			title: '多月窗口、多选与周号',
			covers: ['controlled', 'keyboard', 'locale'],
			description:
				'一个Calendar拥有多个网格，焦点窗口与选择独立，重复outside日期不再拥有第二个交互节点。'
		},
		{
			component: RangeSelectionDemo,
			source: rangeSelectionSource,
			id: 'calendar-range-selection',
			title: '范围选择与连续性',
			covers: ['controlled', 'invalid', 'keyboard'],
			description: 'selectionMode=range真正拥有起止值；highlightRange保留为单独视觉能力。'
		},
		{
			component: SizingDemo,
			covers: ['composition', 'variants-and-states'],
			description:
				'五档尺寸按组件用途同步文字、留白和内部控件；Field/Form 显式尺寸优先于 Provider density。',
			id: 'calendar-sizing',
			source: sizingSource,
			title: '五档尺寸与组合比例'
		},
		{
			component: FormDemo,
			covers: ['basic-render', 'form-data', 'form-reset', 'keyboard', 'uncontrolled'],
			description:
				'固定6周grid、周一起始、roving focus、nullable选择和ISO表单reset共享同一状态源。',
			id: 'calendar-grid-form',
			source: formSource,
			title: '部署日期、键盘与表单'
		},
		{
			component: ConstraintsDemo,
			covers: ['disabled', 'focus', 'invalid', 'keyboard', 'variants-and-states'],
			description: '最小/最大日期、周末不可用和隐藏outside dates同时约束指针、键盘与月份按钮。',
			id: 'calendar-constraints',
			source: constraintsSource,
			title: '边界、不可用日期与outside dates'
		},
		{
			component: LocaleTimeZoneDemo,
			covers: ['accessible-name', 'locale', 'ssr'],
			description: 'Provider统一typed中文文案与显式IANA时区，保持SSR、hydration和today一致。',
			id: 'calendar-locale-time-zone',
			source: localeTimeZoneSource,
			title: 'Locale pack与时区'
		},
		{
			component: FocusedDemo,
			covers: ['controlled', 'external-clear', 'focus', 'keyboard'],
			description:
				'focusedValue与value由不同owner控制；外部换月不会伪造选择，null清空不丢失焦点日期。',
			id: 'calendar-controlled-focus',
			source: focusedSource,
			title: '受控焦点与受控选择'
		},
		{
			component: RangeDemo,
			covers: ['composition', 'readonly', 'variants-and-states'],
			description:
				'highlightRange只负责partial/complete范围呈现，组合中的Range Picker拥有选择阶段与范围值。',
			id: 'calendar-range-projection',
			source: rangeSource,
			title: 'Partial与完整范围投影'
		}
	],
	accessibility: [
		'table grid保留row、columnheader和gridcell关系；每个日期按钮使用完整locale日期名称。',
		'只有focusedValue对应日期tabindex=0；方向键按日/周移动，Home/End按周，Page键按月或年，RTL反转水平键。',
		'不可用日期同时退出指针与键盘；导航会沿意图方向跳过不可用日期，月份按钮在min/max边界停用。',
		'readonly仍可聚焦并浏览月份但不选择；disabled退出全部交互和FormData；required允许清空并提供必填校验。',
		'highlightRange通过data-highlighted与端点呈现装饰范围，不改变aria-selected或data-selected；真正的范围选择使用selectionMode与value。'
	],
	keywords: ['calendar', 'grid', 'focused value', 'calendar date', 'range', 'rtl']
});
