import { fieldMetadata } from '@zadmin/zui/metadata';
import ValidationDemo from '../demos/FieldValidationDemo.svelte';
import validationSource from '../demos/FieldValidationDemo.svelte?raw';
import { defineComponentDoc } from './types.js';

export const fieldDoc = defineComponentDoc(fieldMetadata, {
	demos: [
		{
			component: ValidationDemo,
			description: '输入1–2个字符观察消息集合和aria-describedby关系。',
			id: 'field-validation',
			source: validationSource,
			title: '描述与错误状态'
		}
	],
	accessibility: [
		'使用SSR稳定ID连接label和control。',
		'description和messages共同进入aria-describedby。',
		'消息集合使用polite live region，避免重复警报。'
	]
});
