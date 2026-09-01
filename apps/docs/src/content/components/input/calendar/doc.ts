import { calendarMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import ConstraintsDemo from './ConstraintsDemo.svelte';
import constraintsSource from './ConstraintsDemo.svelte?raw';
import LocaleTimeZoneDemo from './LocaleTimeZoneDemo.svelte';
import localeTimeZoneSource from './LocaleTimeZoneDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
export const calendarDoc = defineComponentDoc(calendarMetadata, {
	demos: [
		{
			component: FormDemo,
			description: '固定6周grid、周一起始、相邻月日期、roving focus和ISO表单值。',
			id: 'calendar-grid',
			source,
			title: '部署日期日历'
		},
		{
			component: ConstraintsDemo,
			description: '最小/最大日期、周末禁用与outside dates共同约束选择网格。',
			id: 'calendar-constraints',
			source: constraintsSource,
			title: '日期约束'
		},
		{
			component: LocaleTimeZoneDemo,
			description: 'Provider同时提供类型安全中文日期文案和显式IANA时区，保持SSR与hydration一致。',
			id: 'calendar-locale-time-zone',
			source: localeTimeZoneSource,
			title: 'Locale pack与时区'
		}
	],
	accessibility: [
		'table grid保留row、columnheader和gridcell关系，日期按钮使用完整locale名称。',
		'只有focused日期tabindex=0；方向键、Home/End、PageUp/Down移动且不改变选择。',
		'Enter/Space选择；min/max和isDateDisabled同时影响disabled与键盘。',
		'today、weekday和完整日期名称使用同一个显式timeZone，不读取客户端本地时区。'
	],
	keywords: ['calendar', 'grid', 'calendar date', 'roving focus']
});
