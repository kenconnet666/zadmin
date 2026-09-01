import { numberFieldMetadata } from '@zadmin/zui/metadata';
import { numberFieldApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
import ControlledDemo from './ControlledDemo.svelte';
import controlledSource from './ControlledDemo.svelte?raw';
import FormDemo from './FormDemo.svelte';
import formSource from './FormDemo.svelte?raw';
import ParserFormatterDemo from './ParserFormatterDemo.svelte';
import parserFormatterSource from './ParserFormatterDemo.svelte?raw';
import PrecisionDemo from './PrecisionDemo.svelte';
import precisionSource from './PrecisionDemo.svelte?raw';
import StatesDemo from './StatesDemo.svelte';
import statesSource from './StatesDemo.svelte?raw';

export const numberFieldDoc = defineComponentDoc(numberFieldMetadata, {
	demos: [
		{
			component: FormDemo,
			covers: [
				'accessible-name',
				'basic-render',
				'focus',
				'form-data',
				'form-reset',
				'keyboard',
				'locale',
				'uncontrolled'
			],
			description:
				'非编辑态按locale分组显示，focus后进入无分组编辑；表单只提交规范化数值并恢复defaultValue。',
			id: 'number-field-locale-form',
			source: formSource,
			title: '本地数字、步进与表单'
		},
		{
			component: StatesDemo,
			covers: ['disabled', 'invalid', 'readonly', 'variants-and-states'],
			description: '货币格式、只读、越界和禁用状态共享同一spinbutton、Field与主题合同。',
			id: 'number-field-states',
			source: statesSource,
			title: '格式与编辑状态'
		},
		{
			component: ControlledDemo,
			covers: ['controlled', 'external-clear'],
			description:
				'受控owner可以写入有限数值，也可以在组件已建立数值后显式写回undefined清空显示和FormData。',
			id: 'number-field-controlled-clear',
			source: controlledSource,
			title: '受控值与外部清空'
		},
		{
			component: PrecisionDemo,
			covers: ['density', 'keyboard', 'locale', 'variants-and-states'],
			description:
				'precision统一提交精度和默认显示，pageStep驱动Page键与Shift步进，尺寸继承Field或Provider density。',
			id: 'number-field-precision-step',
			source: precisionSource,
			title: '精度、大步进与尺寸'
		},
		{
			component: ParserFormatterDemo,
			covers: ['controlled', 'invalid', 'locale', 'native-props'],
			description:
				'成对parser/formatter只负责业务表示；allowOutOfRange保留直接输入，但所有步进交互仍夹紧到边界。',
			id: 'number-field-parser-formatter',
			source: parserFormatterSource,
			title: 'Parser、Formatter与越界策略'
		}
	],
	profiles: ['form-control', 'animated'],
	sourceApi: numberFieldApiFacts,
	teaching: {
		props: {
			decrementLabel: {
				default: 'localePack.numberField.decrement',
				description: '减少按钮的可访问名称与title；显式值优先于Provider locale pack。'
			},
			disabled: {
				default: 'Field context或false',
				description: '停用输入、步进按钮和FormData参与。'
			},
			form: {
				default: '最近祖先form',
				description: '把FormValueBridge关联到指定form id。'
			},
			incrementLabel: {
				default: 'localePack.numberField.increment',
				description: '增加按钮的可访问名称与title；显式值优先于Provider locale pack。'
			},
			inputId: {
				default: 'Field controlId或生成ID',
				description: 'spinbutton输入ID，同时被步进按钮aria-controls引用。'
			},
			inputLabel: {
				default: 'localePack.numberField.inputLabel',
				description: '没有ZField或原生aria-label/aria-labelledby时的后备可访问名称。'
			},
			placeholder: {
				default: 'undefined',
				description: '空值时显示的原生输入提示；不能替代可访问名称。'
			},
			readonly: {
				default: 'Field context或false',
				description: '保留焦点、复制和FormData，阻止输入与所有步进写入。'
			},
			required: {
				default: 'Field context或false',
				description: '把空值纳入原生required验证；FormData仍只包含已提交的有限数值。'
			}
		},
		summary:
			'面向本地化后台表单的text spinbutton：区分编辑草稿与数值状态，支持精度、步进、越界策略、可逆格式化与完整Field/FormValueBridge合同。'
	},
	accessibility: [
		'可编辑input是唯一Tab停靠点并保留平台文本编辑键；相邻Lucide步进按钮使用tabindex=-1、aria-controls、可访问名称和title，点击后焦点返回input。',
		'ArrowUp/ArrowDown按step增减，PageUp/PageDown与Shift+方向键按pageStep增减；Home/End仅在已知min/max时生效。',
		'aria-valuenow/min/max/valueText始终描述已提交数值；非法草稿和allowOutOfRange值设置aria-invalid及本地化原生validity消息。',
		'IME组合期间只保留草稿，不解析或触发onValueChange；compositionend后再通过当前locale或自定义parser提交。',
		'formatOptions只影响默认显示，编辑态使用无分组本地数字；自定义formatter必须与parser成对设计，避免不可逆文本。'
	],
	keywords: [
		'number field',
		'spinbutton',
		'intl',
		'locale',
		'precision',
		'parser',
		'formatter',
		'form'
	]
});
