import { periodPickerMetadata } from '@zadmin/zui/metadata';
import { periodPickerApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import SelectionDemo from './SelectionDemo.svelte';
import selectionSource from './SelectionDemo.svelte?raw';
import FamilyDemo from './FamilyDemo.svelte';
import familySource from './FamilyDemo.svelte?raw';

export const periodPickerDoc = defineComponentDoc(periodPickerMetadata, {
	profiles: ['form-control', 'layer', 'collection'],
	sourceApi: periodPickerApiFacts,
	teaching: {
		summary:
			'以PeriodCalendar、Popover和InputGroup组合的周期选择器。四种granularity、三种selectionMode共用唯一模型、序列化、焦点与主题，不维护平行的月份/年份/周/季度状态机。'
	},
	accessibility: [
		'触发器支持Enter、Space和上下键打开，Delete/Backspace清空；关闭后恢复焦点。',
		'readonly触发器仍可聚焦读取值，但不打开或修改；disabled退出FormData。',
		'confirm模式把草稿和模型分开；无效草稿和已有非法值均不会被当作有效表单值。'
	],
	demos: [
		{
			id: 'period-picker-basic',
			title: '四种周期选择',
			component: BasicDemo,
			source: basicSource,
			covers: ['basic-render', 'keyboard', 'portal'],
			description: '同一API承接MonthPicker、YearPicker、QuarterPicker和WeekPicker能力。'
		},
		{
			id: 'period-picker-selection',
			title: '多选、范围与确认',
			component: SelectionDemo,
			source: selectionSource,
			covers: ['controlled', 'portal'],
			description: '即时多选保输入顺序；确认范围允许草稿与取消。'
		},
		{
			id: 'period-picker-family',
			title: '五档尺寸、状态与表单',
			component: FamilyDemo,
			source: familySource,
			covers: ['density', 'readonly', 'disabled', 'form-data', 'form-reset'],
			description: '上下层共享尺寸和原生表单所有权；必填不阻止用户主动清空。'
		}
	]
});
