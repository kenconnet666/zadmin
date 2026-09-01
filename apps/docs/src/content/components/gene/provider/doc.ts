import { providerMetadata } from '@zadmin/zui/metadata';
import LocaleDemo from './LocaleDemo.svelte';
import localeSource from './LocaleDemo.svelte?raw';
import PortalDemo from './PortalDemo.svelte';
import portalSource from './PortalDemo.svelte?raw';
import ThemeDemo from './ThemeDemo.svelte';
import themeSource from './ThemeDemo.svelte?raw';
import PreferencesDemo from './PreferencesDemo.svelte';
import preferencesSource from './PreferencesDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const providerDoc = defineComponentDoc(providerMetadata, {
	demos: [
		{
			component: ThemeDemo,
			description: '嵌套Provider只覆盖自己的子树，并继承未显式提供的上下文。',
			id: 'provider-theme',
			source: themeSource,
			title: 'Theme与嵌套Provider'
		},
		{
			component: PreferencesDemo,
			description:
				'嵌套Provider同时覆盖对比度、密度、方向、locale和动画偏好；Button、Input与Textarea在未显式指定size时消费density。',
			id: 'provider-preferences',
			source: preferencesSource,
			title: '显示与区域偏好'
		},
		{
			component: PortalDemo,
			description: 'portalContainer隔离浮层挂载边界，idPrefix为复合组件生成稳定命名空间。',
			id: 'provider-portal-boundary',
			source: portalSource,
			title: 'Portal与ID边界'
		},
		{
			component: LocaleDemo,
			description:
				'locale负责Intl格式规则，localePack提供类型安全的组件文案；二者可以在嵌套Provider中动态切换。',
			id: 'provider-locale-pack',
			source: localeSource,
			title: '类型安全Locale Pack'
		}
	],
	accessibility: ['不创建无语义wrapper。', '不会改变子组件的原生语义与焦点顺序。']
});
