import { spinnerMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const spinnerDoc = defineComponentDoc(spinnerMetadata, {
	demos: [
		{
			component: FormDemo,
			description: '三个稳定尺寸共享同一动画与清理合同。',
			id: 'spinner-sizes',
			source,
			title: '加载尺寸'
		}
	],
	accessibility: [
		'根使用具名role=status，内部SVG从可访问树隐藏。',
		'动画使用Web Animations API并在卸载、Provider reduced或系统reduced-motion时取消。',
		'长任务仍需邻近文字说明和可取消路径，Spinner不是进度值。'
	],
	keywords: ['spinner', 'loading', 'reduced motion']
});
