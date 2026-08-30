import { numberFieldMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import StatesDemo from './StatesDemo.svelte';
import statesSource from './StatesDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const numberFieldDoc = defineComponentDoc(numberFieldMetadata, {
	demos: [
		{
			component: FormDemo,
			description:
				'非编辑态按locale分组显示，focus后进入无分组编辑；按钮、方向键与Page键使用精确小数step。',
			id: 'number-field-locale',
			source,
			title: '本地数字与步进'
		},
		{
			component: StatesDemo,
			description: '货币格式、只读、无效和禁用状态共享本地化spinbutton合同。',
			id: 'number-field-states',
			source: statesSource,
			title: '格式与编辑状态'
		}
	],
	accessibility: [
		'解析器从Intl.NumberFormat.formatToParts推导数字、分组、小数点和正负号，不用parseFloat猜测locale。',
		'编辑期间允许空值和正负号等不完整片段；非法文本标记data-invalid，blur恢复最近有效值。',
		'可见输入保留spinbutton与原生required验证，隐藏字段只负责稳定FormData序列化。'
	],
	keywords: ['number field', 'spinbutton', 'intl', 'locale', 'step', 'form']
});
