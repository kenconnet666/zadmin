import {
	comboboxContentMetadata,
	comboboxInputMetadata,
	comboboxItemMetadata,
	comboboxMetadata
} from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import formSource from './FormDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const comboboxDoc = defineComponentDoc(comboboxMetadata, {
	members: [comboboxInputMetadata, comboboxContentMetadata, comboboxItemMetadata],
	demos: [
		{
			component: FormDemo,
			description: '输入始终保留DOM焦点，过滤结果通过aria-activedescendant移动active option。',
			id: 'combobox-filter-form',
			source: formSource,
			title: '过滤、选择与表单'
		}
	],
	accessibility: [
		'Input使用combobox、aria-autocomplete=list、expanded、controls和activedescendant；键盘移动不会把DOM焦点移出输入框。',
		'Content使用listbox，Item使用option；过滤项通过hidden和Collection disabled合同同时退出视觉与active导航。',
		'Enter选择active option并回填文本，Escape只dismiss，name提交稳定value而不是显示文本。'
	]
});
