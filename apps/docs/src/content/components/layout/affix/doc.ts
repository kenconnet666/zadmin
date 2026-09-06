import { affixMetadata } from '@zadmin/zui/metadata';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
import { affixApiFacts } from '../../../../framework/component-api.generated.js';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import ContainerDemo from './ContainerDemo.svelte';
import containerSource from './ContainerDemo.svelte?raw';
import BoundaryDemo from './BoundaryDemo.svelte';
import boundarySource from './BoundaryDemo.svelte?raw';

export const affixDoc = defineComponentDoc(affixMetadata, {
	profiles: ['primitive'],
	sourceApi: affixApiFacts,
	teaching: {
		props: {
			scrollContainer: {
				default: 'undefined',
				description: '省略时使用原生sticky；显式容器启用fixed投影。'
			},
			offsetTop: { default: '0', description: '与offsetBottom二选一。' },
			offsetBottom: { default: '—', description: '底部边固定偏移。' }
		},
		summary: '使用真实sticky或明确的滚动owner投影，不隐藏占位与边界。'
	},
	accessibility: [
		'固定内容保留真实DOM与布局占位；fixed投影使用同一owner的portal并清理滚动、resize和观察器监听。',
		'children中的交互控件保持原生焦点与名称，边界限制不会用截断内容隐藏可操作元素。'
	],
	demos: [
		{
			id: 'affix-basic',
			title: '原生 sticky',
			component: BasicDemo,
			source: basicSource,
			covers: ['basic-render', 'native-props'],
			description: '省略scrollContainer，展示原生sticky与offsetTop。'
		},
		{
			id: 'affix-container',
			title: '局部滚动容器',
			component: ContainerDemo,
			source: containerSource,
			covers: ['composition', 'resource-cleanup'],
			description: '显式绑定局部ZScrollArea并显示onAffixChange。'
		},
		{
			id: 'affix-boundary',
			title: '底部边界',
			component: BoundaryDemo,
			source: boundarySource,
			covers: ['native-props', 'variants-and-states'],
			description: '使用offsetBottom和boundary限制投影范围。'
		}
	]
});
