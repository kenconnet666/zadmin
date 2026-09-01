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
			isDateDisabled: {
				default: 'undefined',
				description: 'deprecated兼容别名；新代码使用isDateUnavailable，二者互斥。'
			},
			name: { default: 'Field context或—', description: '以ISO CalendarDate字符串参与FormData。' },
			onFocusedValueChange: {
				default: 'undefined',
				description: '用户键盘、指针焦点日期真正变化时触发。'
			},
			onValueChange: {
				default: 'undefined',
				description: '用户选择或Delete清空时返回CalendarDate或null。'
			},
			range: { default: 'null', description: '呈现partial或完整范围；不建立第二个选择owner。' },
			readonly: {
				default: 'Field context或false',
				description: '保留网格焦点和月份浏览，阻止选择写入。'
			},
			ref: { default: 'null', description: '真实Calendar根，用于Picker initialFocus和测试。' },
			required: {
				default: 'Field context或false',
				description: '阻止Delete清空并暴露必填ARIA语义。'
			}
		},
		summary:
			'生产单月Calendar：显式nullable选择、独立focusedValue、固定6周grid、可跳过不可用日期的完整RTL键盘、partial range呈现、typed locale/timeZone与唯一表单owner。'
	},
	demos: [
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
			description: 'Calendar只负责partial/complete范围呈现和端点语义，由Range Picker拥有选择阶段。',
			id: 'calendar-range-projection',
			source: rangeSource,
			title: 'Partial与完整范围投影'
		}
	],
	accessibility: [
		'table grid保留row、columnheader和gridcell关系；每个日期按钮使用完整locale日期名称。',
		'只有focusedValue对应日期tabindex=0；方向键按日/周移动，Home/End按周，Page键按月或年，RTL反转水平键。',
		'不可用日期同时退出指针与键盘；导航会沿意图方向跳过不可用日期，月份按钮在min/max边界停用。',
		'readonly仍可聚焦并浏览月份但不选择；disabled退出全部交互和FormData；required阻止键盘清空。',
		'range仅投影aria-selected、data-selected和端点，不改变单选value owner。'
	],
	keywords: ['calendar', 'grid', 'focused value', 'calendar date', 'range', 'rtl']
});
