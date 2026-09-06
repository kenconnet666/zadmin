import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import { timePickerMetadata } from '@zadmin/zui/metadata';
import { timePickerApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
import ConstraintsDemo from './ConstraintsDemo.svelte';
import constraintsSource from './ConstraintsDemo.svelte?raw';
import FormDemo from './FormDemo.svelte';
import formSource from './FormDemo.svelte?raw';
import ModesDemo from './ModesDemo.svelte';
import modesSource from './ModesDemo.svelte?raw';

export const timePickerDoc = defineComponentDoc(timePickerMetadata, {
	profiles: ['form-control', 'layer'],
	sourceApi: timePickerApiFacts,
	teaching: {
		props: {
			clearable: { default: 'true', description: '有值时显示清空 action；清空提交显式 null。' },
			defaultOpen: {
				default: 'false',
				description: '非受控初始 Popover 状态；表单 reset 时关闭。'
			},
			defaultValue: { default: 'null', description: '非受控初始 Time；空值必须显式使用 null。' },
			disabled: {
				default: 'Field context 或 false',
				description: '禁用字段、trigger、clear、面板并退出 FormData。'
			},
			form: {
				default: '最近祖先 form',
				description: '把唯一 FormValueBridge 关联到指定 form id。'
			},
			formatOptions: {
				default: '按 granularity 与 hourCycle',
				description: '只控制 trigger 的本地化 display；Time owner 仍保留已有的小时、分钟和秒精度。'
			},
			granularity: {
				default: "'minute'",
				description: '决定字段与面板显示到 hour、minute 或 second；已有 Time 的隐藏精度仍保留。'
			},
			hourCycle: {
				default: 'locale 规则',
				description: '显式选择 12 或 24 小时制；12 小时制只改变显示与列。'
			},
			invalid: {
				default: 'Field context 或 false',
				description: '同步 InputGroup、TimeField 和 ARIA 无效状态。'
			},
			isTimeUnavailable: {
				default: 'undefined',
				description: '拒绝完整 Time；字段输入、列选项与确认共享同一个谓词。'
			},
			locale: {
				default: 'Provider locale',
				description:
					'决定字段/列顺序、数字格式、day period 和 trigger 文案；locale pack 由 Provider 复用。'
			},
			maxValue: { default: 'undefined', description: '字段、面板和确认共享的最晚 Time。' },
			minValue: { default: 'undefined', description: '字段、面板和确认共享的最早 Time。' },
			name: {
				default: 'Field context 或 undefined',
				description: '唯一 ISO Time FormData 字段名。'
			},
			onOpenChange: {
				default: 'undefined',
				description: 'Popover 打开状态变化时触发；外部写入 open 不伪造用户事件。'
			},
			onValueChange: {
				default: 'undefined',
				description: '字段编辑、面板确认或清空后返回 Time/null；面板草稿不会触发。'
			},
			open: { default: 'false', description: '受控 Popover 状态；readonly/disabled 会拒绝打开。' },
			placement: {
				default: "'bottom-start'",
				description: '复用 ZPopover 的逻辑定位与 RTL 解析。'
			},
			readonly: {
				default: 'Field context 或 false',
				description: '保留字段焦点和值提交，停用编辑、Popover 和清空 action。'
			},
			ref: {
				default: 'null',
				description: '真实 Picker 根引用，供 owner realm 的 focus/portal 生命周期使用。'
			},
			required: {
				default: 'Field context 或 false',
				description: '投射到唯一可编辑 TimeField 的必填语义。'
			},
			secondStep: { default: '1', description: '秒列离散步长；只有 granularity="second" 时显示。' },
			size: {
				default: 'Field/Provider input 默认',
				description: '统一字段、action 与面板列的五档尺寸。'
			},
			value: {
				default: 'null',
				description: '唯一受控业务值，类型为 Time | null；null 表示显式空值。'
			}
		},
		summary:
			'实验性 Time Picker：以唯一 Time/null owner 组合可编辑 TimeField、有限时间列、复用 ZPopover 和真实表单语义；面板选择先进入草稿，确认后提交。'
	},
	demos: [
		{
			component: BasicDemo,
			covers: ['basic-render', 'controlled', 'external-clear', 'focus', 'keyboard', 'portal'],
			description:
				'受控 value/open 演示唯一 Time owner；点击或空格只更新面板草稿，Enter/确认提交，Escape 放弃。',
			id: 'time-picker-controlled-draft',
			source: basicSource,
			title: '受控值、打开状态与面板草稿'
		},
		{
			component: ConstraintsDemo,
			covers: ['invalid', 'keyboard', 'variants-and-states'],
			description:
				'空值范围、全部不可用和 isTimeUnavailable 展示完整 Time 约束如何同时作用于字段、列与确认。',
			id: 'time-picker-constraints',
			source: constraintsSource,
			title: '空值、范围与不可用时间'
		},
		{
			component: ModesDemo,
			covers: ['disabled', 'readonly', 'variants-and-states', 'density', 'keyboard'],
			description:
				'五档尺寸、12/24 小时制、hour/minute/second 粒度与步长，以及 readonly/disabled 的正交状态。',
			id: 'time-picker-modes',
			source: modesSource,
			title: '尺寸、小时制、粒度与状态'
		},
		{
			component: FormDemo,
			covers: ['basic-render', 'form-data', 'form-reset', 'uncontrolled', 'controlled'],
			description:
				'真实 ZForm 只持有一个 Time；FormData 序列化 ISO 字符串，reset 恢复默认，同值新 Time 不改变 dirty 或事件计数。',
			id: 'time-picker-form-model',
			source: formSource,
			title: 'ZForm、FormData 与同值模型'
		}
	],
	accessibility: [
		'ZField label 指向唯一 TimeField；trigger 使用 dialog popup 语义并由 pickerLabel/triggerLabel 提供可访问名称。',
		'面板列是带 active descendant 的 listbox；上下/Home/End 在列内移动，左右按 locale 书写方向切换相邻列。',
		'点击或空格只更新面板草稿；列上 Enter 或 footer 确认提交完整 Time，Escape 关闭 Popover 并丢弃草稿。',
		'Time 是无时区 wall-clock 模型；granularity/hourCycle 只改变可见列与格式，已有 Time 的小时、分钟、秒精度保持在 owner 中。',
		'Popover、focus 恢复、reduced-motion 和 locale 解析复用 ZPopover/Provider 的现有边界；组件当前标记为 experimental。'
	],
	keywords: ['time picker', 'time field', 'popover', 'draft', 'controlled', 'form', 'nullable']
});
