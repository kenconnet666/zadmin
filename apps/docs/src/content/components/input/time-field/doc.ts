import { timeFieldMetadata } from '@zadmin/zui/metadata';
import { timeFieldApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
import AvailabilityDemo from './AvailabilityDemo.svelte';
import availabilitySource from './AvailabilityDemo.svelte?raw';
import ControlledDemo from './ControlledDemo.svelte';
import controlledSource from './ControlledDemo.svelte?raw';
import FormDemo from './FormDemo.svelte';
import formSource from './FormDemo.svelte?raw';
import LocaleDemo from './LocaleDemo.svelte';
import localeSource from './LocaleDemo.svelte?raw';
import ModesDemo from './ModesDemo.svelte';
import modesSource from './ModesDemo.svelte?raw';

export const timeFieldDoc = defineComponentDoc(timeFieldMetadata, {
	profiles: ['form-control'],
	sourceApi: timeFieldApiFacts,
	teaching: {
		props: {
			controlId: {
				default: 'Field controlId或生成ID',
				description: '第一时间segment的真实焦点ID。'
			},
			disabled: {
				default: 'Field context或false',
				description: '禁用全部segments/day period并退出FormData。'
			},
			form: { default: '最近祖先form', description: '把FormValueBridge关联到指定form id。' },
			invalid: {
				default: 'Field context或false',
				description: '与非法/不可用草稿共同投射无效状态。'
			},
			isTimeUnavailable: {
				default: 'undefined',
				description: '拒绝特定Time，cycle沿当前segment继续寻找可用值。'
			},
			locale: {
				default: 'Provider locale',
				description: '决定segment、literal与day period的真实DOM顺序。'
			},
			maxValue: { default: 'undefined', description: '最大可提交Time。' },
			minValue: { default: 'undefined', description: '最小可提交Time。' },
			onReset: { default: 'undefined', description: '表单reset后通知复合外层清理辅助状态。' },
			onValueChange: {
				default: 'undefined',
				description: '用户提交完整时间或清空全部segments后触发。'
			},
			readonly: {
				default: 'Field context或false',
				description: '保留焦点、文本选择和值提交，阻止写入与period切换。'
			},
			ref: { default: 'null', description: '真实时间segment group引用。' },
			required: { default: 'Field context或false', description: '向group和segments投射必填语义。' }
		},
		summary:
			'本地化Time分段字段：Intl顺序、12/24小时、minute/second granularity与step、nullable owner、不可用值、Field/FormValueBridge/reset和复合bare外观。'
	},
	demos: [
		{
			component: FormDemo,
			covers: ['basic-render', 'form-data', 'form-reset', 'keyboard', 'uncontrolled'],
			description: '小时、分钟、秒独立编辑和cycle，完整Time以ISO字符串提交并在reset恢复。',
			id: 'time-field-segments-form',
			source: formSource,
			title: '时间segments与表单'
		},
		{
			component: ModesDemo,
			covers: ['disabled', 'keyboard', 'readonly', 'variants-and-states'],
			description: '12/24小时、minute/second granularity、步长、readonly与disabled保持正交。',
			id: 'time-field-modes',
			source: modesSource,
			title: '小时制、粒度与步长'
		},
		{
			component: LocaleDemo,
			covers: ['accessible-name', 'locale', 'rtl'],
			description:
				'Intl locale决定segment/day period位置；typed locale pack提供各segment名称与后备hourCycle。',
			id: 'time-field-locale',
			source: localeSource,
			title: 'Locale、day period与顺序'
		},
		{
			component: ControlledDemo,
			covers: ['controlled', 'external-clear'],
			description: 'owner用Time或显式null控制字段，秒级值和外部清空共享同一value。',
			id: 'time-field-controlled-null',
			source: controlledSource,
			title: '受控值与显式空值'
		},
		{
			component: AvailabilityDemo,
			covers: ['focus', 'invalid', 'native-props'],
			description:
				'min/max与isTimeUnavailable共同约束直接输入和键盘cycle，非法草稿不会污染FormData。',
			id: 'time-field-availability',
			source: availabilitySource,
			title: '可用时段与草稿验证'
		}
	],
	accessibility: [
		'group获得Field或后备时间名称；各segment拥有typed locale名称，第一segment使用稳定controlId。',
		'Intl formatToParts决定segment、literal与day period DOM顺序；左右/Home/End按该顺序移动并支持RTL。',
		'ArrowUp/Down按hour、minuteStep或secondStep cycle；day period segment也能用方向键或按钮切换。',
		'直接输入只在所有显示segments完整且可用时更新Time；非法/partial草稿设置aria-invalid。',
		'Time是无时区wall-clock模型；时区日期时间和DST折叠明确后置给未来ZDateTimeField。'
	],
	keywords: ['time field', 'segments', 'hour cycle', 'granularity', 'step', 'nullable']
});
