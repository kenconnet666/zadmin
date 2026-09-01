import { tourMetadata } from '@zadmin/zui/metadata';
import AsyncTargetDemo from './AsyncTargetDemo.svelte';
import asyncTargetSource from './AsyncTargetDemo.svelte?raw';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import NonModalDemo from './NonModalDemo.svelte';
import nonModalSource from './NonModalDemo.svelte?raw';
import ScopedRootDemo from './ScopedRootDemo.svelte';
import scopedRootSource from './ScopedRootDemo.svelte?raw';
import { tourApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const tourDoc = defineComponentDoc(tourMetadata, {
	profiles: ['layer', 'animated'],
	sourceApi: tourApiFacts,
	teaching: {
		props: {
			closeLabel: {
				default: 'localePack.tour.close',
				description: '关闭图标的可访问名称；显式值优先于Provider typed locale pack。'
			},
			closeOnEscape: {
				default: 'true',
				description: '是否允许最顶层Layer处理Escape；关闭时会阻止默认dismiss。'
			},
			closeOnMaskClick: {
				default: 'true',
				description: 'modal遮罩是否允许点击关闭；高亮目标始终注册为Layer branch。'
			},
			defaultOpen: {
				default: 'false',
				description: '非受控打开初值；首次真实target解析只发生在浏览器挂载后。'
			},
			defaultStep: {
				default: '0',
				description: '非受控零起始步骤；必须指向steps中的合法索引。'
			},
			finishLabel: {
				default: 'localePack.tour.finish',
				description: '最后一步操作文案；显式值优先。'
			},
			missingTargetBehavior: {
				default: "'close'",
				description:
					'close保持兼容；skip按顺序继续；wait显示居中card并由作用域MutationObserver等待目标。'
			},
			modal: {
				default: 'true',
				description: '启用四片遮罩和card/高亮目标联合焦点trap；false保留spotlight但允许页面交互。'
			},
			nextLabel: {
				default: 'localePack.tour.next',
				description: '下一步文案；显式值优先。'
			},
			onComplete: {
				default: '—',
				description: '用户激活最后一步时调用一次，随后请求关闭；直接关闭不会伪造完成。'
			},
			onOpenChange: {
				default: '—',
				description: '只为用户关闭、遮罩、Escape或缺失策略调用；外部同步不回调。'
			},
			onStepChange: {
				default: '—',
				description: '只为上一步、下一步或skip策略写入的真实步骤变化调用。'
			},
			onTargetMissing: {
				default: '—',
				description: '每次连续缺失只报告一次；目标随后出现并再次消失时可再次报告。'
			},
			open: {
				default: 'undefined',
				description: 'Svelte bindable打开轴；退出Presence期间保留最后目标、card和焦点恢复合同。'
			},
			previousLabel: {
				default: 'localePack.tour.previous',
				description: '上一步文案；显式值优先。'
			},
			ref: {
				default: 'null',
				description: '挂载期间真实dialog card引用，不是Portal layer或spotlight。'
			},
			scrollIntoViewOptions: {
				default: 'true',
				description: 'false关闭自动滚动；对象透传原生选项，但reduced motion始终强制behavior=auto。'
			},
			spotlightOffset: {
				default: '8',
				description: '目标四周非负有限像素留白；遮罩与spotlight共享同一裁剪几何。'
			},
			step: {
				default: 'undefined（内部0）',
				description: 'Svelte bindable零起始步骤，由调用方可与路由、持久化或业务进度同步。'
			},
			steps: {
				default: '必填',
				description:
					'稳定唯一id；title/description支持字符串或Snippet；target省略/null表示居中步骤。'
			},
			targetRoot: {
				default: '组件anchor所在Document或ShadowRoot',
				description: '限制selector、观察器和目标身份；函数target返回作用域外元素会早期失败。'
			}
		},
		summary:
			'生产导览层：受控open/step、作用域安全target、缺失目标close/skip/wait策略、显式居中步骤、typed locale、RTL、Portal/Floating、联合焦点branch和reduced-motion Presence；不复制页面路由、异步请求或业务完成状态。'
	},
	demos: [
		{
			component: FormDemo,
			covers: ['controlled', 'focus', 'keyboard', 'portal'],
			description: '两步导览复用真实目标、Portal、Floating和modal焦点生命周期。',
			id: 'tour-guided',
			source,
			title: '生产发布导览'
		},
		{
			component: NonModalDemo,
			covers: ['controlled', 'focus', 'variants-and-states'],
			description: '非模态模式不trap页面焦点、不渲染遮罩，并在完成时回调。',
			id: 'tour-non-modal',
			source: nonModalSource,
			title: '非模态导览'
		},
		{
			component: AsyncTargetDemo,
			covers: ['controlled', 'resource-cleanup', 'variants-and-states'],
			description: 'wait策略在目标未挂载时保留居中card，目标出现后由根作用域观察器自动重新定位。',
			id: 'tour-async-target',
			source: asyncTargetSource,
			title: '异步目标等待与清理'
		},
		{
			component: ScopedRootDemo,
			covers: ['locale', 'portal', 'rtl', 'reduced-motion'],
			description:
				'重复selector只在显式root内解析；嵌套Provider同时验证RTL、本地化和关闭自动滚动。',
			id: 'tour-scoped-root',
			source: scopedRootSource,
			title: 'Root作用域、居中步骤与RTL'
		}
	],
	accessibility: [
		'打开card使用具名dialog；modal模式的FocusScope把card与高亮目标作为同一逻辑范围，关闭后恢复启动焦点。',
		'selector默认限制在组件所在Document或ShadowRoot，也可显式提供Element root；函数target不能逃逸作用域。',
		'四片遮罩保留真实目标孔洞，spotlight只装饰；非模态模式不渲染遮罩，Escape仍归最顶层LayerStack所有。',
		'目标缺失可关闭、顺序跳过或等待；wait状态保留可操作的居中card，不制造悬空ARIA引用。',
		'scrollIntoView在reduced motion下强制auto；ResizeObserver、visualViewport、scroll和Floating持续更新几何。',
		'所有默认按钮文案和进度来自typed locale pack；Portal后的card显式继承Provider方向。'
	],
	keywords: [
		'tour',
		'spotlight',
		'floating',
		'focus scope',
		'portal',
		'missing target',
		'root scope',
		'rtl',
		'locale',
		'reduced motion'
	]
});
