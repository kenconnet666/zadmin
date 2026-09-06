import { nativeSelectMetadata } from '@zadmin/zui/metadata';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
import { nativeSelectApiFacts } from '../../../../framework/component-api.generated.js';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import MultipleDemo from './MultipleDemo.svelte';
import multipleSource from './MultipleDemo.svelte?raw';
import FormDemo from './FormDemo.svelte';
import formSource from './FormDemo.svelte?raw';

export const nativeSelectDoc = defineComponentDoc(nativeSelectMetadata, {
	profiles: ['primitive', 'form-control'],
	sourceApi: nativeSelectApiFacts,
	teaching: {
		props: {
			items: {
				default: '与children二选一',
				description: '生成真实option/optgroup；每个value必须是字符串且唯一。'
			},
			multiple: {
				default: 'false',
				description: 'single值为string；multiple值为readonly string[]。'
			},
			nativeSize: { default: 'undefined', description: '原生可见行数，和视觉size分开。' },
			readonly: { default: 'false', description: '保持焦点与FormData但阻止用户写入。' }
		},
		summary: '保留浏览器原生select、有效性、FormData与reset语义。'
	},
	accessibility: [
		'组件保留真实select、option和optgroup；示例为每个select提供明确aria-label。',
		'原生箭头、Home、End、Page和Space/Enter键盘行为由select保留。',
		'readonly保留焦点与FormData值并阻止写入，disabled遵循原生表单排除语义。'
	],
	demos: [
		{
			id: 'native-select-basic',
			title: '分组与视觉尺寸',
			component: BasicDemo,
			source: basicSource,
			covers: ['basic-render', 'controlled', 'native-props', 'variants-and-states'],
			description: 'items生成option和optgroup，nativeSize独立于视觉size。'
		},
		{
			id: 'native-select-multiple',
			title: '多选字符串数组',
			component: MultipleDemo,
			source: multipleSource,
			covers: ['controlled', 'focus', 'native-props'],
			description: 'multiple绑定readonly string[]并显示onValueChange结果。'
		},
		{
			id: 'native-select-form',
			title: '表单 reset 与只读',
			component: FormDemo,
			source: formSource,
			covers: ['form-data', 'form-reset', 'controlled', 'resource-cleanup'],
			description: '真实FormData/reset；readonly保留提交值而禁用写入。'
		}
	]
});
