import { textareaMetadata } from '@zadmin/zui/metadata';
import AutosizeDemo from './AutosizeDemo.svelte';
import autosizeSource from './AutosizeDemo.svelte?raw';
import ControlledDemo from './ControlledDemo.svelte';
import controlledSource from './ControlledDemo.svelte?raw';
import FormDemo from './FormDemo.svelte';
import formSource from './FormDemo.svelte?raw';
import StatesDemo from './StatesDemo.svelte';
import statesSource from './StatesDemo.svelte?raw';
import { textareaApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const textareaDoc = defineComponentDoc(textareaMetadata, {
	profiles: ['form-control'],
	sourceApi: textareaApiFacts,
	teaching: {
		props: {
			autosize: {
				default: 'false',
				description: 'boolean启用原生rows下限；对象形式用minRows/maxRows约束内容高度。'
			},
			defaultValue: { default: "''", description: '非受控初值与原生form reset目标。' },
			invalid: { default: '继承Field或false', description: '同步危险边框与aria-invalid。' },
			onFormReset: { default: '—', description: '未取消的form reset完成状态恢复时通知。' },
			onResize: { default: '—', description: '可见渲染高度实际变化后通知一次。' },
			onValueChange: {
				default: '—',
				description: '仅原生input事件触发；外部同步和reset不触发。'
			},
			ref: { default: 'null', description: '真实HTMLTextAreaElement引用。' },
			resize: {
				default: "'vertical'",
				description: '非autosize时的原生拖拽方向；autosize启用时固定为none。'
			},
			resetOnForm: {
				default: 'true',
				description: '独立控件恢复defaultValue；复合owner可关闭并唯一接管。'
			},
			size: {
				default:
					"Field/InputGroup，其次 componentDefaults.input.size，最后 Provider density（'comfortable' → 'medium'）",
				description:
					'显式尺寸优先，其次继承Field/InputGroup与组件默认，最后响应最近Provider的density。'
			},
			value: { default: 'undefined', description: 'Svelte bindable文本值。' }
		},
		summary: '原生textarea、Field/Form合同与跨document共享测量器组成的有界多行文本控件。'
	},
	demos: [
		{
			covers: ['controlled', 'external-clear', 'keyboard', 'native-props'],
			component: ControlledDemo,
			description:
				'外部清空不伪造用户回调；maxlength、composition事件和真实textarea编辑行为继续由浏览器负责。',
			id: 'textarea-controlled',
			source: controlledSource,
			title: '受控值、清空与IME'
		},
		{
			covers: ['controlled', 'resource-cleanup', 'variants-and-states'],
			component: AutosizeDemo,
			description:
				'共享测量节点按ownerDocument隔离；快速输入合并到动画帧，宽度、字体和隐藏恢复触发重测。',
			id: 'textarea-autosize',
			source: autosizeSource,
			title: '有界Autosize与容器变化'
		},
		{
			covers: ['disabled', 'focus', 'invalid', 'readonly', 'variants-and-states'],
			component: StatesDemo,
			description:
				'Field统一投射required、readonly、disabled和invalid；三档尺寸与原生resize保持独立。',
			id: 'textarea-states',
			source: statesSource,
			title: 'Field、尺寸与状态'
		},
		{
			covers: ['form-data', 'form-reset', 'uncontrolled'],
			component: FormDemo,
			description:
				'DOM外部textarea通过原生form属性参与FormData和可取消reset，状态恢复由唯一owner完成。',
			id: 'textarea-form',
			source: formSource,
			title: '外部Form、提交与Reset'
		}
	],
	accessibility: [
		'非autosize模式保留原生resize方向；autosize模式将resize设为none，避免用户尺寸与测量器争夺高度。',
		'autosize使用textarea.ownerDocument/defaultView，iframe各自持有一个测量节点；ShadowRoot通过真实computed style测量，SSR不创建任何DOM。',
		'零宽或隐藏挂载不会写入错误高度；ResizeObserver在重新可见或宽度变化后恢复，document.fonts完成加载后再校准。',
		'minRows默认使用原生rows，maxRows达到后启用内部垂直滚动；快速输入被同一动画帧合并。',
		'defaultValue同时驱动ZUI状态和真实DOM defaultValue，原生FormData与未取消reset不会发生状态分叉。',
		'Field提供control id、description、required、disabled、readonly和invalid，ZTextarea只合并而不覆盖显式ARIA。',
		'原生input与composition事件保持原顺序；ZUI不会在compositionend额外制造第二次value change。',
		'maxlength沿用浏览器用户输入约束；受控外部值仍按owner原样显示，确保UI、FormData和状态源一致。',
		'字数和清空功能刻意采用ZText/ZButton组合，避免像装饰型wrapper那样改变ref、焦点和原生表单边界。',
		'被Mention等父状态机控制时使用resetOnForm=false；onFormReset仍会通知父owner执行唯一reset。'
	],
	keywords: ['textarea', 'autosize', 'minRows', 'maxRows', 'form', 'field', 'IME', 'resize']
});
