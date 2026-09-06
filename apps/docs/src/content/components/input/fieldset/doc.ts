import { fieldsetMetadata } from '@zadmin/zui/metadata';
import { fieldsetApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import DisabledDemo from './DisabledDemo.svelte';
import disabledSource from './DisabledDemo.svelte?raw';
import SizingDemo from './SizingDemo.svelte';
import sizingSource from './SizingDemo.svelte?raw';
import VariantsDemo from './VariantsDemo.svelte';
import variantsSource from './VariantsDemo.svelte?raw';

export const fieldsetDoc = defineComponentDoc(fieldsetMetadata, {
	profiles: ['form-control'],
	sourceApi: fieldsetApiFacts,
	teaching: {
		props: {
			description: { default: '—', description: '组级说明，通过aria-describedby关联。' },
			disabled: {
				default: 'false',
				description:
					'使用原生fieldset禁用和FormData排除语义；组标题保持可读，各control owner呈现禁用外观，第一legend保留浏览器例外。'
			},
			form: { default: '最近祖先form', description: '原生外部form关联。' },
			legend: { default: '必填', description: '第一原生legend，为整个控件组命名。' },
			name: { default: '—', description: '转发原生fieldset name。' },
			ref: { default: 'null', description: '真实HTMLFieldSetElement引用。' },
			size: {
				default: 'Provider density',
				description: '只控制组间距、内边距和legend字号，不覆盖后代control尺寸。'
			},
			variant: { default: "'outlined'", description: 'outlined、filled或plain组外观。' }
		},
		summary: '真实fieldset与第一legend组织多个独立字段，并保留浏览器整组禁用语义。'
	},
	demos: [
		{
			component: BasicDemo,
			covers: ['accessible-name', 'basic-render', 'composition', 'native-props'],
			description: 'fieldset命名控件组，ZField继续分别命名和拥有各自的值控件。',
			id: 'fieldset-basic',
			source: basicSource,
			title: '分组名称与独立字段'
		},
		{
			component: DisabledDemo,
			covers: ['controlled', 'disabled', 'form-data', 'native-props'],
			description:
				'原生disabled排除InputGroup内的PasswordInput值；Group统一禁用外观，第一legend中的恢复按钮仍可操作。',
			id: 'fieldset-disabled',
			source: disabledSource,
			title: '原生整组禁用与恢复'
		},
		{
			component: SizingDemo,
			covers: ['density', 'variants-and-states'],
			description: '五档组尺寸只改变fieldset，显式medium后代控件保持自己的尺寸。',
			id: 'fieldset-sizing',
			source: sizingSource,
			title: '五档组尺寸与控件边界'
		},
		{
			component: VariantsDemo,
			covers: ['composition', 'native-props', 'variants-and-states'],
			description: '三种组外观在窄容器中保留长legend与说明的正常换行。',
			id: 'fieldset-variants',
			source: variantsSource,
			title: '三种变体与长Legend'
		}
	],
	accessibility: [
		'真实fieldset和第一legend为相关控件建立原生分组名称。',
		'组级description通过aria-describedby关联；每个值控件仍需要自己的ZField标签或aria-label。',
		'disabled使用原生fieldset语义：后代控件不可交互且不进入FormData，第一legend后代遵循浏览器例外。',
		'fieldset边框与legend保持可读；禁用透明度由各可见control或InputGroup统一拥有，避免暗化legend恢复操作或叠乘透明度。',
		'size只改变分组排版，不通过隐藏Field context覆盖后代控件。'
	]
});
