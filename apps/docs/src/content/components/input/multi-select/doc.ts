import {
	multiSelectContentMetadata,
	multiSelectItemMetadata,
	multiSelectMetadata,
	multiSelectTriggerMetadata
} from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import formSource from './FormDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const multiSelectDoc = defineComponentDoc(multiSelectMetadata, {
	members: [multiSelectTriggerMetadata, multiSelectContentMetadata, multiSelectItemMetadata],
	demos: [
		{
			component: FormDemo,
			description:
				'Trigger显示标签摘要；多选listbox toggle后保持打开，并以同名隐藏字段提交有序值。',
			id: 'multi-select-form',
			source: formSource,
			title: '标签、多选与表单'
		}
	],
	accessibility: [
		'Content使用aria-multiselectable=listbox，Item用aria-selected表达独立多选状态。',
		'Enter/Space toggle且保持打开，Arrow/Home/End/typeahead继续导航，Escape恢复Trigger。',
		'values保持有序去重；name为每个选择生成同名隐藏字段，reset恢复defaultValues且不触发用户回调。'
	]
});
