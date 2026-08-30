import { textareaMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import StatesDemo from './StatesDemo.svelte';
import statesSource from './StatesDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const textareaDoc = defineComponentDoc(textareaMetadata, {
	demos: [
		{
			component: FormDemo,
			description:
				'复用ZField关系与原生textarea表单值；autosize监听内容和宽度并在销毁时清理clone与observer。',
			id: 'textarea-autosize',
			source,
			title: '受控autosize文本域'
		},
		{
			component: StatesDemo,
			description: '三档尺寸、resize策略、invalid和disabled保留原生textarea编辑合同。',
			id: 'textarea-states',
			source: statesSource,
			title: '尺寸、Resize与状态'
		}
	],
	accessibility: [
		'非autosize模式保留原生resize方向；autosize模式将resize设为none，避免用户尺寸与测量器争夺高度。',
		'defaultValue同时驱动ZUI状态和真实DOM defaultValue，原生FormData与reset不会发生状态分叉。',
		'Field提供control id、description、required、disabled、readonly和invalid，ZTextarea只合并而不覆盖显式ARIA。',
		'被Mention等父状态机控制时使用resetOnForm=false；onFormReset仍会通知父owner执行唯一reset。'
	],
	keywords: ['textarea', 'autosize', 'form', 'field', 'resize']
});
