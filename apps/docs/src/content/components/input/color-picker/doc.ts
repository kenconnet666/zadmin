import { colorPickerMetadata } from '@zadmin/zui/metadata';
import { colorPickerApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
import ControlledDemo from './ControlledDemo.svelte';
import controlledSource from './ControlledDemo.svelte?raw';
import FieldDemo from './FieldDemo.svelte';
import fieldSource from './FieldDemo.svelte?raw';
import FormDemo from './FormDemo.svelte';
import formSource from './FormDemo.svelte?raw';
import PresetsDemo from './PresetsDemo.svelte';
import presetsSource from './PresetsDemo.svelte?raw';
import StatesDemo from './StatesDemo.svelte';
import statesSource from './StatesDemo.svelte?raw';

export const colorPickerDoc = defineComponentDoc(colorPickerMetadata, {
	profiles: ['form-control', 'layer'],
	sourceApi: colorPickerApiFacts,
	teaching: {
		props: {
			alphaLabel: {
				default: 'localePack.colorPicker.alpha',
				description: '原生range透明度输入的可访问名称。'
			},
			clearLabel: {
				default: 'localePack.common.clear',
				description: '独立Lucide清空按钮的名称和title。'
			},
			colorInputLabel: {
				default: 'localePack.colorPicker.chooseColor',
				description: '平台原生color input的可访问名称。'
			},
			controlId: {
				default: 'Field controlId或生成ID',
				description: '真实Trigger ID，也是Field label的focus owner。'
			},
			defaultOpen: {
				default: 'false',
				description: '非受控Popover初值。'
			},
			form: {
				default: '最近祖先form',
				description: '把唯一FormValueBridge关联到指定外部form。'
			},
			gutter: {
				default: '4',
				description: 'Trigger和颜色面板之间的Floating间距px。'
			},
			hexInputLabel: {
				default: 'localePack.colorPicker.hexColor',
				description: 'hex草稿textbox的可访问名称。'
			},
			invalid: {
				default: 'Field context或false',
				description: '与非法hex草稿合并为根状态和Trigger aria-invalid。'
			},
			matchWidth: {
				default: 'false',
				description: '颜色面板是否至少匹配Trigger宽度。'
			},
			placeholder: {
				default: 'localePack.colorPicker.chooseColor',
				description: 'null颜色时的Trigger文本。'
			},
			placement: {
				default: "'bottom-start'",
				description: 'Popover首选逻辑方位；碰撞与RTL由共享层处理。'
			},
			required: {
				default: 'Field context或false',
				description: '投射到hex输入和data-required；业务提交阻断由ZForm schema拥有。'
			},
			triggerLabel: {
				default: 'localePack.colorPicker.color(value)',
				description: '自定义颜色Trigger/面板名称；接收null空值。'
			}
		},
		summary:
			'生产级单值ColorPicker：规范化hex/null、原生color/range、alpha、预设、清空、Field/FormValueBridge和Popover各自拥有清晰边界。'
	},
	demos: [
		{
			component: FormDemo,
			covers: ['controlled', 'form-data', 'form-reset', 'keyboard', 'locale'],
			description:
				'原生color input负责平台色域交互，ZUI统一hex校验、alpha、Popover、状态和表单值。',
			id: 'color-picker-alpha',
			source: formSource,
			title: 'Hex、透明度与表单'
		},
		{
			component: ControlledDemo,
			covers: ['controlled', 'external-clear', 'focus', 'keyboard'],
			description: 'value与open由外部独立持有；null是明确空值，外部同步不会伪造用户回调。',
			id: 'color-picker-controlled',
			source: controlledSource,
			title: '受控颜色、打开与Null清空'
		},
		{
			component: PresetsDemo,
			covers: ['controlled', 'keyboard', 'locale', 'variants-and-states'],
			description: '预设值经过与主value相同的6/8位hex规范化；重复或非法预设在构造期失败。',
			id: 'color-picker-presets',
			source: presetsSource,
			title: '具名预设与Alpha'
		},
		{
			component: StatesDemo,
			covers: ['disabled', 'invalid', 'readonly', 'variants-and-states'],
			description: '不透明、Alpha、null、readonly和disabled颜色共享同一规范化合同。',
			id: 'color-picker-states',
			source: statesSource,
			title: 'Null、Readonly与Disabled'
		},
		{
			component: FieldDemo,
			covers: ['focus', 'form-data', 'form-reset', 'invalid', 'native-props'],
			description:
				'Field拥有label/name/required/invalid/size；DOM外部Picker通过唯一FormValueBridge关联外部form。',
			id: 'color-picker-field',
			source: fieldSource,
			title: 'Field与外部Form Owner'
		}
	],
	accessibility: [
		'接受3/4/6/8位hex并规范化为小写6位或8位；非法草稿不覆盖最近有效值。',
		'allowAlpha=false时丢弃输入alpha并提交6位hex；开启后range与native color共享同一个RGBA状态。',
		'Trigger是唯一Field focus owner；clearable同时提供Delete/Backspace和具名Lucide按钮，null时显示明确占位而非伪造黑色。',
		'readonly保留Trigger焦点、颜色文本和FormData，但不能打开、清空或更改原生字段。',
		'Popover复用Floating、DismissableLayer和FocusScope；Escape关闭并恢复Trigger焦点。',
		'ZUI刻意只承诺单色hex/null；RGB/HSB格式切换、渐变编辑和任意panelRender会显著扩大值类型与键盘状态，继续后置。',
		'MUI Material没有内置ColorPicker，因此ZUI不把主题palette工具冒充表单控件；平台color input仍是最低可靠色域入口。'
	],
	keywords: [
		'color picker',
		'hex',
		'alpha',
		'null color',
		'presets',
		'native color',
		'popover',
		'form value'
	]
});
