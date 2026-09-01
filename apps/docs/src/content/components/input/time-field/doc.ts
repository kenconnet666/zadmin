import { timeFieldMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import ModesDemo from './ModesDemo.svelte';
import modesSource from './ModesDemo.svelte?raw';
import LocaleDemo from './LocaleDemo.svelte';
import localeSource from './LocaleDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
export const timeFieldDoc = defineComponentDoc(timeFieldMetadata, {
	demos: [
		{
			component: FormDemo,
			description: '小时、分钟、秒各自可编辑和cycle，完整值使用Time模型与ISO表单字符串。',
			id: 'time-field-segments',
			source,
			title: '时间Segments'
		},
		{
			component: ModesDemo,
			description: '12/24小时、分钟/秒步长与只读/禁用状态覆盖时间segment模式。',
			id: 'time-field-modes',
			source: modesSource,
			title: '小时制与步长'
		},
		{
			component: LocaleDemo,
			description:
				'typed locale pack统一segment、AM/PM文案与默认hourCycle，显式hourCycle仍可覆盖。',
			id: 'time-field-locale',
			source: localeSource,
			title: 'Locale pack默认值'
		}
	],
	accessibility: [
		'每个segment是真实文本输入并拥有独立名称；第一segment可继承ZField label。',
		'ArrowUp/Down按minuteStep/secondStep调整，左右/Home/End只移动焦点。',
		'12小时模式显式提供AM/PM按钮，不把day period混入小时字符串。',
		'segment、AM/PM与切换按钮名称来自typed locale pack，显式hourCycle优先于locale默认。'
	],
	keywords: ['time field', 'segments', 'time', 'step']
});
