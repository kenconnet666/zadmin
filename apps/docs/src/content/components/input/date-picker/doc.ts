import { datePickerMetadata } from '@zadmin/zui/metadata';
import { datePickerApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
import ConstraintsDemo from './ConstraintsDemo.svelte';
import constraintsSource from './ConstraintsDemo.svelte?raw';
import ControlledDemo from './ControlledDemo.svelte';
import controlledSource from './ControlledDemo.svelte?raw';
import FormDemo from './FormDemo.svelte';
import formSource from './FormDemo.svelte?raw';
import LocaleRtlDemo from './LocaleRtlDemo.svelte';
import localeRtlSource from './LocaleRtlDemo.svelte?raw';
import PersistentDemo from './PersistentDemo.svelte';
import persistentSource from './PersistentDemo.svelte?raw';

export const datePickerDoc = defineComponentDoc(datePickerMetadata, {
	profiles: ['form-control', 'layer'],
	sourceApi: datePickerApiFacts,
	teaching: {
		props: {
			calendarLabel: {
				default: 'localePack.date.chooseDate',
				description: 'Calendar dialog与Lucide trigger的后备可访问名称。'
			},
			clearLabel: {
				default: 'localePack.date.clearDate',
				description: '有值时清空按钮的可访问名称。'
			},
			defaultOpen: { default: 'false', description: '非受控初始Popover状态；表单reset始终关闭。' },
			disabled: {
				default: 'Field context或false',
				description: '禁用DateField、actions、Calendar并退出FormData。'
			},
			firstDayOfWeek: { default: 'locale规则', description: '显式Calendar周起始日。' },
			form: { default: '最近祖先form', description: '外层唯一FormValueBridge关联到指定form id。' },
			formatOptions: {
				default: 'long date',
				description: '只用于triggerLabel接收的本地化display描述，不改变segment结构。'
			},
			invalid: {
				default: 'Field context或false',
				description: '同步InputGroup、DateField与ARIA无效状态。'
			},
			locale: {
				default: 'Provider locale',
				description: 'DateField顺序、Calendar周标题和完整日期名称的BCP 47 locale。'
			},
			maxValue: { default: 'undefined', description: 'DateField与Calendar共享最大日期。' },
			minValue: { default: 'undefined', description: 'DateField与Calendar共享最小日期。' },
			name: { default: 'Field context或—', description: '唯一ISO CalendarDate FormData字段名。' },
			onOpenChange: { default: 'undefined', description: '用户打开或关闭Popover时触发。' },
			onValueChange: {
				default: 'undefined',
				description: 'segment编辑、Calendar选择或清空后返回CalendarDate/null。'
			},
			placeholder: {
				default: 'localePack.date.chooseDate',
				description: '空值时传给triggerLabel的可访问display提示。'
			},
			placement: { default: "'bottom-start'", description: '逻辑start定位；RTL由Floating解析。' },
			readonly: {
				default: 'Field context或false',
				description: 'DateField保持可聚焦和值提交，Calendar/clear actions停用。'
			},
			ref: { default: 'null', description: '真实Picker根，负责owner realm焦点恢复。' },
			required: {
				default: 'Field context或false',
				description: '投射到可编辑DateField的必填语义。'
			},
			showOutsideDates: { default: 'true', description: '控制Calendar是否渲染相邻月份日期按钮。' },
			timeZone: {
				default: 'Provider timeZone',
				description: 'DateField pattern、Calendar today与trigger格式化使用同一IANA时区。'
			},
			triggerLabel: {
				default: 'calendarLabel',
				description: '根据本地化display生成Calendar trigger可访问名称。'
			}
		},
		summary:
			'可编辑Date Picker：复用bare ZDateField、ZInputGroup、Lucide actions和owner-realm ZPopover/ZCalendar；value/open双owner、显式null、约束、clear/readonly/Field与唯一FormValueBridge。'
	},
	demos: [
		{
			component: FormDemo,
			covers: ['basic-render', 'form-data', 'form-reset', 'keyboard', 'uncontrolled'],
			description:
				'DateField可直接键入，Calendar可视选择；两条路径更新同一CalendarDate并由外层唯一提交。',
			id: 'date-picker-editable-form',
			source: formSource,
			title: '可编辑日期选择与表单'
		},
		{
			component: ConstraintsDemo,
			covers: ['disabled', 'invalid', 'readonly', 'variants-and-states'],
			description:
				'min/max共享给字段和Calendar；readonly保留编辑焦点/提交但停用actions，disabled退出全部。',
			id: 'date-picker-constraints',
			source: constraintsSource,
			title: '约束、只读与禁用'
		},
		{
			component: ControlledDemo,
			covers: ['controlled', 'external-clear', 'portal', 'resource-cleanup'],
			description: 'open和value由两个owner独立控制；外部null清空及外部打开不会伪造另一个回调。',
			id: 'date-picker-controlled',
			source: controlledSource,
			title: '双受控owner与清空'
		},
		{
			component: LocaleRtlDemo,
			covers: ['accessible-name', 'locale', 'rtl', 'ssr'],
			description: 'ar-EG、RTL、周六起始和显式Asia/Riyadh时区统一字段、定位与Calendar。',
			id: 'date-picker-locale-rtl',
			source: localeRtlSource,
			title: 'Locale、时区与RTL'
		},
		{
			component: PersistentDemo,
			covers: ['composition', 'focus', 'native-props'],
			description:
				'closeOnSelect=false、clearable=false、周末不可用和outside dates策略展示可组合交互取舍。',
			id: 'date-picker-persistent',
			source: persistentSource,
			title: '持续打开与可用性策略'
		}
	],
	accessibility: [
		'ZField label指向第一DateField segment；Calendar trigger是独立原生button，使用aria-haspopup=dialog/expanded/controls。',
		'DateField保留完整分段键盘；打开后Calendar focusedValue获得焦点，Escape或选择关闭时焦点回到触发按钮。',
		'内部DateField与Calendar使用formParticipation=none；仅Picker外层FormValueBridge提交/reset，避免重复hidden input和listener。',
		'readonly保留DateField Tab焦点、文本读取和FormData，但禁用Calendar与clear actions；disabled使用原生disabled并退出提交。',
		'Popover portal、focus和延迟恢复均从真实根/trigger ownerDocument解析，不依赖全局window。'
	],
	keywords: ['date picker', 'date field', 'calendar', 'popover', 'controlled', 'form']
});
