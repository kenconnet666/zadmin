import { timeGridMetadata } from '@zadmin/zui/metadata';
import { timeGridApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import ConstraintsDemo from './ConstraintsDemo.svelte';
import constraintsSource from './ConstraintsDemo.svelte?raw';
import ModesDemo from './ModesDemo.svelte';
import modesSource from './ModesDemo.svelte?raw';

export const timeGridDoc = defineComponentDoc(timeGridMetadata, {
	profiles: ['form-control', 'collection'],
	sourceApi: timeGridApiFacts,
	teaching: {
		summary:
			'TimeGrid接收显式、唯一且有序的Time时隙，不解析字符串或自行生成日期状态。slot标签可由业务命名，也可按Provider locale和hourCycle格式化。'
	},
	accessibility: [
		'radiogroup只保留一个roving Tab stop；方向键跳过不可用时隙、循环移动并同步选择，Home/End选择边界；只读时只移动焦点。',
		'左右键读取实际渲染方向，RTL反转；上下键仍沿显式slots逻辑顺序移动，不伪造二维grid导航。',
		'Enter和Space选择当前时隙，Delete和Backspace清空；required报告空值无效但不阻止清空。',
		'disabled停止交互并退出FormData；readonly保留浏览、焦点和值提交但拒绝写入。'
	],
	demos: [
		{
			id: 'time-grid-basic',
			title: '显式时隙与nullable选择',
			component: BasicDemo,
			source: basicSource,
			covers: ['basic-render', 'controlled', 'keyboard', 'locale'],
			description: '业务标签与本地化缺省标签可以混用，value始终是Time/null。'
		},
		{
			id: 'time-grid-constraints',
			title: '范围、不可用与表单',
			component: ConstraintsDemo,
			source: constraintsSource,
			covers: ['form-data', 'invalid', 'keyboard'],
			description: 'min/max、业务谓词和slot disabled共享一个候选约束。'
		},
		{
			id: 'time-grid-modes',
			title: '只读、禁用与RTL',
			component: ModesDemo,
			source: modesSource,
			covers: ['disabled', 'readonly', 'keyboard', 'rtl'],
			description: '交互状态与书写方向保持正交。'
		}
	],
	keywords: ['time grid', 'time slots', 'radio group', 'nullable', 'form', 'rtl']
});
