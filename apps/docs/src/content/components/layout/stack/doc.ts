import { stackMetadata } from '@zadmin/zui/metadata';
import LayoutDemo from './LayoutDemo.svelte';
import layoutSource from './LayoutDemo.svelte?raw';
import AlignmentDemo from './AlignmentDemo.svelte';
import alignmentSource from './AlignmentDemo.svelte?raw';
import WrapDemo from './WrapDemo.svelte';
import wrapSource from './WrapDemo.svelte?raw';
import NestedRtlDemo from './NestedRtlDemo.svelte';
import nestedRtlSource from './NestedRtlDemo.svelte?raw';
import ResponsiveDemo from './ResponsiveDemo.svelte';
import responsiveSource from './ResponsiveDemo.svelte?raw';
import { stackApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const stackDoc = defineComponentDoc(stackMetadata, {
	profiles: ['primitive'],
	sourceApi: stackApiFacts,
	teaching: {
		props: {
			align: { description: '交叉轴对齐。', default: "'stretch'" },
			direction: { description: 'Flex主轴方向。', default: "'column'" },
			gap: { description: 'Theme间距token或明确px值。', default: "'none'" },
			justify: { description: '主轴分布。', default: "'start'" },
			ref: { description: '真实div引用。', default: 'null' },
			wrap: {
				description: '是否允许Flex换行；reverse反向排列换行后的行，支持断点对象。',
				default: 'false'
			},
			rowGap: { description: '独立行间距，优先于gap。', default: '—' },
			columnGap: { description: '独立列间距，优先于gap。', default: '—' },
			query: { description: 'viewport或命名祖先容器。', default: "'viewport'" }
		},
		summary: '类型安全的Flex布局容器，支持方向、间距、对齐、分布和换行。'
	},
	demos: [
		{
			covers: ['basic-render', 'composition', 'native-props'],
			component: LayoutDemo,
			description: '切换direction，观察真实Flex布局与稳定gap token。',
			id: 'stack-layout',
			source: layoutSource,
			title: '方向与间距'
		},
		{
			covers: ['variants-and-states', 'rtl'],
			component: AlignmentDemo,
			description: '对齐、分布和数值gap直接映射到Flex与作用域变量。',
			id: 'stack-alignment',
			source: alignmentSource,
			title: '对齐与分布'
		},
		{
			covers: ['composition', 'keyboard', 'variants-and-states'],
			component: WrapDemo,
			description: '窄容器中Tag与Button按真实固有宽度换行，不改变子控件Tab顺序。',
			id: 'stack-wrap-responsive',
			source: wrapSource,
			title: '换行与窄容器'
		},
		{
			covers: ['composition', 'rtl'],
			component: NestedRtlDemo,
			description: '嵌套row/column使用逻辑start/end适配RTL，同时保持DOM与阅读顺序。',
			id: 'stack-nested-rtl',
			source: nestedRtlSource,
			title: '嵌套与RTL'
		},
		{
			covers: ['composition', 'native-props', 'ssr'],
			component: ResponsiveDemo,
			description: '方向、间距和换行在base/small/medium/large断点下生成稳定CSS，不依赖客户端测量。',
			id: 'stack-responsive',
			source: responsiveSource,
			title: '响应式断点'
		}
	],
	accessibility: [
		'保持div原生语义；需要list、navigation或group时由调用方使用对应语义组件或原生role。',
		'不会因视觉方向、row-reverse或RTL变化重写DOM与键盘顺序。',
		'wrap只控制Flex换行，子Button/Link/Input继续拥有焦点、可访问名称和交互状态。'
	]
});
