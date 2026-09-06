import { scrollAreaMetadata } from '@zadmin/zui/metadata';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import AxesDemo from './AxesDemo.svelte';
import axesSource from './AxesDemo.svelte?raw';
import ResponsiveHeightDemo from './ResponsiveHeightDemo.svelte';
import responsiveHeightSource from './ResponsiveHeightDemo.svelte?raw';
import ControllerDemo from './ControllerDemo.svelte';
import controllerSource from './ControllerDemo.svelte?raw';
import RtlDemo from './RtlDemo.svelte';
import rtlSource from './RtlDemo.svelte?raw';
import { scrollAreaApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const scrollAreaDoc = defineComponentDoc(scrollAreaMetadata, {
	profiles: ['primitive'],
	sourceApi: scrollAreaApiFacts,
	teaching: {
		props: {
			axis: { default: "'y'", description: 'x、y或both；未启用轴使用hidden。' },
			controller: { default: 'null', description: '可绑定的原生scrollTo/scrollBy控制器。' },
			maxHeight: { default: '—', description: '内容较少时自适应，超出后进入原生滚动。' },
			scrollBehavior: {
				default: "'auto'",
				description: '原生与controller滚动行为，reduced motion时降级。'
			},
			ref: { default: 'null', description: '真实滚动div，同时承载原生onscroll/onscrollend。' }
		},
		summary:
			'单一真实div滚动节点，提供原生键盘滚动、响应式高度、标准CSS滚动条和遵从动画偏好的controller。'
	},
	demos: [
		{
			component: BasicDemo,
			covers: ['accessible-name', 'basic-render', 'keyboard', 'native-props'],
			description: '默认y轴滚动区可被Tab聚焦，方向键与PageUp/PageDown由浏览器处理。',
			id: 'scroll-area-native-vertical',
			source: basicSource,
			title: '原生纵向键盘滚动'
		},
		{
			component: AxesDemo,
			covers: ['basic-render', 'composition', 'native-props'],
			description: 'x与both分别承载真实横向和二维内容，滚动节点与children保持同一DOM边界。',
			id: 'scroll-area-axes',
			source: axesSource,
			title: '横向与二维滚动'
		},
		{
			component: ResponsiveHeightDemo,
			covers: ['composition', 'native-props', 'ssr'],
			description:
				'minHeight、maxHeight按断点生成CSS；内容较少时不强制滚动，超过上限后由原生overflow处理。',
			id: 'scroll-area-responsive-height',
			source: responsiveHeightSource,
			title: '响应式高度与自适应'
		},
		{
			component: ControllerDemo,
			covers: ['composition', 'keyboard', 'native-props', 'variants-and-states'],
			description:
				'controller读取同一真实节点的位置，scrollTo/scrollBy遵守Provider与系统reduced-motion偏好。',
			id: 'scroll-area-controller-motion',
			source: controllerSource,
			title: 'Controller与动画偏好'
		},
		{
			component: RtlDemo,
			covers: ['native-props', 'rtl'],
			description: 'RTL横向内容保留浏览器原始scrollLeft语义，位置回调不把负值转换成伪造的LTR坐标。',
			id: 'scroll-area-rtl',
			source: rtlSource,
			title: 'RTL与原始位置'
		}
	],
	accessibility: [
		'默认真实div带tabindex=0和region语义；可用原生tabindex、aria-label或aria-labelledby调整宿主集成。',
		'组件不拦截内部控件焦点和按键；方向键、PageUp/PageDown、Home/End交由浏览器原生滚动处理。',
		'scrollbarWidth=none不应作为默认无障碍方案；组件保留原生滚动机制，不实现自定义拖动thumb。',
		'RTL位置回调保留DOM的scrollLeft，可为负值；调用方不能按LTR非负坐标假设。'
	]
});
