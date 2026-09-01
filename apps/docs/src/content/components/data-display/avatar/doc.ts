import { avatarMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import ImageDemo from './ImageDemo.svelte';
import imageSource from './ImageDemo.svelte?raw';
import StatesDemo from './StatesDemo.svelte';
import statesSource from './StatesDemo.svelte?raw';
import DecorativeDemo from './DecorativeDemo.svelte';
import decorativeSource from './DecorativeDemo.svelte?raw';
import LifecycleDemo from './LifecycleDemo.svelte';
import lifecycleSource from './LifecycleDemo.svelte?raw';
import NativeImageDemo from './NativeImageDemo.svelte';
import nativeImageSource from './NativeImageDemo.svelte?raw';
import { avatarApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
export const avatarDoc = defineComponentDoc(avatarMetadata, {
	profiles: ['data-view'],
	sourceApi: avatarApiFacts,
	teaching: {
		props: {
			alt: {
				default: '必填',
				description: '真实img与可见fallback共享的替代名称；空字符串明确表示装饰性。'
			},
			crossorigin: { default: '浏览器默认', description: '直接投射到当前真实img。' },
			decoding: { default: '浏览器默认auto', description: '原生图片解码提示。' },
			draggable: { default: '浏览器默认', description: '控制真实img的原生拖拽行为。' },
			fallbackText: {
				default: 'alt首个Unicode字符或“?”',
				description: '没有fallback Snippet时使用的稳定文本占位。'
			},
			imageRef: {
				default: 'null',
				description: '绑定当前图片尝试的真实HTMLImageElement；没有src/srcset时为null。'
			},
			loading: { default: '浏览器默认eager', description: '原生eager/lazy加载策略。' },
			onImageError: {
				description: '当前图片尝试失败并切换fallback后调用；已经被替换的img事件会被忽略。'
			},
			onImageLoad: {
				description: '当前真实img成功加载后调用；不会伪造外部资源状态。'
			},
			ref: { default: 'null', description: '稳定的根HTMLSpanElement引用。' },
			referrerpolicy: { default: '浏览器默认', description: '真实img的原生referrer policy。' },
			shape: { default: "'circle'", description: '根占位形状，不改变图片语义。' },
			size: { default: "'medium'", description: '稳定根宽高与fallback字号。' },
			sizes: { default: 'undefined', description: '与srcset配套的原生响应式尺寸提示。' },
			src: { default: 'undefined', description: '原生图片URL；空值直接显示fallback。' },
			srcset: { default: 'undefined', description: '原生响应式图片候选列表。' }
		},
		summary:
			'以原生响应式img属性、竞态隔离的图片尝试、显式imageRef/load/error和稳定可访问fallback组成的Avatar。'
	},
	demos: [
		{
			component: FormDemo,
			covers: ['accessible-name', 'basic-render', 'ssr'],
			description: '无图片和加载失败都回退为具名文本，根尺寸不跳动。',
			id: 'avatar-fallback',
			source,
			title: '图片Fallback'
		},
		{
			component: StatesDemo,
			covers: ['basic-render', 'variants-and-states'],
			description: '尺寸和形状正交组合，fallback始终保留名称。',
			id: 'avatar-states',
			source: statesSource,
			title: '尺寸与形状'
		},
		{
			component: ImageDemo,
			covers: ['accessible-name', 'composition', 'variants-and-states'],
			description: '成功图片路径与自定义fallback Snippet共享稳定根尺寸和可访问名称。',
			id: 'avatar-image-fallback',
			source: imageSource,
			title: '图片与自定义Fallback'
		},
		{
			component: NativeImageDemo,
			covers: ['loading', 'native-props', 'variants-and-states'],
			description:
				'srcset、sizes、loading、decoding、crossorigin、referrerpolicy和draggable直接属于真实img，imageRef不指向根span。',
			id: 'avatar-native-image',
			source: nativeImageSource,
			title: '原生响应式图片属性'
		},
		{
			component: LifecycleDemo,
			covers: ['controlled', 'external-clear', 'native-props', 'variants-and-states'],
			description:
				'src切换创建独立图片尝试；旧img迟到事件不会污染当前状态，移除图片源立即恢复稳定fallback。',
			id: 'avatar-image-lifecycle',
			source: lifecycleSource,
			title: '图片切换、事件与竞态隔离'
		},
		{
			component: DecorativeDemo,
			covers: ['accessible-name', 'composition', 'native-props'],
			description: 'alt空字符串明确产生装饰性图片/fallback；非空alt在两个视觉分支间保持名称。',
			id: 'avatar-decorative',
			source: decorativeSource,
			title: '装饰性与具名Avatar'
		}
	],
	accessibility: [
		'img使用alt；fallback使用role=img与同一名称。',
		'alt=""时真实img与fallback均退出可访问树，不制造空名称role=img。',
		'图片失败时img保持同一尝试引用但从视觉和可访问树隐藏，fallback不会导致根尺寸跳动。',
		'src/srcset相关属性变化会创建新的keyed图片尝试；load/error只接受当前imageRef，旧资源迟到事件被忽略。',
		'loading、decoding、crossorigin、referrerpolicy、srcset、sizes和draggable全部属于真实img，不错误转发到根span。',
		'Avatar本身不承担按钮语义；可点击用户入口应由外层button/link提供。',
		'参考Ant与MUI采用原生img属性、图片/文字/Icon fallback；不采用AvatarGroup、响应式尺寸对象、preview、crop或upload，这些需要独立消费者和生命周期。'
	],
	keywords: [
		'avatar',
		'image',
		'fallback',
		'srcset',
		'lazy image',
		'decorative image',
		'image race'
	]
});
