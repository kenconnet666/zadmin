import { datePickerMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import ConstraintsDemo from './ConstraintsDemo.svelte';
import constraintsSource from './ConstraintsDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
export const datePickerDoc = defineComponentDoc(datePickerMetadata, {
	demos: [
		{
			component: FormDemo,
			description: 'Trigger格式化CalendarDate，Popover中的Calendar选择后关闭并恢复焦点。',
			id: 'date-picker-popover',
			source,
			title: '日历日期选择'
		},
		{
			component: ConstraintsDemo,
			description: '日期边界传递到Calendar；readonly保留提交，disabled退出交互与提交。',
			id: 'date-picker-constraints',
			source: constraintsSource,
			title: '日期边界、只读与禁用'
		}
	],
	accessibility: [
		'Trigger以原生button承载select-only combobox语义和aria-haspopup=dialog，Popover有独立可访问名称。',
		'Calendar获得初始焦点并复用全部grid键盘；选择后关闭且恢复Trigger。',
		'ZField语义投射到Trigger和唯一业务hidden input；内部Calendar处于auxiliary boundary。',
		'readonly保持当前值与表单提交，但不允许打开或修改；disabled同时退出交互与提交。',
		'显示和Calendar使用同一个显式timeZone，值与FormData保持CalendarDate ISO字符串。'
	],
	keywords: ['date picker', 'calendar', 'popover', 'form']
});
