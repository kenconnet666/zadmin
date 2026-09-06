import { navigationMenuMetadata } from '@zadmin/zui/metadata';
import InlineNestedDemo from './InlineNestedDemo.svelte';
import inlineNestedSource from './InlineNestedDemo.svelte?raw';
import HorizontalDemo from './HorizontalDemo.svelte';
import horizontalSource from './HorizontalDemo.svelte?raw';
import CollapsedRtlDemo from './CollapsedRtlDemo.svelte';
import collapsedRtlSource from './CollapsedRtlDemo.svelte?raw';
import CustomPanelDemo from './CustomPanelDemo.svelte';
import customPanelSource from './CustomPanelDemo.svelte?raw';
import ControlledNavigationDemo from './ControlledNavigationDemo.svelte';
import controlledSource from './ControlledNavigationDemo.svelte?raw';
import { navigationMenuApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const navigationMenuDoc = defineComponentDoc(navigationMenuMetadata, {
	profiles: ['collection', 'layer'],
	sourceApi: navigationMenuApiFacts,
	teaching: {
		props: {
			currentKey: { default: 'null', description: '仅由路由owner输入；焦点和展开不会自动修改。' },
			expandMode: { default: 'inline=multiple，浮层=single', description: '同层分支展开策略。' },
			mode: {
				default: "'inline'",
				description: 'inline层级、vertical侧向flyout或horizontal面板。'
			},
			openKeys: { default: '[]', description: '受控/可绑定展开key数组。' },
			overflow: {
				default: 'true',
				description:
					'horizontal模式折叠普通项；当前项与包含自定义panel的根项固定显示。更多入口使用数据label/icon，不重复执行消费者item/start/end/panel snippets。'
			}
		},
		summary:
			'以真实nav列表、链接和disclosure构建站点导航；current、focus、open和SPA路由请求由独立owner管理。'
	},
	demos: [
		{
			component: InlineNestedDemo,
			covers: ['accessible-name', 'basic-render', 'composition', 'keyboard'],
			description: 'inline层级包含group、separator、disabled、href+children item和真实子链接。',
			id: 'navigation-menu-inline',
			source: inlineNestedSource,
			title: 'Inline层级与独立Disclosure'
		},
		{
			component: HorizontalDemo,
			covers: ['composition', 'focus', 'native-props', 'variants-and-states'],
			description: '容器宽度在240px和640px之间切换；自定义面板保持唯一实例，普通链接进入更多导航。',
			id: 'navigation-menu-horizontal',
			source: horizontalSource,
			title: 'Horizontal面板与溢出'
		},
		{
			component: CollapsedRtlDemo,
			covers: ['composition', 'keyboard', 'rtl', 'variants-and-states'],
			description: 'inline与collapsed切换，RTL下子级仍通过真实flyout访问。',
			id: 'navigation-menu-collapsed-rtl',
			source: collapsedRtlSource,
			title: 'Collapsed与RTL'
		},
		{
			component: CustomPanelDemo,
			covers: ['composition', 'native-props', 'variants-and-states'],
			description: 'item.panel snippet提供真实链接和卡片内容，close由panel context拥有。',
			id: 'navigation-menu-custom-panel',
			source: customPanelSource,
			title: '自定义Panel内容'
		},
		{
			component: ControlledNavigationDemo,
			covers: ['controlled', 'focus', 'native-props', 'variants-and-states'],
			description: '取消与接受导航请求分别展示；确认后owner写入currentKey并调用request.close。',
			id: 'navigation-menu-controlled',
			source: controlledSource,
			title: '受控Current与导航请求'
		}
	],
	accessibility: [
		'根是具名nav和原生列表；站点链接不使用role=menu，命令菜单职责仍由ZMenu承担。',
		'currentKey只表达路由当前项；active ancestor、openKeys和focusKey分离。',
		'item可同时拥有href与children，主链接和disclosure是并列真实元素，不嵌套button。',
		'隐藏panel/overflow内容继续通过真实链接访问；disabled节点不导航、不展开并跳过焦点。'
	]
});
