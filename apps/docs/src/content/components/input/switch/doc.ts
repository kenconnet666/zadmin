import { switchMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import formSource from './FormDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const switchDoc = defineComponentDoc(switchMetadata, {
	demos: [
		{
			component: FormDemo,
			description: '原生checkbox同时提供switch可访问语义、FormData、reset和三档视觉尺寸。',
			id: 'switch-form',
			source: formSource,
			title: '开关与表单'
		}
	],
	accessibility: [
		'真实input[type=checkbox]配合role=switch，屏幕阅读器读取为开关。',
		'Space、label、required、disabled、FormData与reset均保留原生行为。',
		'RTL反转thumb逻辑方向，reduced motion会移除状态转换动画。'
	]
});
