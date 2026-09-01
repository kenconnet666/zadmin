import { spinnerMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import InlineDemo from './InlineDemo.svelte';
import inlineSource from './InlineDemo.svelte?raw';
import { spinnerApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const spinnerDoc = defineComponentDoc(spinnerMetadata, {
	profiles: ['animated'],
	sourceApi: spinnerApiFacts,
	demos: [
		{
			component: FormDemo,
			covers: ['accessible-name', 'reduced-motion', 'variants-and-states'],
			description: '三个稳定尺寸共享同一动画与清理合同。',
			id: 'spinner-sizes',
			source,
			title: '加载尺寸'
		},
		{
			component: InlineDemo,
			covers: ['composition', 'resource-cleanup'],
			description: '小尺寸Spinner可与持久文本组合，同时保留独立status名称。',
			id: 'spinner-inline',
			source: inlineSource,
			title: '行内加载状态'
		}
	],
	accessibility: [
		'根使用具名role=status，内部SVG从可访问树隐藏。',
		'动画使用Web Animations API和Theme duration.spinnerSpin，并在卸载、Provider reduced或owner realm系统reduced motion时取消。',
		'省略label时使用Provider localePack.feedback.loading；显式业务名称始终优先。',
		'长任务仍需邻近文字说明和可取消路径，Spinner不是进度值。'
	],
	keywords: ['spinner', 'loading', 'reduced motion']
});
