import ValidationDemo from '../demos/field/ValidationDemo.svelte';
import validationSource from '../demos/field/ValidationDemo.svelte?raw';
import { defineComponentDoc } from './types.js';

export const fieldDoc = defineComponentDoc({
	id: 'field',
	category: 'input',
	name: 'ZField',
	summary: '为单一ZUI control建立label、description、error和required可访问关系。',
	importStatement: "import { ZField } from '@zadmin/zui';",
	source: 'ui/zui/src/lib/components/input/ZField.svelte',
	demos: [
		{
			id: 'field-validation',
			title: '描述与错误状态',
			description: '输入1–2个字符观察错误文本和aria-describedby关系。',
			component: ValidationDemo,
			source: validationSource
		}
	],
	api: [
		{
			title: 'Props',
			rows: [
				{ name: 'label', type: 'string', default: '必填', description: 'control的可见label。' },
				{
					name: 'description',
					type: 'string',
					default: '—',
					description: '辅助说明并连接到control。'
				},
				{
					name: 'error',
					type: 'string',
					default: '—',
					description: '错误说明并设置invalid上下文。'
				},
				{
					name: 'required',
					type: 'boolean',
					default: 'false',
					description: '显示required状态并传递语义。'
				},
				{
					name: 'controlId',
					type: 'string',
					default: '自动生成',
					description: '显式控制label for目标。'
				},
				{
					name: 'children',
					type: 'Snippet',
					default: '—',
					description: '当前只支持单一ZUI control。'
				},
				{
					name: 'ref',
					type: 'HTMLDivElement | null',
					default: 'null',
					description: 'Field根元素引用。'
				}
			]
		}
	],
	accessibility: [
		'使用SSR稳定ID连接label和control。',
		'description和error共同进入aria-describedby。',
		'不接管Input value或用户回调。'
	]
});
