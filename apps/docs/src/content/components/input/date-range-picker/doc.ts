import { dateRangePickerMetadata } from '@zadmin/zui/metadata';
import { dateRangePickerApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
import FormDemo from './FormDemo.svelte';
import formSource from './FormDemo.svelte?raw';
import LocaleRtlDemo from './LocaleRtlDemo.svelte';
import localeRtlSource from './LocaleRtlDemo.svelte?raw';
import NormalizeDemo from './NormalizeDemo.svelte';
import normalizeSource from './NormalizeDemo.svelte?raw';
import PartialDemo from './PartialDemo.svelte';
import partialSource from './PartialDemo.svelte?raw';
import StatesDemo from './StatesDemo.svelte';
import statesSource from './StatesDemo.svelte?raw';

export const dateRangePickerDoc = defineComponentDoc(dateRangePickerMetadata, {
	profiles: ['form-control', 'layer'],
	sourceApi: dateRangePickerApiFacts,
	teaching: {
		props: {
			calendarLabel: {
				default: 'localePack.date.chooseDateRange',
				description: 'Calendar dialog和Lucide trigger可访问名称。'
			},
			clearLabel: {
				default: 'localePack.date.clearDateRange',
				description: '清空两端日期按钮的可访问名称。'
			},
			controlId: {
				default: 'Field controlId或生成ID',
				description: 'start DateField第一segment的真实ID和Field label目标。'
			},
			defaultOpen: { default: 'false', description: '非受控初始Popover状态；reset总是关闭。' },
			disabled: {
				default: 'Field context或false',
				description: '禁用两个DateField、actions、Calendar并退出FormData。'
			},
			endLabel: {
				default: 'localePack.date.endDate',
				description: 'end DateField group可访问名称。'
			},
			firstDayOfWeek: { default: 'locale规则', description: '显式Calendar周起始日。' },
			form: { default: '最近祖先form', description: '外层唯一FormValueBridge关联指定form id。' },
			invalid: {
				default: 'Field context或false',
				description: '同步范围group、两个DateField和ARIA无效状态。'
			},
			locale: {
				default: 'Provider locale',
				description: '两个DateField顺序、Calendar标题与日期名称的BCP 47 locale。'
			},
			maxValue: { default: 'undefined', description: '两个DateField与Calendar共享最大日期。' },
			minValue: { default: 'undefined', description: '两个DateField与Calendar共享最小日期。' },
			name: {
				default: 'Field context或—',
				description: '以name.start/name.end分别提交存在的ISO日期。'
			},
			onOpenChange: { default: 'undefined', description: '用户打开或关闭Popover时触发。' },
			onValueChange: {
				default: 'undefined',
				description: '每次字段编辑、日历选择阶段或清空后返回partial/complete/null。'
			},
			placement: {
				default: "'bottom-start'",
				description: '逻辑start浮层定位；RTL由Floating解析。'
			},
			readonly: {
				default: 'Field context或false',
				description: '两个DateField保持焦点和值提交，Calendar/clear停用。'
			},
			ref: { default: 'null', description: '真实Range Picker根和owner realm锚点。' },
			required: {
				default: 'Field context或false',
				description: '向两端DateField和范围group投射必填语义。'
			},
			showOutsideDates: { default: 'true', description: '控制Calendar相邻月份日期按钮。' },
			startLabel: {
				default: 'localePack.date.startDate',
				description: 'start DateField group可访问名称。'
			},
			timeZone: {
				default: 'Provider timeZone',
				description: '两个字段pattern和Calendar today/ARIA共享IANA时区。'
			}
		},
		summary:
			'生产Date Range Picker：两个可编辑DateField、partial start/end、完整反向规范化、按端可用性、Calendar range preview、value/open双owner、typed locale/RTL和唯一双字段FormValueBridge。'
	},
	demos: [
		{
			component: FormDemo,
			covers: ['basic-render', 'form-data', 'form-reset', 'keyboard', 'uncontrolled'],
			description:
				'两个DateField与两阶段Calendar更新同一range；存在的端点分别以window.start/end提交并reset。',
			id: 'date-range-picker-form',
			source: formSource,
			title: '可编辑发布窗口与表单'
		},
		{
			component: StatesDemo,
			covers: ['disabled', 'invalid', 'readonly', 'variants-and-states'],
			description: '空值、readonly提交和disabled退出提交共享同一partial-capable范围合同。',
			id: 'date-range-picker-states',
			source: statesSource,
			title: '空值、只读与禁用'
		},
		{
			component: PartialDemo,
			covers: ['controlled', 'external-clear', 'form-data'],
			description: 'start-only和end-only都是可观察草稿；完整前只提交存在端点，null清空两端。',
			id: 'date-range-picker-partial',
			source: partialSource,
			title: 'Partial范围与显式空值'
		},
		{
			component: NormalizeDemo,
			covers: ['composition', 'focus', 'native-props'],
			description: '完整反向范围交换为时间顺序；isDateUnavailable按start/end角色施加不同规则。',
			id: 'date-range-picker-normalize',
			source: normalizeSource,
			title: '反向规范化与端点约束'
		},
		{
			component: LocaleRtlDemo,
			covers: ['accessible-name', 'locale', 'portal', 'resource-cleanup', 'rtl', 'ssr'],
			description: 'ar-EG、RTL、周六起始和Asia/Riyadh时区统一两个字段、逻辑定位与Calendar。',
			id: 'date-range-picker-locale-rtl',
			source: localeRtlSource,
			title: 'Locale、时区与RTL'
		}
	],
	accessibility: [
		'范围group由ZField命名，Field label指向start第一segment；start/end DateField另有typed locale名称。',
		'Calendar第一次选择立即发布start-only并保持打开，第二次选择规范化完整范围；焦点移动实时预览区间。',
		'完整反向范围使用同一normalizeRange策略交换端点；partial start/end不会被伪造成完整范围。',
		'两个内部DateField与Calendar均formParticipation=none；外层只创建一个reset owner和存在端点的name.start/end entries。',
		'readonly保留两个字段焦点与partial/complete FormData但停用actions；disabled退出交互和全部entries。'
	],
	keywords: ['date range picker', 'partial range', 'calendar range', 'popover', 'rtl', 'form']
});
