import { spinnerMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import InlineDemo from './InlineDemo.svelte';
import inlineSource from './InlineDemo.svelte?raw';
import BoundaryDemo from './BoundaryDemo.svelte';
import boundarySource from './BoundaryDemo.svelte?raw';
import ReducedDemo from './ReducedDemo.svelte';
import reducedSource from './ReducedDemo.svelte?raw';
import ToneDemo from './ToneDemo.svelte';
import toneSource from './ToneDemo.svelte?raw';
import { spinnerApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const spinnerDoc = defineComponentDoc(spinnerMetadata, {
	profiles: ['animated'],
	sourceApi: spinnerApiFacts,
	teaching: {
		props: {
			label: {
				default: 'localePack.feedback.loading',
				description: '独立Spinner的status名称；aria-hidden组合会移除role与label。'
			},
			ref: { default: 'null', description: '真实span与owner Document/Window边界。' },
			size: {
				default: 'medium',
				description: 'small用于行内，medium用于局部，large用于显著但仍非overlay的等待。'
			}
		},
		summary:
			'Spinner只表达不确定等待：Lucide LoaderCircle、三个尺寸、有限tone、owner Window WAAPI和reduced-motion清理；容器、overlay、aria-busy与任务由消费者拥有。'
	},
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
		},
		{
			component: ToneDemo,
			covers: ['composition', 'variants-and-states'],
			description: 'primary、muted与inherit满足独立、低强调和组合边界，不扩展成任意色API。',
			id: 'spinner-tones',
			source: toneSource,
			title: '有限Tone与继承'
		},
		{
			component: ReducedDemo,
			covers: ['accessible-name', 'reduced-motion', 'resource-cleanup'],
			description: 'Provider reduced取消真实owner Window上的WAAPI，但保留可见、具名状态。',
			id: 'spinner-reduced-motion',
			source: reducedSource,
			title: '减少动画'
		},
		{
			component: BoundaryDemo,
			covers: ['composition', 'controlled', 'keyboard'],
			description: '业务容器拥有aria-busy、内容切换和操作；Spinner不创建遮罩或阻止交互。',
			id: 'spinner-owner-boundary',
			source: boundarySource,
			title: '容器与任务所有权'
		}
	],
	accessibility: [
		'独立根使用具名role=status，内部Lucide SVG从可访问树隐藏；aria-hidden组合会同时移除status与label，避免Button loading重复公告。',
		'动画使用Web Animations API和Theme duration.spinnerSpin，并在卸载、Provider reduced或owner realm系统reduced motion时取消。',
		'省略label时使用Provider localePack.feedback.loading；显式业务名称始终优先。',
		'长任务仍需邻近文字说明和可取消路径，Spinner不是进度值；已知比例改用ZProgress或ZLoadingBar。',
		'容器的aria-busy、占位布局、overlay、延迟防闪烁与请求取消由调用方拥有，Spinner不复制Ant Spin fullscreen/container。',
		'参考Ant Design small/medium/large与MUI color/inherit，但保留三个token尺寸和primary/muted/inherit，拒绝任意像素、determinate与全屏遮罩。'
	],
	keywords: ['spinner', 'loading', 'reduced motion', 'WAAPI', 'owner Window']
});
