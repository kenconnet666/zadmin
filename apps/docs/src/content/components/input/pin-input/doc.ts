import { pinInputMetadata } from '@zadmin/zui/metadata';
import ControlledDemo from './ControlledDemo.svelte';
import controlledSource from './ControlledDemo.svelte?raw';
import ExternalFormDemo from './ExternalFormDemo.svelte';
import externalFormSource from './ExternalFormDemo.svelte?raw';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import ModesDemo from './ModesDemo.svelte';
import modesSource from './ModesDemo.svelte?raw';
import RtlStatesDemo from './RtlStatesDemo.svelte';
import rtlStatesSource from './RtlStatesDemo.svelte?raw';
import UnicodeImeDemo from './UnicodeImeDemo.svelte';
import unicodeImeSource from './UnicodeImeDemo.svelte?raw';
import { pinInputApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const pinInputDoc = defineComponentDoc(pinInputMetadata, {
	profiles: ['form-control'],
	sourceApi: pinInputApiFacts,
	teaching: {
		props: {
			autocomplete: {
				default: "'one-time-code'",
				description: '仅首槽接收one-time-code；其余槽固定为off，浏览器OTP autofill走同一分配路径。'
			},
			defaultValue: {
				default: "''",
				description: '非受控初始连续值；reset按当前length/mode/validator重新规范化。'
			},
			disabled: {
				default: 'Field context',
				description: '禁用所有可见槽和FormValueBridge成功值。'
			},
			form: {
				default: '最近form',
				description: '外部form ID；所有required槽、reset信号和唯一隐藏值保持同一关联。'
			},
			inputLabel: {
				default: 'localePack.form.pinInputPosition',
				description: '显式位置名称formatter优先；省略时使用Provider locale与本地化序号。'
			},
			invalid: { default: 'Field context', description: '投射危险边框与每槽aria-invalid。' },
			length: {
				default: '6',
				description: '1–32动态整数；缩短时规范化值并收敛roving index。'
			},
			mask: {
				default: 'false',
				description: '只改变可见input类型，不改变value、回调或FormData；不是机密存储。'
			},
			mode: {
				default: "'numeric'",
				description:
					'numeric只接受ASCII OTP数字；text优先按owner Intl.Segmenter的Unicode grapheme分格；缺失时降级为code point。'
			},
			name: {
				default: 'Field context',
				description: '完整PIN只由一个FormValueBridge提交，单槽不泄漏name。'
			},
			onComplete: {
				default: '—',
				description: '仅用户编辑形成新的完整值时调用；外部完整值和reset不重复触发。'
			},
			onValueChange: {
				default: '—',
				description: '用户编辑和外部非法/超长值规范化都会通知owner。'
			},
			readonly: {
				default: 'Field context',
				description: '保留聚焦、选择、方向导航和阅读，禁止编辑、粘贴与删除。'
			},
			ref: { default: 'null', description: '真实role=group根引用。' },
			required: {
				default: 'Field context',
				description: '每个可见槽参与同一内联或外部form的原生required约束。'
			},
			size: {
				default: 'Field > Provider density',
				description: 'small/medium/large同时控制槽几何与间距；超长PIN在窄容器中可横向滚动。'
			},
			validateCharacter: {
				default: 'mode规则',
				description:
					'接收Intl.Segmenter返回的完整grapheme；无Segmenter时按code point降级，自定义过滤不会再额外拆分分段结果。'
			},
			value: {
				default: "''",
				description: '连续字符串；null是明确受控空值，非法和超长值统一规范化。'
			}
		},
		summary:
			'单一nullable字符串、Field owner和FormValueBridge驱动的OTP/PIN输入，覆盖grapheme/IME、整段粘贴/autofill、动态length、受控清空与外部form。'
	},
	demos: [
		{
			component: FormDemo,
			covers: ['accessible-name', 'form-data', 'form-reset', 'keyboard'],
			description: 'Tab进入当前槽，逐格输入或整段粘贴，完整值只提交一个字段并支持表单reset。',
			id: 'pin-input-otp',
			source,
			title: '一次性验证码'
		},
		{
			component: ModesDemo,
			covers: ['disabled', 'native-props', 'variants-and-states'],
			description: '遮罩数字、自定义文本validator和禁用值证明显示、字符合同与状态互不混淆。',
			id: 'pin-input-modes',
			source: modesSource,
			title: '输入模式与遮罩'
		},
		{
			component: ControlledDemo,
			covers: ['controlled', 'external-clear', 'variants-and-states'],
			description: '外部null清空、非法/超长注入与动态length都回到同一规范值。',
			id: 'pin-input-controlled',
			source: controlledSource,
			title: '受控清空与动态长度'
		},
		{
			component: UnicodeImeDemo,
			covers: ['composition', 'controlled', 'keyboard'],
			description: 'text模式按Unicode grapheme分格，并在compositionend后一次提交IME结果。',
			id: 'pin-input-unicode-ime',
			source: unicodeImeSource,
			title: 'Unicode与IME'
		},
		{
			component: ExternalFormDemo,
			covers: ['form-data', 'form-reset', 'native-props'],
			description: '组件位于form外部时，原生约束、FormValueBridge和reset仍关联同一form ID。',
			id: 'pin-input-external-form',
			source: externalFormSource,
			title: '外部Form关联'
		},
		{
			component: RtlStatesDemo,
			covers: ['readonly', 'rtl', 'variants-and-states'],
			description: 'RTL视觉方向键、readonly、invalid以及small/large尺寸保持一致合同。',
			id: 'pin-input-rtl-states',
			source: rtlStatesSource,
			title: 'RTL、只读与尺寸'
		}
	],
	accessibility: [
		'ZPinInput声明Field唯一control owner；Field label点击聚焦第一空槽，description和error关联全部槽。',
		'每格是真实input且只有一个roving tabindex；ArrowLeft/Right按Provider direction移动，Home/End到首尾。',
		'composition期间不拦截IME键盘，compositionend才分配Intl.Segmenter结果；粘贴和one-time-code autofill走同一规范化路径。',
		'numeric只接收ASCII验证码数字；text使用owner Intl.Segmenter处理Unicode grapheme。缺失Segmenter的运行时明确降级为code point，不宣称覆盖完整UAX #29。',
		'mask只隐藏视觉，不改变内存、回调或FormData原值；敏感OTP仍应最短保留并走安全传输。',
		'默认位置文案来自typed localePack.form.pinInputPosition并使用Intl格式化一基序号；inputLabel可覆盖业务专用名称。',
		'参考Ant Design Input.OTP采用length、mask和one-time-code，但ZUI不加入formatter空格协议、任意mask字符串、separator DSL或第二套数组value owner。'
	],
	keywords: [
		'pin input',
		'otp',
		'one-time-code',
		'paste',
		'autofill',
		'IME',
		'Unicode grapheme',
		'form reset',
		'rtl'
	]
});
