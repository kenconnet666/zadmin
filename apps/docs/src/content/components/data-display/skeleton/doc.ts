import { skeletonMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import LayoutsDemo from './LayoutsDemo.svelte';
import layoutsSource from './LayoutsDemo.svelte?raw';
import { skeletonApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const skeletonDoc = defineComponentDoc(skeletonMetadata, {
	profiles: ['animated'],
	sourceApi: skeletonApiFacts,
	demos: [
		{
			component: FormDemo,
			covers: ['basic-render', 'reduced-motion', 'variants-and-states'],
			description: 'line、circle和rectangle先占据最终布局尺寸。',
			id: 'skeleton-shapes',
			source,
			title: '稳定占位'
		},
		{
			component: LayoutsDemo,
			covers: ['composition', 'resource-cleanup'],
			description: '头像、文本和大块内容采用不同稳定占位尺寸。',
			id: 'skeleton-layouts',
			source: layoutsSource,
			title: '内容布局占位'
		}
	],
	accessibility: [
		'Skeleton始终aria-hidden；加载状态由邻近可读文字或独立status承担。',
		'尺寸数值按px处理，字符串拒绝可注入样式边界的分号和花括号。',
		'pulse动画使用Theme skeletonPulse时长与Web Animations，按真实owner realm响应系统/Provider reduced-motion并在切换或卸载时取消。'
	],
	keywords: ['skeleton', 'placeholder', 'loading', 'reduced motion']
});
