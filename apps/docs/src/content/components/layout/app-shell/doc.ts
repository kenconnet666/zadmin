import { appShellMetadata } from '@zadmin/zui/metadata';
import AlternativeScrollDemo from './AlternativeScrollDemo.svelte';
import alternativeScrollSource from './AlternativeScrollDemo.svelte?raw';
import DesktopDemo from './DesktopDemo.svelte';
import desktopSource from './DesktopDemo.svelte?raw';
import ResponsiveDemo from './ResponsiveDemo.svelte';
import responsiveSource from './ResponsiveDemo.svelte?raw';
import RtlDemo from './RtlDemo.svelte';
import rtlSource from './RtlDemo.svelte?raw';
import { appShellApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const appShellDoc = defineComponentDoc(appShellMetadata, {
	profiles: ['primitive'],
	sourceApi: appShellApiFacts,
	teaching: {
		props: {
			layout: {
				default: "'default'",
				description: 'default让header/footer跨越侧栏；alternative将它们收进两侧区域的中间列。'
			},
			mainAs: {
				default: "'main'",
				description: '应用页面使用main；Docs、Dialog或其他已有landmark内部使用div，避免嵌套main。'
			},
			scroll: {
				default: "'main'",
				description: 'main让正文滚动且根裁剪；root让有界应用壳根滚动。两者都不测量客户端尺寸。'
			},
			navbarCollapsed: {
				default: 'false',
				description: '响应式boolean；常用{ base: true, medium: false }在手机折叠、桌面展开。'
			},
			asideCollapsed: {
				default: 'false',
				description: '响应式boolean；常用{ base: true, large: false }只在宽屏显示辅助区域。'
			},
			mainPadding: {
				default: "'medium'",
				description:
					'正文内容inset。header/navbar/aside/footer可见时始终占用Grid轨道，因此轨道是确定性offset。'
			},
			headerHeight: {
				default: 'Theme.size.appShellHeaderHeight（56px）',
				description: '存在header时的目的明确默认高度；可由Theme或显式响应式值覆盖。'
			},
			navbarWidth: {
				default: 'Theme.size.appShellNavbarWidth（240px）',
				description: '存在且未折叠navbar时的目的明确默认宽度；aside同样消费独立AppShell token。'
			},
			ref: { default: 'null', description: '真实应用壳div引用。' }
		},
		summary:
			'原生区域的CSS Grid应用壳：通过响应式轨道完成侧栏折叠和内容offset，明确main/root唯一滚动owner，并保留调用方的内容、路由与交互所有权。'
	},
	demos: [
		{
			component: DesktopDemo,
			covers: ['basic-render', 'composition', 'native-props', 'ssr'],
			description:
				'完整header/navbar/aside/main/footer区域在有界根内由main单独滚动；Docs使用mainAs=div。',
			id: 'app-shell-desktop',
			source: desktopSource,
			title: '完整桌面工作台'
		},
		{
			component: ResponsiveDemo,
			covers: ['composition', 'native-props', 'rtl', 'ssr', 'variants-and-states'],
			description: '移动端和桌面端折叠都只是可预测的CSS规则，没有JS测量或首帧切换。',
			id: 'app-shell-responsive',
			source: responsiveSource,
			title: '移动折叠与桌面展开'
		},
		{
			component: AlternativeScrollDemo,
			covers: ['composition', 'native-props', 'ssr', 'variants-and-states'],
			description: 'alternative将header/footer置于两侧区域之间；root明确承担有界壳的滚动。',
			id: 'app-shell-alternative-scroll',
			source: alternativeScrollSource,
			title: 'Alternative布局与Root滚动'
		},
		{
			component: RtlDemo,
			covers: ['native-props', 'rtl'],
			description: '逻辑Grid轨道与原始DOM区域顺序在RTL下仍保持可预测。',
			id: 'app-shell-rtl',
			source: rtlSource,
			title: 'RTL区域布局'
		}
	],
	accessibility: [
		'header、navbar、aside、main/div和footer分别保持原生区域语义；navbar默认名称由Provider localePack.common.primaryNavigation提供，aside可显式命名。',
		'mainAs=div为已有main、dialog或嵌入式工作区提供无嵌套landmark路径；它不会为调用方补造main role。',
		'CSS Grid只改变区域视觉位置。所有区域和正文children维持header、navbar、main、aside、footer的DOM顺序，RTL不重排阅读或键盘顺序。',
		'scroll=main时正文是唯一内部滚动容器；scroll=root时有界根是唯一滚动容器。调用方必须给需要独立滚动的AppShell一个有界block尺寸。',
		'折叠区域在对应CSS断点display:none且轨道为0；不使用ResizeObserver、window宽度或hydration后状态修正。'
	],
	keywords: [
		'app shell',
		'application layout',
		'header',
		'navbar',
		'aside',
		'footer',
		'scroll',
		'responsive',
		'rtl'
	]
});
