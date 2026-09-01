import { dateRangePickerMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import StatesDemo from './StatesDemo.svelte';
import statesSource from './StatesDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
export const dateRangePickerDoc = defineComponentDoc(dateRangePickerMetadata, {
	demos: [
		{
			component: FormDemo,
			description: '第一次选择起点，第二次选择终点并规范化顺序；范围以两个隐藏字段提交。',
			id: 'date-range-picker-window',
			source,
			title: '发布窗口范围'
		},
		{
			component: StatesDemo,
			description: '空范围、readonly提交与disabled退出提交使用同一双日期合同。',
			id: 'date-range-picker-states',
			source: statesSource,
			title: '空值、只读与禁用范围'
		}
	],
	accessibility: [
		'等待第二次选择时保持Calendar打开并标记data-selecting。',
		'范围内gridcell使用aria-selected和data-selected；Escape取消pending而不改已提交range。',
		'ZField语义只由范围Trigger和name.start/name.end拥有；内部Calendar不会提交额外字段。',
		'Trigger使用select-only combobox语义；readonly保持双字段提交但不允许开启新的选择。',
		'显示与Calendar使用同一个显式timeZone，reset恢复完整默认范围。'
	],
	keywords: ['date range picker', 'calendar range', 'popover', 'form']
});
