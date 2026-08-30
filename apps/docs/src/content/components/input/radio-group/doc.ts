import { radioGroupItemMetadata, radioGroupMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import formSource from './FormDemo.svelte?raw';
import BoundariesDemo from './BoundariesDemo.svelte';
import boundariesSource from './BoundariesDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const radioGroupDoc = defineComponentDoc(radioGroupMetadata, {
	members: [radioGroupItemMetadata],
	demos: [
		{
			component: FormDemo,
			description: '原生radio表单语义与Collection、单选状态和roving focus共同管理动态Item。',
			id: 'radio-group-form',
			source: formSource,
			title: '单选、键盘与表单'
		},
		{
			component: BoundariesDemo,
			description: 'vertical、loop=false、invalid和disabled覆盖方向键边界与组状态。',
			id: 'radio-group-boundaries',
			source: boundariesSource,
			title: '方向与导航边界'
		}
	],
	accessibility: [
		'根节点使用radiogroup，Item保留真实input[type=radio]与label/FormData语义。',
		'方向键、Home和End移动焦点并选择，disabled Item会被跳过。',
		'horizontal模式遵循Provider RTL方向，Tab只进入一个可用Item。'
	]
});
