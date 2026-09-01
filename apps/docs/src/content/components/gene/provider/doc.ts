import { providerMetadata } from '@zadmin/zui/metadata';
import LocaleDemo from './LocaleDemo.svelte';
import localeSource from './LocaleDemo.svelte?raw';
import PortalDemo from './PortalDemo.svelte';
import portalSource from './PortalDemo.svelte?raw';
import ThemeDemo from './ThemeDemo.svelte';
import themeSource from './ThemeDemo.svelte?raw';
import PreferencesDemo from './PreferencesDemo.svelte';
import preferencesSource from './PreferencesDemo.svelte?raw';
import { providerApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const providerDoc = defineComponentDoc(providerMetadata, {
	profiles: ['service'],
	sourceApi: providerApiFacts,
	teaching: {
		props: {
			colorScheme: {
				default: "继承父级或 'light'",
				description: '为代码表面等需要配套明暗外观的后代提供显式色彩模式。'
			},
			contrast: {
				default: "继承父级或 'normal'",
				description:
					'设置对比度偏好；应用可据此选择高对比Theme，后代也可读取同一作用域值。'
			},
			density: {
				default: "继承父级或 'comfortable'",
				description: '设置后代控件的默认密度；组件显式size始终优先。'
			},
			direction: {
				default: "继承父级或 'ltr'",
				description: '设置逻辑方向，组件不会从客户端环境猜测LTR或RTL。'
			},
			idPrefix: {
				default: "继承父级或 'zui'",
				description: '为复合组件生成SSR稳定且可嵌套隔离的ID命名空间。'
			},
			locale: {
				default: "继承父级或 'en-US'",
				description: '用于Intl格式化的BCP 47 locale。'
			},
			localePack: {
				default: '继承父级或enUSLocalePack',
				description: '覆盖类型安全的组件文案、格式函数和区域默认值。'
			},
			motion: {
				default: "继承父级或 'auto'",
				description: '选择完整、减少或尊重平台偏好的动画策略。'
			},
			portalContainer: {
				default: '继承父级或null',
				description: '限定浮层挂载到Document、ShadowRoot或指定HTMLElement。'
			},
			runtime: {
				default: '继承父级或当前runtime',
				description: '注入浏览器、ShadowRoot或SSR使用的ICSS runtime。'
			},
			theme: {
				default: '继承父级或defaultTheme',
				description: '为后代提供完整ZUI Theme token集合。'
			},
			timeZone: {
				default: "继承父级或 'UTC'",
				description: '为日期组件提供SSR稳定的IANA时区。'
			},
			translations: {
				default: '继承父级或空字典',
				description: '旧字符串字典兼容入口；新代码优先使用localePack。'
			}
		},
		summary:
			'无额外DOM的作用域服务，统一提供Theme、显示偏好、区域设置、SSR稳定标识和Portal/ICSS边界。'
	},
	demos: [
		{
			covers: ['basic-render', 'composition'],
			component: ThemeDemo,
			description: '嵌套Provider只覆盖自己的子树，并继承未显式提供的上下文。',
			id: 'provider-theme',
			source: themeSource,
			title: 'Theme与嵌套Provider'
		},
		{
			covers: [
				'controlled',
				'density',
				'full-motion',
				'reduced-motion',
				'rtl',
				'variants-and-states'
			],
			component: PreferencesDemo,
			description:
				'动态切换明暗、对比度、密度、方向和动画轴；示例把明暗/对比度解析为真实Theme，Button、Input、Textarea与Pagination立即消费结果。',
			id: 'provider-preferences',
			source: preferencesSource,
			title: '显示与区域偏好'
		},
		{
			covers: ['portal', 'ssr'],
			component: PortalDemo,
			description: 'portalContainer隔离浮层挂载边界，idPrefix为复合组件生成稳定命名空间。',
			id: 'provider-portal-boundary',
			source: portalSource,
			title: 'Portal与ID边界'
		},
		{
			covers: ['controlled', 'locale'],
			component: LocaleDemo,
			description:
				'locale负责Intl格式规则，localePack提供类型安全文案和hourCycle，显式timeZone保证SSR稳定；三者可以在嵌套Provider中动态切换。',
			id: 'provider-locale-pack',
			source: localeSource,
			title: '类型安全Locale Pack'
		}
	],
	accessibility: ['不创建无语义wrapper。', '不会改变子组件的原生语义与焦点顺序。']
});
