import { sortableMetadata } from '@zadmin/zui/metadata';
import { sortableApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import FormListDemo from './FormListDemo.svelte';
import formListSource from './FormListDemo.svelte?raw';

export const sortableDoc = defineComponentDoc(sortableMetadata, {
	profiles: ['collection'],
	sourceApi: sortableApiFacts,
	teaching: {
		summary:
			'受控顺序的可排序集合：手柄拖动、键盘与可见前后移动操作共用一个接受和取消流程。FormList组合继续使用现有FormArray.move，拖动预览不会改写表单。'
	},
	demos: [
		{
			id: 'sortable-controlled',
			title: '受控移动、异步确认与五档大小',
			component: BasicDemo,
			source: basicSource,
			covers: ['controlled', 'keyboard', 'composition', 'variants-and-states'],
			description:
				'启用业务拒绝或异步确认，检查items唯一所有权、等待中的取消、横向换行与动态reduced motion。'
		},
		{
			id: 'sortable-form-list',
			title: '组合FormList与真实字段',
			component: FormListDemo,
			source: formListSource,
			covers: ['controlled', 'form-data', 'form-reset', 'composition', 'invalid'],
			description:
				'稳定row.id负责渲染身份，row.path负责字段地址；移动、拒绝、只读和reset继续由现有Form控制。'
		}
	],
	accessibility: [
		'每行提供有名称的原生button手柄与可见移动按钮；行内输入保留自己的键盘和表单语义。',
		'触屏可从行内容区短滑滚动；独立手柄是拖动专属区域，长按后跨行排序。内容、手柄、取消、只读/禁用与owner拒绝已有Chromium触屏模拟回归；真机与其他引擎触屏仍需独立验收。',
		'在手柄按Space/Enter开始和放下，方向键选择目标，Escape取消。等待异步接受时也提供取消按钮。',
		'位置、接受、拒绝和异常只由根live region公告；没有第二个依赖默认公告区域。',
		'所有结构修改交给onMoveRequest，返回true后仍核对实际items顺序；不会偷偷回滚调用方已经写入的数据。',
		'等待期间滚动、容器或已测量行尺寸变化会废弃旧布局动画，不改变owner确认结果；已独立呈现的提前回写不会在稍后接受时倒播。reduced或零时长不采集历史几何。',
		'默认样式使用Theme/ICSS；布局移动使用可取消Web Animations，reduced变化立即取消本组件的动画。'
	],
	keywords: ['sortable', 'reorder', 'drag', 'touch', 'keyboard', 'form list', 'async']
});
