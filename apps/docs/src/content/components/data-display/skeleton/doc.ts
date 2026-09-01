import { skeletonMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import LayoutsDemo from './LayoutsDemo.svelte';
import layoutsSource from './LayoutsDemo.svelte?raw';
import DimensionsDemo from './DimensionsDemo.svelte';
import dimensionsSource from './DimensionsDemo.svelte?raw';
import LinesDemo from './LinesDemo.svelte';
import linesSource from './LinesDemo.svelte?raw';
import MotionDemo from './MotionDemo.svelte';
import motionSource from './MotionDemo.svelte?raw';
import { skeletonApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const skeletonDoc = defineComponentDoc(skeletonMetadata, {
	profiles: ['animated'],
	sourceApi: skeletonApiFacts,
	teaching: {
		props: {
			animated: { default: 'true', description: 'Theme pulse开关；reduced motion始终优先为静态。' },
			height: { default: 'shape token', description: '非负有限px数值或安全CSS长度字符串。' },
			lines: { default: '1', description: 'line形状的等尺寸行数；不推断业务布局。' },
			ref: { default: 'null', description: '真实装饰span或多行group引用。' },
			shape: { default: "'line'", description: '有限line/rectangle/circle占位形状。' },
			width: { default: "'100%'", description: '非负有限px数值或安全CSS长度字符串。' }
		},
		summary:
			'从可访问树隐藏、支持有限shape/严格尺寸/等尺寸多行，并以Theme WAAPI pulse或静态reduced模式工作的Skeleton原语。'
	},
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
		},
		{
			component: LinesDemo,
			covers: ['basic-render', 'composition', 'variants-and-states'],
			description: 'lines只生成等尺寸文本占位；复杂宽度与结构继续由ZStack和多个Skeleton组合。',
			id: 'skeleton-lines',
			source: linesSource,
			title: '等尺寸多行文本占位'
		},
		{
			component: MotionDemo,
			covers: ['full-motion', 'reduced-motion', 'resource-cleanup'],
			description: '默认pulse、animated=false与Provider reduced共享一个Theme duration和清理合同。',
			id: 'skeleton-motion',
			source: motionSource,
			title: 'Pulse、静态与减少动画'
		},
		{
			component: DimensionsDemo,
			covers: ['native-props', 'ssr', 'variants-and-states'],
			description: 'px数字与安全CSS长度覆盖circle、rectangle和文本line，不接受样式注入边界。',
			id: 'skeleton-dimensions',
			source: dimensionsSource,
			title: '形状与严格尺寸'
		}
	],
	accessibility: [
		'Skeleton始终aria-hidden；加载状态由邻近可读文字或独立status承担。',
		'尺寸数值按px处理，字符串拒绝可注入样式边界的分号和花括号。',
		'pulse动画使用Theme skeletonPulse时长与Web Animations，按真实owner realm响应系统/Provider reduced-motion并在切换或卸载时取消。',
		'边框与surface共同保留高对比形状；animated=false和reduced不创建动画。',
		'参考MUI/Ant/Naive的text/circle/rectangle与关闭动画能力；不复制avatar/button/input子组件、业务结构DSL、wave渐变或children/loading切换owner。'
	],
	keywords: ['skeleton', 'placeholder', 'loading', 'lines', 'static', 'reduced motion']
});
