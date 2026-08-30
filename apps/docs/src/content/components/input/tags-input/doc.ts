import { tagsInputMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import formSource from './FormDemo.svelte?raw';
import ConstraintsDemo from './ConstraintsDemo.svelte';
import constraintsSource from './ConstraintsDemo.svelte?raw';
import DraftDemo from './DraftDemo.svelte';
import draftSource from './DraftDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
export const tagsInputDoc = defineComponentDoc(tagsInputMetadata, {
	demos: [
		{
			component: FormDemo,
			description: 'Enter、逗号、粘贴和空草稿Backspace共享去重、校验、上限与单次回调合同。',
			id: 'tags-input-form',
			source: formSource,
			title: '编辑、粘贴与表单'
		},
		{
			component: ConstraintsDemo,
			description: '多分隔符、数量上限、校验、自定义Tag与只读/禁用状态保持独立。',
			id: 'tags-input-constraints',
			source: constraintsSource,
			title: '约束与自定义Tag'
		},
		{
			component: DraftDemo,
			description: '受控草稿、重复值和commitOnBlur分别表达自动提交与保留草稿的所有权。',
			id: 'tags-input-draft-ownership',
			source: draftSource,
			title: '草稿、重复值与失焦'
		}
	],
	accessibility: [
		'Root是命名group，每个标签提供明确的Remove按钮，草稿input拥有独立可访问名称。',
		'IME composing期间不提交；空草稿Backspace删除最后标签，粘贴批量操作只触发一次values更新。',
		'每个标签使用同名隐藏字段提交，reset同时恢复标签与清空草稿。'
	]
});
