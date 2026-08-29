import {
	selectContentMetadata,
	selectItemMetadata,
	selectMetadata,
	selectTriggerMetadata
} from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import formSource from './FormDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const selectDoc = defineComponentDoc(selectMetadata, {
	members: [selectTriggerMetadata, selectContentMetadata, selectItemMetadata],
	demos: [
		{
			component: FormDemo,
			description: '单选值、listbox键盘、typeahead、Popover定位、隐藏表单值与reset保持同一状态源。',
			id: 'select-form',
			source: formSource,
			title: 'Listbox与表单'
		}
	],
	accessibility: [
		'Trigger是aria-haspopup=listbox的原生button；Content自身是listbox并由Trigger稳定id标记。',
		'Option使用aria-selected和roving tabindex；disabled Option跳过pointer、键盘与typeahead。',
		'Enter/Space或pointer选择后关闭并恢复Trigger；Escape只dismiss不改变值；name通过隐藏字段提交。'
	]
});
