import { navLinkMetadata } from '@zadmin/zui/metadata';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import DisclosureDemo from './DisclosureDemo.svelte';
import disclosureSource from './DisclosureDemo.svelte?raw';
import ContentDemo from './ContentDemo.svelte';
import contentSource from './ContentDemo.svelte?raw';
import VisualDemo from './VisualDemo.svelte';
import visualSource from './VisualDemo.svelte?raw';
import { navLinkApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const navLinkDoc = defineComponentDoc(navLinkMetadata, {
	profiles: ['primitive', 'collection'],
	sourceApi: navLinkApiFacts,
	teaching: {
		props: {
			active: { default: 'false', description: '只表达当前页aria-current和视觉状态。' },
			disabled: { default: 'false', description: '阻止导航或disclosure，不改变active/expanded。' },
			expanded: {
				default: 'undefined',
				description: '声明拥有子级，并由独立disclosure button控制。'
			},
			href: { default: '—', description: '有值时主元素是真实anchor；无值时可为button或被动div。' },
			label: { default: '必填', description: '稳定非空可访问标签。' },
			size: { default: 'Provider density', description: '五档导航行、说明和disclosure尺寸。' }
		},
		summary:
			'以真实anchor、button或被动内容呈现导航行；当前页、子级展开、disabled和视觉tone保持独立。'
	},
	demos: [
		{
			component: BasicDemo,
			covers: ['accessible-name', 'basic-render', 'native-props', 'variants-and-states'],
			description:
				'真实href、active当前页和disabled导航同时展示，modified click继续由原生anchor处理。',
			id: 'nav-link-basic',
			source: basicSource,
			title: '真实链接、当前页与禁用'
		},
		{
			component: DisclosureDemo,
			covers: ['composition', 'focus', 'keyboard', 'native-props'],
			description:
				'带href的主链接与独立disclosure并列；无href分支由单个button承担展开，不嵌套button。',
			id: 'nav-link-disclosure',
			source: disclosureSource,
			title: '链接与独立展开'
		},
		{
			component: ContentDemo,
			covers: ['composition', 'native-props', 'rtl', 'variants-and-states'],
			description:
				'labelContent、start、end和description承载长CJK内容，逻辑属性在窄宽度与RTL下自然换行。',
			id: 'nav-link-content',
			source: contentSource,
			title: '内容槽位与长标签'
		},
		{
			component: VisualDemo,
			covers: ['composition', 'reduced-motion', 'rtl', 'variants-and-states'],
			description: 'size、tone、variant分别展示；compact、RTL与reduced motion作为真实状态切换。',
			id: 'nav-link-visual',
			source: visualSource,
			title: '尺寸、语义色与紧凑模式'
		}
	],
	accessibility: [
		'href存在时保留真实anchor和浏览器导航；无href且expanded存在时使用真实button，不嵌套交互元素。',
		'active只表达当前页，expanded只表达子级展开；disabled同时阻止导航和展开，但不删除当前状态。',
		'disclosure使用独立aria-expanded/aria-controls和可访问名称；子级面板由导航容器拥有。',
		'label始终提供可访问名称；compact只隐藏视觉标签，不删除名称或键盘焦点。'
	]
});
