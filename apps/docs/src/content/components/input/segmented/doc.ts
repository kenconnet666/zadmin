import { segmentedMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import formSource from './FormDemo.svelte?raw';
import VerticalDemo from './VerticalDemo.svelte';
import verticalSource from './VerticalDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
export const segmentedDoc = defineComponentDoc(segmentedMetadata, {
	demos: [
		{
			component: FormDemo,
			description: '紧凑视觉保持radiogroup/radio语义、单一Tab stop、方向键选择和隐藏表单值。',
			id: 'segmented-form',
			source: formSource,
			title: '单选周期'
		},
		{
			component: VerticalDemo,
			description: '垂直方向切换键盘轴，禁用组阻止选择与提交。',
			id: 'segmented-vertical',
			source: verticalSource,
			title: '垂直与禁用状态'
		}
	],
	accessibility: [
		'Root使用radiogroup，segment按钮使用radio与aria-checked。',
		'方向键按orientation和RTL选择并移动焦点，disabled segment跳过。',
		'name提交稳定value，reset恢复defaultValue且不触发用户回调。'
	]
});
