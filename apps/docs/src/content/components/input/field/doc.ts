import { fieldMetadata } from '@zadmin/zui/metadata';
import ValidationDemo from './ValidationDemo.svelte';
import validationSource from './ValidationDemo.svelte?raw';
import StatesDemo from './StatesDemo.svelte';
import statesSource from './StatesDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const fieldDoc = defineComponentDoc(fieldMetadata, {
	demos: [
		{
			component: ValidationDemo,
			description: '输入1–2个字符观察消息集合和aria-describedby关系。',
			id: 'field-validation',
			source: validationSource,
			title: '描述与错误状态'
		},
		{
			component: StatesDemo,
			description: '紧凑、只读、禁用和多错误消息保持统一label与description关系。',
			id: 'field-states',
			source: statesSource,
			title: '尺寸与字段状态'
		}
	],
	accessibility: [
		'使用SSR稳定ID连接label和control。',
		'description和messages共同进入aria-describedby。',
		'消息集合使用polite live region，避免重复警报。'
	]
});
