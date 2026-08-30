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
			description: '空范围placeholder与禁用完整范围使用同一双日期合同。',
			id: 'date-range-picker-states',
			source: statesSource,
			title: '空值与禁用范围'
		}
	],
	accessibility: [
		'等待第二次选择时保持Calendar打开并标记data-selecting。',
		'范围内gridcell使用aria-selected和data-selected；Escape取消pending而不改已提交range。',
		'name生成name.start与name.end两个ISO字段，reset恢复完整默认范围。'
	],
	keywords: ['date range picker', 'calendar range', 'popover', 'form']
});
