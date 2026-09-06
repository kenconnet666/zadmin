import { anchorMetadata } from '@zadmin/zui/metadata';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import ControlledDemo from './ControlledDemo.svelte';
import controlledSource from './ControlledDemo.svelte?raw';
import HorizontalDemo from './HorizontalDemo.svelte';
import horizontalSource from './HorizontalDemo.svelte?raw';
import ReducedDemo from './ReducedDemo.svelte';
import reducedSource from './ReducedDemo.svelte?raw';
import { anchorApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const anchorDoc = defineComponentDoc(anchorMetadata, {
	profiles: ['collection', 'primitive'],
	sourceApi: anchorApiFacts,
	teaching: {
		props: {
			activeKey: {
				default: 'defaultActiveKey → null',
				description: '滚动观测到的活动section；不代表路由owner的current。'
			},
			behavior: {
				default: "'smooth'",
				description: 'false只追踪并保留原生href导航；reduced motion时降级。'
			},
			offset: { default: '0', description: '目标滚动偏移px；CSS scroll-padding/margin优先。' },
			scrollContainer: {
				default: 'owner Window',
				description: 'Window或具体HTMLElement滚动容器。'
			}
		},
		summary:
			'以真实anchor追踪和定位页面section，active观察、路由current、滚动容器和hash历史由各自owner管理。'
	},
	demos: [
		{
			component: BasicDemo,
			covers: ['accessible-name', 'basic-render', 'composition', 'native-props'],
			description:
				'具名页面目录使用真实href和唯一targetId，CSS scroll-padding/margin处理sticky标题偏移。',
			id: 'anchor-basic',
			source: basicSource,
			title: '页面目录与真实目标'
		},
		{
			component: ControlledDemo,
			covers: ['controlled', 'focus', 'native-props', 'variants-and-states'],
			description:
				'activeKey由owner受控，onActiveKeyChange只报告scroll观察结果；按钮可调用focus与scrollTo。',
			id: 'anchor-controlled',
			source: controlledSource,
			title: '受控Active与Controller'
		},
		{
			component: HorizontalDemo,
			covers: ['composition', 'keyboard', 'native-props', 'rtl'],
			description: '横向Anchor保留长标签自然换行和RTL逻辑方向，内容目标仍是独立section。',
			id: 'anchor-horizontal',
			source: horizontalSource,
			title: '横向目录与长标签'
		},
		{
			component: ReducedDemo,
			covers: ['composition', 'reduced-motion', 'ssr', 'variants-and-states'],
			description: '具名HTMLElement滚动容器在smooth、auto和reduced motion下保留同一原生目标语义。',
			id: 'anchor-reduced-container',
			source: reducedSource,
			title: '嵌套容器与动画偏好'
		}
	],
	accessibility: [
		'导航项是原生anchor；焦点、active观察和路由current分离，组件不把滚动观察写回业务路由。',
		'每个targetId对应唯一真实section；目标缺失时不输出悬空current或伪造滚动成功。',
		'滚动容器由owner Window或HTMLElement提供；CSS scroll-padding/margin负责sticky偏移，组件不复制滚动引擎。',
		'reduced motion下平滑滚动降级为即时；behavior=false保留浏览器原生hash/导航路径。'
	]
});
