import { calendarMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import ConstraintsDemo from './ConstraintsDemo.svelte';
import constraintsSource from './ConstraintsDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
export const calendarDoc = defineComponentDoc(calendarMetadata, {
	demos: [
		{
			component: FormDemo,
			description: '固定6周grid、周一起始、相邻月日期、roving focus和ISO表单值。',
			id: 'calendar-grid',
			source,
			title: '部署日期日历'
		},
		{
			component: ConstraintsDemo,
			description: '最小/最大日期、周末禁用与outside dates共同约束选择网格。',
			id: 'calendar-constraints',
			source: constraintsSource,
			title: '日期约束'
		}
	],
	accessibility: [
		'table grid保留row、columnheader和gridcell关系，日期按钮使用完整locale名称。',
		'只有focused日期tabindex=0；方向键、Home/End、PageUp/Down移动且不改变选择。',
		'Enter/Space选择；min/max和isDateDisabled同时影响disabled与键盘。'
	],
	keywords: ['calendar', 'grid', 'calendar date', 'roving focus']
});
