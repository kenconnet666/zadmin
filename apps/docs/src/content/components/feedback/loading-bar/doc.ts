import { loadingBarMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import PageDemo from './PageDemo.svelte';
import pageSource from './PageDemo.svelte?raw';
import ControlledDemo from './ControlledDemo.svelte';
import controlledSource from './ControlledDemo.svelte?raw';
import LifecycleDemo from './LifecycleDemo.svelte';
import lifecycleSource from './LifecycleDemo.svelte?raw';
import PreferencesDemo from './PreferencesDemo.svelte';
import preferencesSource from './PreferencesDemo.svelte?raw';
import { loadingBarApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const loadingBarDoc = defineComponentDoc(loadingBarMetadata, {
	additionalApi: [
		{
			description:
				'bind:controller发布当前组件作用域的稳定命令面；所有方法只写回active/state/value与owner Window收尾timer。',
			id: 'loading-bar-controller-service',
			rows: [
				{
					description: '开始不确定任务；传值时从clamp后的确定进度开始。',
					feature: 'service',
					name: 'start',
					type: '(value?: number) => void'
				},
				{
					description: '写入0–100确定值并回到loading阶段；不代表请求所有权。',
					feature: 'service',
					name: 'update',
					type: '(value: number) => void'
				},
				{
					description: '写入success/100，并按finishDelay或hideAfter使用owner Window隐藏。',
					feature: 'service',
					name: 'finish',
					type: '(options?: { hideAfter?: number | null }) => void'
				},
				{
					description: '写入error；默认持久，显式hideAfter可收尾。',
					feature: 'service',
					name: 'error',
					type: '(options?: { hideAfter?: number | null }) => void'
				},
				{
					description: '取消timer并写入inactive/idle/undefined。',
					feature: 'service',
					name: 'reset',
					type: '() => void'
				}
			],
			title: 'LoadingBar Controller'
		}
	],
	profiles: ['animated', 'service'],
	sourceApi: loadingBarApiFacts,
	teaching: {
		props: {
			label: {
				default: 'localePack.feedback.loading',
				description: 'progressbar可访问名称；业务名称应说明具体任务。'
			},
			value: {
				default: 'undefined',
				description: '有限值clamp到0–100并输出aria-valuenow；undefined省略valuenow。'
			}
		},
		summary:
			'LoadingBar是轻量线性任务反馈：local/page布局、确定/不确定进度、bindable状态和作用域controller；请求、Promise、重试、路由和全局单例继续属于应用。'
	},
	demos: [
		{
			component: FormDemo,
			covers: ['accessible-name', 'native-props', 'variants-and-states'],
			description: '确定值与不确定任务使用同一个progressbar合同。',
			id: 'loading-bar-values',
			source,
			title: '确定与不确定进度'
		},
		{
			component: PageDemo,
			covers: ['composition', 'reduced-motion', 'resource-cleanup'],
			description: 'page模式固定到逻辑视口顶部，并保留不确定进度公告。',
			id: 'loading-bar-page',
			source: pageSource,
			title: '页面级进度'
		},
		{
			component: LifecycleDemo,
			covers: ['controlled', 'resource-cleanup', 'variants-and-states'],
			description:
				'组件作用域controller统一start/update/finish/error/reset，并以owner Window计时清理。',
			id: 'loading-bar-controller',
			source: lifecycleSource,
			title: 'Controller生命周期'
		},
		{
			component: ControlledDemo,
			covers: ['controlled', 'external-clear', 'variants-and-states'],
			description: '外部owner直接绑定active/state/value，继续持有请求、取消、重试与业务状态。',
			id: 'loading-bar-controlled',
			source: controlledSource,
			title: '外部受控状态'
		},
		{
			component: PreferencesDemo,
			covers: ['reduced-motion', 'resource-cleanup', 'rtl'],
			description:
				'RTL逻辑方向与reduced motion静态回退不隐藏进度，并由owner Document可见性暂停动画。',
			id: 'loading-bar-preferences',
			source: preferencesSource,
			title: 'RTL、可见性与减少动画'
		}
	],
	accessibility: [
		'遵循WAI-ARIA range合同：确定值提供0–100 aria-valuenow；不确定值省略valuenow并保留具名progressbar。',
		'mode=page仅改变视口定位，不创建全局单例。',
		'不确定动画使用Theme duration.loadingBarIndeterminate，从真实owner Window解析reduced motion，并在Document隐藏或卸载时取消。',
		'reduced motion将不确定指示条静态铺满而不是隐藏；RTL使用逻辑起点并反转WAAPI位移。',
		'controller只协调组件状态与owner Window收尾计时；不观察Promise、不拦截fetch、不推断路由，也不复制ZProgress的circle/label/format API。',
		'finish到100%后默认短暂展示再隐藏，error默认持久；调用方可bind状态或传hideAfter，不会有悬空全局timer。',
		'参考Naive UI provider的start/finish/error服务体验、MUI determinate/indeterminate语义和Ant Progress状态色；拒绝全局注入、请求owner、buffer与复杂进度视图。'
	],
	keywords: [
		'loading bar',
		'progressbar',
		'page progress',
		'controller',
		'determinate',
		'indeterminate'
	]
});
