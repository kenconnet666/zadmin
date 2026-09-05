import { carouselMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import BoundariesDemo from './BoundariesDemo.svelte';
import boundariesSource from './BoundariesDemo.svelte?raw';
import AutoplayDemo from './AutoplayDemo.svelte';
import autoplaySource from './AutoplayDemo.svelte?raw';
import ControlledDemo from './ControlledDemo.svelte';
import controlledSource from './ControlledDemo.svelte?raw';
import LongRtlDemo from './LongRtlDemo.svelte';
import longRtlSource from './LongRtlDemo.svelte?raw';
import { carouselApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const carouselDoc = defineComponentDoc(carouselMetadata, {
	profiles: ['collection', 'animated'],
	sourceApi: carouselApiFacts,
	teaching: {
		props: {
			'aria-label': {
				default: '必填',
				description: 'Carousel region的原生业务可访问名称；不应只写泛化“轮播”。'
			},
			defaultValue: {
				default: '第一张slide key',
				description: '非受控初始slide；动态items仍按稳定typed key保持身份。'
			},
			itemLabel: {
				default: '必填',
				description: '每张slide的业务名称，用于位置公告和直接跳转按钮。'
			},
			nextLabel: {
				default: 'localePack.carousel.nextSlide',
				description: '下一张控制名称；显式值优先。'
			},
			pauseLabel: {
				default: 'localePack.carousel.pauseRotation',
				description: '暂停自动轮播控制名称；显式值优先。'
			},
			playLabel: {
				default: 'localePack.carousel.startRotation',
				description: '恢复自动轮播控制名称；显式值优先。'
			},
			previousLabel: {
				default: 'localePack.carousel.previousSlide',
				description: '上一张控制名称；显式值优先。'
			}
		},
		summary:
			'稳定typed-key、完整rotation controls、owner-realm可见性/计时器、typed locale与多原因暂停共同拥有的生产Carousel。'
	},
	demos: [
		{
			component: FormDemo,
			covers: ['controlled', 'keyboard', 'variants-and-states'],
			description: '稳定slide key、显式rotation control和直接跳转保持同一value。',
			id: 'carousel-controls',
			source,
			title: '可暂停轮播'
		},
		{
			component: BoundariesDemo,
			covers: ['disabled', 'uncontrolled', 'variants-and-states'],
			description: '关闭loop后首尾控制正确禁用，且不启动自动轮播。',
			id: 'carousel-boundaries',
			source: boundariesSource,
			title: '不循环边界'
		},
		{
			component: AutoplayDemo,
			covers: ['accessible-name', 'full-motion', 'reduced-motion', 'resource-cleanup'],
			description:
				'显式自动轮播在hover、内部焦点、页面隐藏、用户暂停或reduced-motion下停止并保留当前value。',
			id: 'carousel-autoplay-pause',
			source: autoplaySource,
			title: '自动轮播与暂停条件'
		},
		{
			component: ControlledDemo,
			covers: ['controlled', 'external-clear', 'keyboard', 'variants-and-states'],
			description:
				'number/string typed key与外部value写入保持身份；只有真实Carousel控制触发onValueChange。',
			id: 'carousel-controlled-typed-key',
			source: controlledSource,
			title: '受控Value与Typed Key'
		},
		{
			component: LongRtlDemo,
			covers: ['accessible-name', 'rtl', 'variants-and-states'],
			description: '长CJK/英文标识在窄RTL容器安全换行，逻辑前后控制随方向选择Lucide。',
			id: 'carousel-long-rtl',
			source: longRtlSource,
			title: '长内容、窄容器与RTL'
		}
	],
	accessibility: [
		'根使用具名region与carousel roledescription，每个slide具备全局位置和名称。',
		'自动轮播存在时必须渲染暂停/开始按钮；焦点进入、hover、ownerDocument隐藏和reduced-motion都会暂停。',
		'自动旋转时viewport aria-live=off，暂停后切换为polite，避免连续公告。',
		'上一张、下一张和直接跳转均使用原生button，不劫持页面方向键。',
		'matchMedia、visibilitychange和interval都绑定到Carousel真实owner realm，卸载或暂停会同步释放。',
		'控制、位置、直接跳转与aria-roledescription均来自typed carousel locale；显式上一张/下一张/暂停/恢复文案优先。',
		'外部value必须始终引用当前items中的typed key；组件对未知受控key早失败，不静默选择另一张。'
	],
	keywords: [
		'carousel',
		'slides',
		'autoplay',
		'reduced motion',
		'rotation control',
		'locale',
		'RTL'
	]
});
