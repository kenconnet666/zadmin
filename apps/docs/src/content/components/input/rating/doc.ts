import { ratingMetadata } from '@zadmin/zui/metadata';
import { ratingApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import FormDemo from './FormDemo.svelte';
import formSource from './FormDemo.svelte?raw';
import FractionsDemo from './FractionsDemo.svelte';
import fractionsSource from './FractionsDemo.svelte?raw';
import VariantsDemo from './VariantsDemo.svelte';
import variantsSource from './VariantsDemo.svelte?raw';

export const ratingDoc = defineComponentDoc(ratingMetadata, {
	profiles: ['form-control', 'collection'],
	sourceApi: ratingApiFacts,
	teaching: {
		props: {
			clearable: { default: 'true', description: '再次激活当前分数时清为0。' },
			count: { default: '5', description: '正安全整数个评分项。' },
			fractions: { default: '1', description: '每项份数，唯一评分精度为1/fractions。' },
			itemLabel: {
				default: 'localePack.common.ratingValue',
				description: '每个真实fraction radio的可访问名称。'
			},
			label: { default: 'Field或显式名称', description: '整体radiogroup名称，不替代itemLabel。' },
			value: { default: 'undefined', description: '可绑定数值；0表示尚未选择。' }
		},
		summary: '真实radio保留评分键盘、FormData与reset，视觉层负责fraction预览和可替换符号。'
	},
	demos: [
		{
			component: BasicDemo,
			covers: ['accessible-name', 'basic-render', 'controlled', 'focus'],
			description: 'Field提供整体名称与name，itemLabel为每个真实radio提供分数名称。',
			id: 'rating-basic',
			source: basicSource,
			title: 'Field、名称与绑定评分'
		},
		{
			component: FractionsDemo,
			covers: ['controlled', 'native-props', 'variants-and-states'],
			description: 'fractions=2建立半星精度；hover值单独显示且离开不改选中值。',
			id: 'rating-fractions',
			source: fractionsSource,
			title: 'Fraction与Hover预览'
		},
		{
			component: FormDemo,
			covers: ['disabled', 'form-data', 'form-reset', 'readonly'],
			description: 'readonly保留焦点和FormData，disabled排除字段；reset恢复默认评分。',
			id: 'rating-form',
			source: formSource,
			title: '只读、禁用与表单Reset'
		},
		{
			component: VariantsDemo,
			covers: ['composition', 'density', 'keyboard', 'rtl', 'variants-and-states'],
			description: '五档size与语义tone使用自定义item，并提供RTL方向键场景。',
			id: 'rating-variants',
			source: variantsSource,
			title: '尺寸、Tone、自定义符号与RTL'
		}
	],
	accessibility: [
		'根节点使用radiogroup，所有fraction选项都是真实input[type=radio]。',
		'Field标签或显式label命名整个组；itemLabel分别命名每个可选分数。',
		'方向键、Home、End和Space沿真实radio焦点路径工作，RTL反转水平视觉方向。',
		'hover preview只改变预览并通过onHoverChange报告，离开恢复0且不写value。',
		'readonly保留焦点与FormData但阻止选择，disabled按原生规则排除FormData。',
		'fractions是唯一精度模型，value、defaultValue、键盘和radio值使用同一1/fractions步长。'
	]
});
