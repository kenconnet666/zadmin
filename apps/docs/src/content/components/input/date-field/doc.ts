import { dateFieldMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import LocalesDemo from './LocalesDemo.svelte';
import localesSource from './LocalesDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
export const dateFieldDoc = defineComponentDoc(dateFieldMetadata, {
	demos: [
		{
			component: FormDemo,
			description: 'year/month/day按zh-CN顺序显示，输入完整值或方向键cycle后提交CalendarDate。',
			id: 'date-field-segments',
			source,
			title: '日期Segments'
		},
		{
			component: LocalesDemo,
			description: 'Locale决定segment顺序；readonly和disabled保持不同交互语义。',
			id: 'date-field-locales',
			source: localesSource,
			title: 'Locale与只读状态'
		}
	],
	accessibility: [
		'第一segment继承ZField label，其余segment有独立名称，全部共享description与invalid关系。',
		'左右键按DOM与RTL移动；上下键使用CalendarDate.cycle处理闰年和月长。',
		'不使用原生Date猜时区；FormData始终是ISO CalendarDate字符串。'
	],
	keywords: ['date field', 'segments', 'calendar date', 'locale']
});
