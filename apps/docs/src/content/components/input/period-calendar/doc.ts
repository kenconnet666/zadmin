import { periodCalendarMetadata } from '@zadmin/zui/metadata';
import { periodCalendarApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
import GranularityDemo from './GranularityDemo.svelte';
import granularitySource from './GranularityDemo.svelte?raw';
import SelectionDemo from './SelectionDemo.svelte';
import selectionSource from './SelectionDemo.svelte?raw';
import RulesDemo from './RulesDemo.svelte';
import rulesSource from './RulesDemo.svelte?raw';
import FormDemo from './FormDemo.svelte';
import formSource from './FormDemo.svelte?raw';

export const periodCalendarDoc = defineComponentDoc(periodCalendarMetadata, {
	profiles: ['form-control', 'collection'],
	sourceApi: periodCalendarApiFacts,
	teaching: {
		summary:
			'同一个周期日历覆盖月份、年份、季度和周，并支持单选、多选与范围。周期是带种类和规则的冻结记录，日期边界由共享算法计算，不使用某一天冒充整个月或季度。'
	},
	accessibility: [
		'网格使用一个roving焦点；方向键、首尾和分页导航保持焦点与选择分离。',
		'required只使空选择无效，不拦截用户清空；disabled停止交互，readonly保留浏览但不允许写值。',
		'周单元明确显示周号与日期边界，财年和周规则随值保存。'
	],
	demos: [
		{
			id: 'period-calendar-granularity',
			title: '四种明确的周期值',
			component: GranularityDemo,
			source: granularitySource,
			covers: ['basic-render', 'keyboard', 'locale'],
			description: 'Month/Year/Quarter/Week由同一运行时和网格选择基础承接。'
		},
		{
			id: 'period-calendar-selection',
			title: '多选与范围',
			component: SelectionDemo,
			source: selectionSource,
			covers: ['controlled', 'keyboard'],
			description: '多选保留输入顺序；范围允许partial草稿和预览。'
		},
		{
			id: 'period-calendar-rules',
			title: '财年与周规则',
			component: RulesDemo,
			source: rulesSource,
			covers: ['controlled', 'locale'],
			description: '明确跨年季度与周定义，切换显示locale不会改写业务规则。'
		},
		{
			id: 'period-calendar-form',
			title: '唯一模型与表单',
			component: FormDemo,
			source: formSource,
			covers: ['form-data', 'form-reset', 'invalid'],
			description: '模型保留MonthPeriod，表单序列化为YYYY-MM。'
		}
	]
});
