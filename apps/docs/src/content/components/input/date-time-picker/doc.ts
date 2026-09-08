import { dateTimePickerMetadata } from '@zadmin/zui/metadata';
import { dateTimePickerApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import ConstraintsDemo from './ConstraintsDemo.svelte';
import constraintsSource from './ConstraintsDemo.svelte?raw';
import PresetsDemo from './PresetsDemo.svelte';
import presetsSource from './PresetsDemo.svelte?raw';
import FamilyDemo from './FamilyDemo.svelte';
import familySource from './FamilyDemo.svelte?raw';
import InlineDemo from './InlineDemo.svelte';
import inlineSource from './InlineDemo.svelte?raw';

export const dateTimePickerDoc = defineComponentDoc(dateTimePickerMetadata, {
	profiles: ['form-control', 'layer'],
	sourceApi: dateTimePickerApiFacts,
	teaching: {
		summary:
			'由 DateTimeField、Calendar 和共享时间面板组合的实验性选择器。根组件唯一持有值、打开状态与表单条目，local/zoned 类型明确，面板支持确认或即时提交。'
	},
	accessibility: [
		'字段分段拥有名称并支持逻辑方向键；弹层与触发器共享可访问名称，关闭恢复焦点。',
		'日历日期边界与具体时刻约束分别处理；联合不可用或 DST 错误通过可访问状态反馈。',
		'disabled 和 readonly 统一阻止写入；减少动画偏好由共享 Popover/Presence 处理。'
	],
	demos: [
		{
			id: 'date-time-picker-inline',
			title: '内嵌日期时间与同一表单',
			component: InlineDemo,
			source: inlineSource,
			covers: ['composition', 'form-data', 'form-reset', 'controlled'],
			description:
				'presentation=inline常驻显示共享面板，复用相同owner与confirm/immediate策略；不接受浮层open和placement参数。'
		},
		{
			id: 'date-time-picker-value',
			title: '值、打开状态与提交策略',
			component: BasicDemo,
			source: basicSource,
			covers: ['basic-render', 'controlled', 'external-clear', 'keyboard', 'portal'],
			description: 'value、open 与 panelDraft 分开；完整字段输入和显式面板提交具有不同的回调语义。'
		},
		{
			id: 'date-time-picker-constraints',
			title: '日期与时间联合约束',
			component: ConstraintsDemo,
			source: constraintsSource,
			covers: ['invalid', 'locale'],
			description: 'min/max 按完整日期时间比较，边界日仍可选择其它有效时刻，时区模式明确处理 DST。'
		},
		{
			id: 'date-time-picker-presets',
			title: '预设与当前时刻',
			component: PresetsDemo,
			source: presetsSource,
			covers: ['controlled', 'portal'],
			description: '静态与惰性预设、当前时刻复用同一校验和确认流程。'
		},
		{
			id: 'date-time-picker-family',
			title: '五档尺寸、表单与偏好轴',
			component: FamilyDemo,
			source: familySource,
			covers: [
				'controlled',
				'density',
				'disabled',
				'external-clear',
				'form-data',
				'form-reset',
				'keyboard',
				'readonly',
				'reduced-motion',
				'rtl'
			],
			description:
				'内部字段、触发操作和面板共享尺寸；Form model是唯一值owner，外部清空/reset重建confirm草稿，Provider切换RTL与reduced motion。'
		}
	]
});
