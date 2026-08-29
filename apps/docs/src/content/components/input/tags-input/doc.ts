import { tagsInputMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import formSource from './FormDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
export const tagsInputDoc = defineComponentDoc(tagsInputMetadata, {
	demos: [
		{
			component: FormDemo,
			description: 'Enter、逗号、粘贴和空草稿Backspace共享去重、校验、上限与单次回调合同。',
			id: 'tags-input-form',
			source: formSource,
			title: '编辑、粘贴与表单'
		}
	],
	accessibility: [
		'Root是命名group，每个标签提供明确的Remove按钮，草稿input拥有独立可访问名称。',
		'IME composing期间不提交；空草稿Backspace删除最后标签，粘贴批量操作只触发一次values更新。',
		'每个标签使用同名隐藏字段提交，reset同时恢复标签与清空草稿。'
	]
});
