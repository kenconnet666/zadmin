import { iconMetadata } from '@zadmin/zui/metadata';
import GalleryDemo from './GalleryDemo.svelte';
import gallerySource from './GalleryDemo.svelte?raw';
import SemanticsDemo from './SemanticsDemo.svelte';
import semanticsSource from './SemanticsDemo.svelte?raw';
import ActionDemo from './ActionDemo.svelte';
import actionSource from './ActionDemo.svelte?raw';
import RtlDemo from './RtlDemo.svelte';
import rtlSource from './RtlDemo.svelte?raw';
import { iconApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const iconDoc = defineComponentDoc(iconMetadata, {
	profiles: ['primitive'],
	sourceApi: iconApiFacts,
	teaching: {
		props: {
			label: {
				default: '—',
				description: '提供后将图标暴露为role=img；省略时图标保持装饰性。'
			},
			name: { default: '必填', description: '选择ZUI受控Lucide图标清单中的名称。' },
			ref: { default: 'null', description: '绑定Lucide输出的真实SVGSVGElement。' },
			size: {
				default: "'small'",
				description: '使用Theme尺寸token，或传入明确的像素数值。'
			}
		},
		summary: '基于Lucide静态子路径的受控图标原语，统一尺寸、ref与装饰/具名可访问语义。'
	},
	demos: [
		{
			covers: ['basic-render', 'composition', 'native-props'],
			component: GalleryDemo,
			description:
				'ZIcon提供常用名称封装；项目安装必需peer后，可从@lucide/svelte/icons/*直接使用完整图标组件。',
			id: 'icon-gallery',
			source: gallerySource,
			title: '受控图标与完整图标入口'
		},
		{
			covers: ['accessible-name', 'native-props', 'variants-and-states'],
			component: SemanticsDemo,
			description: '装饰与具名图标采用不同ARIA合同，并支持token或数值尺寸。',
			id: 'icon-semantics',
			source: semanticsSource,
			title: '尺寸与可访问语义'
		},
		{
			covers: ['accessible-name', 'composition', 'keyboard'],
			component: ActionDemo,
			description: '文字Button与icon-only Button分别由Button内容或aria-label命名，图标保持装饰性。',
			id: 'icon-action-composition',
			source: actionSource,
			title: '操作控件中的图标'
		},
		{
			covers: ['composition', 'rtl'],
			component: RtlDemo,
			description: 'currentColor自然继承，但方向图标不会仅因RTL自动镜像。',
			id: 'icon-rtl-direction',
			source: rtlSource,
			title: 'RTL与方向所有权'
		}
	],
	accessibility: [
		'没有可访问名称时设置aria-hidden；相邻文字或父Button拥有名称。',
		'具名图标使用role=img，label优先于原生aria-label且必须表达图像用途。',
		'图标永远focusable=false；交互、Tab、disabled和pressed语义属于Button、Link等父控件。',
		'方向图标不自动随RTL镜像，避免把“前进”“返回”“传输”等不同业务语义混为纯视觉方向。'
	]
});
