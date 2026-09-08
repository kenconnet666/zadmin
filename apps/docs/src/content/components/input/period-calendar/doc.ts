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
import ContentDemo from './ContentDemo.svelte';
import contentSource from './ContentDemo.svelte?raw';

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
			id: 'period-calendar-content-snippets',
			title: '周期内容与页头定制',
			component: ContentDemo,
			source: contentSource,
			covers: ['accessible-name', 'composition', 'keyboard'],
			description: 'periodCell与header共享只读上下文，内部button、grid、选择和Form owner保持不变。'
		},
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
			covers: ['controlled', 'disabled', 'keyboard', 'locale'],
			description:
				'财年与周规则保存在值中；isPeriodUnavailable禁用第2周，方向键跳过后可选择相邻可用周。'
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
