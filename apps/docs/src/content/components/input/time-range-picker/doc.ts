import { timeRangePickerMetadata } from '@zadmin/zui/metadata';
import { timeRangePickerApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import OvernightDemo from './OvernightDemo.svelte';
import overnightSource from './OvernightDemo.svelte?raw';
import FamilyDemo from './FamilyDemo.svelte';
import familySource from './FamilyDemo.svelte?raw';

export const timeRangePickerDoc = defineComponentDoc(timeRangePickerMetadata, {
	profiles: ['form-control', 'layer'],
	sourceApi: timeRangePickerApiFacts,
	accessibility: [
		'开始和结束字段使用独立名称；面板复用 TimePicker 列键盘导航和焦点回收。',
		'禁用状态作用于全部输入与操作；取消及 Escape 放弃面板草稿并回到触发器。'
	],
	teaching: {
		summary:
			'实验性时间范围选择器，复用两个 TimeField 和共享 TimePickerPanel。根组件独占范围模型、打开状态及两个 FormData 端点；明确区分同日有序与跨午夜范围。'
	},
	demos: [
		{
			id: 'time-range-picker-draft',
			title: '范围草稿、预设与确认',
			component: BasicDemo,
			source: basicSource,
			covers: ['basic-render', 'controlled', 'keyboard', 'portal'],
			description: '可见列使用与 TimePicker 相同的面板；预设支持静态值和点击时读取的函数。'
		},
		{
			id: 'time-range-picker-states',
			title: '跨午夜、部分端点和状态',
			component: OvernightDemo,
			source: overnightSource,
			covers: ['disabled', 'readonly'],
			description: '不会自动交换用户输入的起止顺序；只读与禁用状态按整个组件统一处理。'
		},
		{
			id: 'time-range-picker-family',
			title: '五档尺寸与表单重置',
			component: FamilyDemo,
			source: familySource,
			covers: ['form-data', 'form-reset'],
			description: '唯一根模型序列化 hours.start 与 hours.end；重置恢复端点并关闭面板。'
		}
	]
});
