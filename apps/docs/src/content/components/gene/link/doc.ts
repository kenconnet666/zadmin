import { linkMetadata } from '@zadmin/zui/metadata';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import AppearanceDemo from './AppearanceDemo.svelte';
import appearanceSource from './AppearanceDemo.svelte?raw';
import DisabledDemo from './DisabledDemo.svelte';
import disabledSource from './DisabledDemo.svelte?raw';
import ExternalDemo from './ExternalDemo.svelte';
import externalSource from './ExternalDemo.svelte?raw';
import LongDemo from './LongDemo.svelte';
import longSource from './LongDemo.svelte?raw';
import NativeDemo from './NativeDemo.svelte';
import nativeSource from './NativeDemo.svelte?raw';
import NavigationDemo from './NavigationDemo.svelte';
import navigationSource from './NavigationDemo.svelte?raw';
import { linkApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const linkDoc = defineComponentDoc(linkMetadata, {
	profiles: ['primitive'],
	sourceApi: linkApiFacts,
	teaching: {
		props: {
			appearance: {
				default: "'text'",
				description:
					'text保持正文链接；button复用ZButton尺寸与variant；navigation由aria-current表达当前项。'
			},
			disabled: {
				default: 'false',
				description: '保留anchor节点，但移除href/target/rel、Tab停靠与全部click导航。'
			},
			external: {
				default: 'false',
				description: '显式展示Lucide external-link；不会猜测URL，也不会自动设置target。'
			},
			href: {
				default: '必填',
				description: '真实导航目标；没有目标的操作应使用ZButton。'
			},
			newWindowLabel: {
				default: 'localePack.link.opensInNewWindow',
				description: 'target=_blank时提供隐藏提示；显式名称存在时自动通过describedby关联。'
			},
			ref: { default: 'null', description: '真实HTMLAnchorElement引用。' },
			size: {
				default: 'Provider density',
				description: 'appearance为button或navigation时使用的控件尺寸。'
			},
			tone: { default: "'primary'", description: 'Theme语义颜色，不接受任意颜色字符串。' },
			underline: {
				default: "'always'",
				description: '默认不只依赖颜色识别链接；紧凑导航可显式选择hover或none。'
			},
			variant: { default: "'primary'", description: 'appearance为button时复用ZButton视觉variant。' }
		},
		summary:
			'以必填href和真实anchor为唯一导航语义，显式分离外链图标、新窗口行为、安全rel、disabled与视觉tone/underline。'
	},
	demos: [
		{
			component: AppearanceDemo,
			covers: ['basic-render', 'composition', 'variants-and-states'],
			description: 'appearance区分正文、链接按钮与导航项；navigation只由aria-current派生当前状态。',
			id: 'link-appearance',
			source: appearanceSource,
			title: 'Appearance与尺寸'
		},
		{
			component: BasicDemo,
			covers: ['basic-render', 'focus', 'variants-and-states'],
			description: '默认下划线、语义tone与显式underline策略都保持真实anchor和Theme焦点环。',
			id: 'link-basic',
			source: basicSource,
			title: '基础链接与视觉策略'
		},
		{
			component: NavigationDemo,
			covers: ['accessible-name', 'composition', 'native-props'],
			description: 'aria-current标记当前文档位置；相邻页和首页导航继续由原生hash链接拥有。',
			id: 'link-navigation',
			source: navigationSource,
			title: '当前页与导航上下文'
		},
		{
			component: ExternalDemo,
			covers: ['accessible-name', 'locale', 'native-props'],
			description:
				'external只展示Lucide图标；target=_blank独立决定新窗口、安全rel与Provider本地化隐藏提示。',
			id: 'link-external',
			source: externalSource,
			title: '外链与新窗口'
		},
		{
			component: DisabledDemo,
			covers: ['disabled', 'focus', 'keyboard', 'variants-and-states'],
			description: 'disabled移除导航属性、退出Tab序并阻止click回调和父级委托导航。',
			id: 'link-disabled',
			source: disabledSource,
			title: 'Disabled导航边界'
		},
		{
			component: NativeDemo,
			covers: ['accessible-name', 'composition', 'native-props'],
			description:
				'download、mailto、aria-current、target与调用方rel继续作为真实anchor原生属性工作。',
			id: 'link-native-attributes',
			source: nativeSource,
			title: 'Download与原生属性'
		},
		{
			component: LongDemo,
			covers: ['composition', 'native-props', 'variants-and-states'],
			description: '长URL可在窄容器任意断行，Lucide外链图标不被压缩且保持逻辑末端。',
			id: 'link-long-content',
			source: longSource,
			title: '长URL与窄容器'
		}
	],
	accessibility: [
		'ZLink始终渲染原生a且公开API要求href；没有真实导航目标的操作使用ZButton，不用role=link模拟。',
		'默认underline=always，让正文链接不只依赖颜色识别；紧凑导航场景可在有充分上下文时显式改变。',
		'external只表示视觉外链并渲染装饰性Lucide图标，不自动打开新窗口；应用必须显式选择target。',
		'target=_blank时合并调用方rel并强制加入noopener noreferrer；隐藏提示参与内容名称，显式aria-label/labelledby存在时改由aria-describedby关联。',
		'disabled保留anchor供布局和说明使用，但移除href/target/rel、设置aria-disabled、tabindex=-1，并在调用消费方onclick前阻止导航与冒泡。',
		'download、mailto、aria-current和浏览器上下文菜单继续使用原生anchor能力；组件不复制router或Press状态机。',
		'链接文本应描述目标，避免“点击这里”；完整URL展示时组件允许长字符串断行，防止窄布局水平溢出。'
	],
	keywords: [
		'link',
		'anchor',
		'external link',
		'new window',
		'download',
		'aria-current',
		'disabled link'
	]
});
