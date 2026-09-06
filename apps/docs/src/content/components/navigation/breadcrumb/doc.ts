import { breadcrumbMetadata } from '@zadmin/zui/metadata';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import LongPathDemo from './LongPathDemo.svelte';
import longPathSource from './LongPathDemo.svelte?raw';
import RtlDemo from './RtlDemo.svelte';
import rtlSource from './RtlDemo.svelte?raw';
import SnippetDemo from './SnippetDemo.svelte';
import snippetSource from './SnippetDemo.svelte?raw';
import { breadcrumbApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const breadcrumbDoc = defineComponentDoc(breadcrumbMetadata, {
	profiles: ['collection'],
	sourceApi: breadcrumbApiFacts,
	teaching: {
		props: {
			items: {
				default: '必填',
				description:
					'路径层级按顺序提供。key保留number/string身份；未指定current时末项为当前页，最多一项显式current，真实href始终保留。'
			},
			ref: { default: 'null', description: '真实nav引用，可供页面壳测量或宿主集成。' }
		},
		summary:
			'生产Breadcrumb保持具名nav/ol/li、typed key、真实路由链接、唯一当前文本、装饰分隔符和窄屏/RTL自然换行；首版不测量或隐藏长路径。'
	},
	demos: [
		{
			component: BasicDemo,
			covers: ['accessible-name', 'basic-render', 'native-props', 'ssr'],
			description: '默认数据模式保留有序路径、真实链接和不可导航的当前文本。',
			id: 'breadcrumb-basic',
			source: basicSource,
			title: '页面路径'
		},
		{
			component: SnippetDemo,
			covers: ['composition', 'native-props', 'variants-and-states'],
			description: 'item和separator可替换可见内容，外层li与辅助技术隐藏的分隔符仍由组件拥有。',
			id: 'breadcrumb-snippets',
			source: snippetSource,
			title: '图标与分隔符 Snippet'
		},
		{
			component: LongPathDemo,
			covers: ['native-props', 'rtl', 'ssr', 'variants-and-states'],
			description: '长CJK路径在窄容器中自然换行；当前版本完整展示路径，不提供伪折叠。',
			id: 'breadcrumb-long-path',
			source: longPathSource,
			title: '窄容器长路径'
		},
		{
			component: RtlDemo,
			covers: ['accessible-name', 'locale', 'native-props', 'rtl'],
			description: 'RTL由Provider方向继承，逻辑布局与换行起点自动镜像。',
			id: 'breadcrumb-rtl',
			source: rtlSource,
			title: 'RTL与逻辑方向'
		}
	],
	accessibility: [
		'根元素始终是带名称的nav，路径始终使用ol/li；通过原生aria-label覆盖默认Breadcrumb名称。',
		'非当前且有href的层级使用真实anchor，保留浏览器导航、Enter、上下文菜单和Ctrl/Cmd点击；没有真实路由时不伪造href。',
		'组件为唯一当前项维护aria-current="page"；当前项可为文本或真实链接，item只定制其内部可见内容。',
		'默认和自定义separator均放进aria-hidden容器，图标与符号不会加入路径名称。item snippet无需重新实现链接或当前项语义。',
		'列表可换行，标签使用min-width:0和overflow-wrap:anywhere；CSS为逻辑属性，因此RTL自然继承。'
	],
	keywords: ['breadcrumb', 'navigation', 'nav', 'ol', 'li', 'aria-current', 'typed key', 'rtl']
});
