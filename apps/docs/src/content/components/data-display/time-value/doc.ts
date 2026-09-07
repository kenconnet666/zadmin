import { timeValueMetadata } from '@zadmin/zui/metadata';
import { timeValueApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import TypographyDemo from './TypographyDemo.svelte';
import typographySource from './TypographyDemo.svelte?raw';

export const timeValueDoc = defineComponentDoc(timeValueMetadata, {
	profiles: ['data-view'],
	sourceApi: timeValueApiFacts,
	teaching: {
		summary:
			'TimeValue只把Time格式化为本地化文本，并复用ZText的字号、行高、字重、tone和溢出能力；它没有编辑、时区或表单owner。'
	},
	accessibility: [
		'真实time元素通过datetime保留完整机器可读Time，视觉精度不会截断业务值。',
		'12/24小时制与locale只改变可见文本；无日期Time不进行时区换算。',
		'默认启用tabular-nums稳定时间宽度，所有文字视觉能力来自同一个ZText recipe。'
	],
	demos: [
		{
			id: 'time-value-formats',
			title: '本地化格式与文字层级',
			component: BasicDemo,
			source: basicSource,
			covers: ['basic-render', 'locale', 'native-props', 'variants-and-states'],
			description: '同一个Time可按不同小时制和精度展示，并保持机器值与Theme文字能力。'
		},
		{
			id: 'time-value-typography',
			title: '字级、语义色与紧凑时间列',
			component: TypographyDemo,
			source: typographySource,
			covers: ['accessible-name', 'composition', 'variants-and-states'],
			description: '五种语义tone、tabular numbers、等宽截断和八档可换行字级全部复用ZText合同。'
		}
	],
	keywords: ['time value', 'intl', 'locale', 'hour cycle', 'semantic time', 'typography']
});
