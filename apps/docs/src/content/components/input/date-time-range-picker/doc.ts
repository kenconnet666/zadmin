import { dateTimeRangePickerMetadata } from '@zadmin/zui/metadata';
import { dateTimeRangePickerApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import ConstraintsDemo from './ConstraintsDemo.svelte';
import constraintsSource from './ConstraintsDemo.svelte?raw';
import FamilyDemo from './FamilyDemo.svelte';
import familySource from './FamilyDemo.svelte?raw';

export const dateTimeRangePickerDoc = defineComponentDoc(dateTimeRangePickerMetadata, {
	profiles: ['form-control', 'layer'],
	sourceApi: dateTimeRangePickerApiFacts,
	teaching: {
		summary:
			'实验性日期时间范围选择器。两个 DateTimeField 与一个共享 DateTimePickerPanel 组合，根组件唯一管理范围值、表单端点和提交策略，支持 local/zoned、部分范围与显式排序。'
	},
	accessibility: [
		'开始与结束字段拥有独立名称，面板端点切换按钮说明当前编辑目标。',
		'日期边界、完整时刻、排序后的端点角色和整个范围共同参与验证；错误通过共享 locale 消息表达。',
		'统一禁用、只读、方向和焦点回收；显式取消撤销尚未提交的面板草稿。'
	],
	demos: [
		{
			id: 'date-time-range-picker-basic',
			title: '范围面板、预设与确认',
			component: BasicDemo,
			source: basicSource,
			covers: ['basic-render', 'controlled', 'portal', 'keyboard'],
			description: '日历与时间列复用单值选择器的共享面板；跨日范围保留完整日期语义。'
		},
		{
			id: 'date-time-range-picker-constraints',
			title: '时区、部分范围与排序',
			component: ConstraintsDemo,
			source: constraintsSource,
			covers: ['locale', 'invalid', 'controlled'],
			description:
				'值所属时区与显示时区分离；严格顺序和显式排序可按业务选择，空端点不会被自动补成完整范围。'
		},
		{
			id: 'date-time-range-picker-family',
			title: '五档尺寸、状态与表单',
			component: FamilyDemo,
			source: familySource,
			covers: ['density', 'disabled', 'readonly', 'form-data', 'form-reset'],
			description:
				'两个字段按空间换行，唯一根桥接 window.start/window.end；重置恢复模型与两端草稿。'
		}
	]
});
