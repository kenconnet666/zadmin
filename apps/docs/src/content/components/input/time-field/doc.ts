import { timeFieldMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
export const timeFieldDoc = defineComponentDoc(timeFieldMetadata, {
	demos: [
		{
			component: FormDemo,
			description: '小时、分钟、秒各自可编辑和cycle，完整值使用Time模型与ISO表单字符串。',
			id: 'time-field-segments',
			source,
			title: '时间Segments'
		}
	],
	accessibility: [
		'每个segment是真实文本输入并拥有独立名称；第一segment可继承ZField label。',
		'ArrowUp/Down按minuteStep/secondStep调整，左右/Home/End只移动焦点。',
		'12小时模式显式提供AM/PM按钮，不把day period混入小时字符串。'
	],
	keywords: ['time field', 'segments', 'time', 'step']
});
