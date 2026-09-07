import { dateTimeFieldMetadata } from '@zadmin/zui/metadata';
import { dateTimeFieldApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import ZonedDemo from './ZonedDemo.svelte';
import zonedSource from './ZonedDemo.svelte?raw';
import FamilyDemo from './FamilyDemo.svelte';
import familySource from './FamilyDemo.svelte?raw';

export const dateTimeFieldDoc = defineComponentDoc(dateTimeFieldMetadata, {
	profiles: ['form-control'],
	sourceApi: dateTimeFieldApiFacts,
	accessibility: [
		'每个分段拥有日期或时间名称；逻辑方向键跨字段移动，Escape 撤销整个草稿。',
		'外层 Field 统一错误描述与只读、禁用、必填状态；时区标识可以按需显示。'
	],
	teaching: {
		summary:
			'组合日期与时间分段的实验性字段。local 值为 CalendarDateTime，zoned 值为 ZonedDateTime；根节点独占模型和一个 FormData 条目。当前仅支持 Gregorian 日历编辑。'
	},
	demos: [
		{
			id: 'date-time-field-local',
			title: '本地日期时间与组合草稿',
			component: BasicDemo,
			source: basicSource,
			covers: ['basic-render', 'controlled', 'external-clear', 'keyboard'],
			description: '独立编辑复用 DateField 与 TimeField；完整、可用的候选才写入组合值。'
		},
		{
			id: 'date-time-field-zoned',
			title: '跨时区与夏令时歧义',
			component: ZonedDemo,
			source: zonedSource,
			covers: ['controlled'],
			description: '显示时区和拥有值的时区分离；选择 disambiguation 明确夏令时处理策略。'
		},
		{
			id: 'date-time-field-family',
			title: '五档尺寸与唯一表单值',
			component: FamilyDemo,
			source: familySource,
			covers: ['form-data', 'form-reset'],
			description: '五档尺寸统一传递给底层字段；模型保留日期时间对象，FormData 序列化为单个字符串。'
		}
	]
});
