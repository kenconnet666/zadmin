import { splitterMetadata } from '@zadmin/zui/metadata';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import UnitsDemo from './UnitsDemo.svelte';
import unitsSource from './UnitsDemo.svelte?raw';
import CollapseDemo from './CollapseDemo.svelte';
import collapseSource from './CollapseDemo.svelte?raw';
import NestedDemo from './NestedDemo.svelte';
import nestedSource from './NestedDemo.svelte?raw';
import { splitterApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const splitterDoc = defineComponentDoc(splitterMetadata, {
	profiles: ['primitive'],
	sourceApi: splitterApiFacts,
	teaching: {
		props: {
			defaultSizes: { default: '等分', description: '仅初始化和reset基线，单位按每项声明保留。' },
			orientation: { default: "'horizontal'", description: '面板排列轴和separator方向。' },
			panels: {
				default: '必填',
				description: '稳定key、label、min/max、collapsible和resizable配置。'
			},
			sizes: { default: 'defaultSizes', description: '受控/可绑定尺寸数组；交互写回原声明单位。' },
			step: { default: '1', description: '方向键百分比步长；Shift使用shiftStep。' }
		},
		summary: '以真实panel snippet、ARIA separator和pointer/keyboard生命周期调整可约束的多面板布局。'
	},
	demos: [
		{
			component: BasicDemo,
			covers: ['basic-render', 'composition', 'focus', 'keyboard', 'native-props'],
			description: '三个百分比面板支持pointer和separator键盘调整，生命周期事件和sizes输出可见。',
			id: 'splitter-basic',
			source: basicSource,
			title: '三面板与调整生命周期'
		},
		{
			component: UnitsDemo,
			covers: ['composition', 'native-props', 'variants-and-states'],
			description: 'px、rem和百分比混合尺寸保留原单位，面板min/max约束参与相邻空间分配。',
			id: 'splitter-units-constraints',
			source: unitsSource,
			title: '混合单位与约束'
		},
		{
			component: CollapseDemo,
			covers: ['controlled', 'focus', 'keyboard', 'variants-and-states'],
			description:
				'真实按钮调用instance的collapse、expand、reset；折叠后separator焦点与内容状态保持可见。',
			id: 'splitter-collapse-instance',
			source: collapseSource,
			title: '折叠、恢复与Controller'
		},
		{
			component: NestedDemo,
			covers: ['composition', 'native-props', 'rtl'],
			description: 'RTL垂直外层中嵌套有界水平Splitter，内容真实可读且每层panel拥有稳定label。',
			id: 'splitter-nested-rtl',
			source: nestedSource,
			title: 'RTL与嵌套面板'
		}
	],
	accessibility: [
		'每个separator是真实可聚焦role=separator，带orientation、controls和可计算的valuemin/valuemax/valuenow。',
		'Arrow、Shift+Arrow、Home、End和Enter由组件处理；面板内容继续拥有自己的焦点和语义。',
		'折叠panel使用inert/aria-hidden并在必要时把焦点恢复到相邻handle；业务内容不被复制。',
		'RTL只改变逻辑方向和键盘移动，sizes数组仍按panels输入顺序。'
	]
});
