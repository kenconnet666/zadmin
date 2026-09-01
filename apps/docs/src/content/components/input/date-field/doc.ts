import { dateFieldMetadata } from '@zadmin/zui/metadata';
import { dateFieldApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
import BoundsDemo from './BoundsDemo.svelte';
import boundsSource from './BoundsDemo.svelte?raw';
import CompositionDemo from './CompositionDemo.svelte';
import compositionSource from './CompositionDemo.svelte?raw';
import ControlledDemo from './ControlledDemo.svelte';
import controlledSource from './ControlledDemo.svelte?raw';
import FormDemo from './FormDemo.svelte';
import formSource from './FormDemo.svelte?raw';
import LocalesDemo from './LocalesDemo.svelte';
import localesSource from './LocalesDemo.svelte?raw';

export const dateFieldDoc = defineComponentDoc(dateFieldMetadata, {
	profiles: ['form-control'],
	sourceApi: dateFieldApiFacts,
	teaching: {
		props: {
			controlId: {
				default: 'Field controlId或生成ID',
				description: '第一segment的真实焦点ID，也是Field label目标。'
			},
			disabled: {
				default: 'Field context或false',
				description: '禁用全部segments并退出FormData。'
			},
			form: { default: '最近祖先form', description: '把FormValueBridge关联到指定form id。' },
			invalid: {
				default: 'Field context或false',
				description: '与非法草稿共同投射aria-invalid和data-invalid。'
			},
			isDateUnavailable: {
				default: 'undefined',
				description: '拒绝直接输入，并让键盘cycle跳过特定CalendarDate。'
			},
			onReset: {
				default: 'undefined',
				description: '表单reset恢复defaultValue后通知复合外层清理辅助状态。'
			},
			onValueChange: {
				default: 'undefined',
				description: '用户提交完整日期或清空全部segments后触发。'
			},
			readonly: {
				default: 'Field context或false',
				description: '保持可聚焦、可选择文本和值提交，阻止所有写入。'
			},
			ref: { default: 'null', description: '真实segment group引用。' },
			required: { default: 'Field context或false', description: '向group与segments投射必填语义。' }
		},
		summary:
			'本地化CalendarDate分段字段：locale驱动DOM顺序、nullable owner、完整/非法草稿分离、边界与不可用日期、Field焦点、FormValueBridge/reset及可复用bare外观。'
	},
	demos: [
		{
			component: FormDemo,
			covers: ['basic-render', 'form-data', 'form-reset', 'keyboard', 'uncontrolled'],
			description:
				'year/month/day按locale顺序编辑，完整值才提交CalendarDate，reset恢复defaultValue。',
			id: 'date-field-segments-form',
			source: formSource,
			title: '日期segments与表单'
		},
		{
			component: LocalesDemo,
			covers: ['accessible-name', 'disabled', 'locale', 'readonly', 'rtl'],
			description: 'en-US与zh-CN改变segment顺序；readonly和disabled保持不同焦点与提交语义。',
			id: 'date-field-locales',
			source: localesSource,
			title: 'Locale、只读与禁用'
		},
		{
			component: BoundsDemo,
			covers: ['focus', 'invalid', 'keyboard', 'variants-and-states'],
			description: 'min/max约束键盘cycle，越界或不可用直接输入保留草稿并暴露invalid。',
			id: 'date-field-bounds',
			source: boundsSource,
			title: '边界与草稿验证'
		},
		{
			component: ControlledDemo,
			covers: ['controlled', 'external-clear'],
			description: 'owner以CalendarDate或显式null控制字段；外部同步不会伪造用户回调。',
			id: 'date-field-controlled-null',
			source: controlledSource,
			title: '受控值与显式空值'
		},
		{
			component: CompositionDemo,
			covers: ['composition', 'native-props'],
			description:
				'bare与formParticipation=none允许InputGroup或自定义Picker复用UI，由外层唯一拥有表单和reset。',
			id: 'date-field-composition',
			source: compositionSource,
			title: '复合输入复用边界'
		}
	],
	accessibility: [
		'group获得Field或后备日期名称；第一segment使用controlId，其他segment使用typed locale名称并共享description/invalid关系。',
		'左右、Home/End按真实locale DOM顺序移动，RTL使用逻辑方向；上下键通过CalendarDate.cycle处理闰年和月长。',
		'输入中的partial/非法文本只存在于segment草稿；完整可用日期才更新value和ISO FormData。',
		'readonly保持Tab焦点、文本选择与FormData，disabled使用原生disabled并退出提交。',
		'formParticipation=none只用于复合owner，避免嵌套DateField产生重复hidden input或reset listener。'
	],
	keywords: ['date field', 'segments', 'calendar date', 'locale', 'form', 'nullable']
});
