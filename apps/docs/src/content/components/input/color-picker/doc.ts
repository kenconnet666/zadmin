import { colorPickerMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import StatesDemo from './StatesDemo.svelte';
import statesSource from './StatesDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const colorPickerDoc = defineComponentDoc(colorPickerMetadata, {
	demos: [
		{
			component: FormDemo,
			description:
				'原生color input负责平台色域交互，ZUI统一hex校验、alpha、Popover、受控状态和表单值。',
			id: 'color-picker-alpha',
			source,
			title: 'Hex与透明度'
		},
		{
			component: StatesDemo,
			description: '不透明、Alpha和禁用颜色分别验证规范化hex合同。',
			id: 'color-picker-states',
			source: statesSource,
			title: 'Alpha与禁用状态'
		}
	],
	accessibility: [
		'接受3/4/6/8位hex并规范化为小写6位或8位；非法草稿不覆盖最近有效值。',
		'allowAlpha=false时丢弃输入alpha并提交6位hex；开启后range与native color共享同一个RGBA状态。',
		'Popover复用Floating、DismissableLayer和FocusScope；Escape关闭并恢复Trigger焦点。'
	],
	keywords: ['color picker', 'hex', 'alpha', 'native color', 'popover', 'form']
});
