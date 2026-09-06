import { backTopMetadata } from '@zadmin/zui/metadata';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
import { backTopApiFacts } from '../../../../framework/component-api.generated.js';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import ContainerDemo from './ContainerDemo.svelte';
import containerSource from './ContainerDemo.svelte?raw';
import StatesDemo from './StatesDemo.svelte';
import statesSource from './StatesDemo.svelte?raw';

export const backTopDoc = defineComponentDoc(backTopMetadata, {
	profiles: ['primitive', 'animated'],
	sourceApi: backTopApiFacts,
	teaching: {
		props: {
			label: {
				default: 'localePack.common.backToTop',
				description: '可访问名称，生产代码建议明确提供。'
			},
			visibilityHeight: { default: '400', description: '超过该滚动距离才显示。' },
			behavior: { default: 'smooth', description: 'reduced motion时组件使用instant。' },
			scrollContainer: {
				default: 'owner Window',
				description: '显式HTMLElement时只监听并滚动该容器。'
			}
		},
		summary: '真实button调用原生scrollTo；局部容器示例不会改变Docs整页位置。'
	},
	accessibility: [
		'组件渲染真实button并要求可访问label；Enter和Space沿用原生button键盘语义。',
		'visibilityHeight只控制显示，不改变焦点顺序；reduced motion时滚动行为降为instant。',
		'显式scrollContainer仅监听并滚动该owner，不劫持Docs整页导航。'
	],
	demos: [
		{
			id: 'back-top-basic',
			title: 'Window与自定义内容',
			component: BasicDemo,
			source: basicSource,
			covers: ['basic-render', 'focus', 'native-props'],
			description: '使用明确label和自定义children。'
		},
		{
			id: 'back-top-container',
			title: '局部滚动 owner',
			component: ContainerDemo,
			source: containerSource,
			covers: ['composition', 'resource-cleanup'],
			description: '只监听局部ZScrollArea。'
		},
		{
			id: 'back-top-states',
			title: '位置与状态',
			component: StatesDemo,
			source: statesSource,
			covers: ['full-motion', 'reduced-motion', 'variants-and-states'],
			description: '展示逻辑位置、按钮外观，以及主题动画与reduced-motion状态。'
		}
	]
});
