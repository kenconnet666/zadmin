import { pinInputMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import ModesDemo from './ModesDemo.svelte';
import modesSource from './ModesDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const pinInputDoc = defineComponentDoc(pinInputMetadata, {
	demos: [
		{
			component: FormDemo,
			description:
				'Tab进入当前roving槽，输入自动前进；粘贴从当前槽分配，完整值只提交一个隐藏字段。',
			id: 'pin-input-otp',
			source,
			title: '一次性验证码'
		},
		{
			component: ModesDemo,
			description: '遮罩数字、自定义文本字符和禁用值覆盖PIN输入模式。',
			id: 'pin-input-modes',
			source: modesSource,
			title: '输入模式与遮罩'
		}
	],
	accessibility: [
		'每格是真实input并拥有位置名称；Field label关联第一格，description关联全部格。',
		'ArrowLeft/Right遵循Provider direction，Backspace/Delete操作连续字符串而不是维护稀疏数组。',
		'text模式按Unicode code point规范化；numeric模式只接受ASCII验证码数字，避免locale格式符进入PIN。'
	],
	keywords: ['pin input', 'otp', 'paste', 'roving tabindex', 'form']
});
