import { datePickerMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
export const datePickerDoc = defineComponentDoc(datePickerMetadata, {
	demos: [
		{
			component: FormDemo,
			description: 'Trigger格式化CalendarDate，Popover中的Calendar选择后关闭并恢复焦点。',
			id: 'date-picker-popover',
			source,
			title: '日历日期选择'
		}
	],
	accessibility: [
		'Trigger是aria-haspopup=dialog的原生button，Popover有独立可访问名称。',
		'Calendar获得初始焦点并复用全部grid键盘；选择后关闭且恢复Trigger。',
		'显示格式只影响文本，值与FormData保持CalendarDate ISO字符串。'
	],
	keywords: ['date picker', 'calendar', 'popover', 'form']
});
