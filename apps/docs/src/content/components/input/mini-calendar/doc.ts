import { miniCalendarMetadata } from '@zadmin/zui/metadata';
import { miniCalendarApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import ScheduleDemo from './ScheduleDemo.svelte';
import scheduleSource from './ScheduleDemo.svelte?raw';

export const miniCalendarDoc = defineComponentDoc(miniCalendarMetadata, {
	profiles: ['form-control', 'collection'],
	sourceApi: miniCalendarApiFacts,
	teaching: {
		summary:
			'MiniCalendar是ZCalendar strip view的单日期便利入口；选择、焦点、日期约束、键盘和FormData仍只有一个Calendar owner。'
	},
	accessibility: [
		'保留Calendar的grid、row、gridcell和日期button语义；每个日期仍使用完整locale日期作为可访问名称。',
		'左右键按实际书写方向逐日移动，上下键按七日移动，Home/End到当前周边界，Page键与页头按visibleDays翻页。',
		'readonly保留焦点与翻页但阻止选择；disabled停止交互并退出FormData；required允许清空后报告无效。',
		'dateCell和header只替换内容，内部button、焦点、选择、约束和表单所有权保持不变。'
	],
	demos: [
		{
			component: BasicDemo,
			covers: ['basic-render', 'controlled', 'keyboard', 'locale'],
			description: '七天默认窗口围绕当前焦点周开始，value仍是CalendarDate或null。',
			id: 'mini-calendar-basic',
			source: basicSource,
			title: '紧凑周日期选择'
		},
		{
			component: ScheduleDemo,
			covers: ['composition', 'disabled', 'keyboard', 'rtl', 'variants-and-states'],
			description: '十天窗口、业务禁用、RTL和typed内容定制继续复用同一个Calendar。',
			id: 'mini-calendar-schedule',
			source: scheduleSource,
			title: '排班窗口与内容定制'
		}
	],
	keywords: ['mini calendar', 'date strip', 'calendar date', 'form', 'rtl']
});
