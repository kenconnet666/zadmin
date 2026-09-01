import { buttonMetadata } from '@zadmin/zui/metadata';
import AsyncDemo from './AsyncDemo.svelte';
import asyncSource from './AsyncDemo.svelte?raw';
import CompositionDemo from './CompositionDemo.svelte';
import compositionSource from './CompositionDemo.svelte?raw';
import FormDemo from './FormDemo.svelte';
import formSource from './FormDemo.svelte?raw';
import IconDemo from './IconDemo.svelte';
import iconSource from './IconDemo.svelte?raw';
import StatesDemo from './StatesDemo.svelte';
import statesSource from './StatesDemo.svelte?raw';
import VariantsDemo from './VariantsDemo.svelte';
import variantsSource from './VariantsDemo.svelte?raw';
import { buttonApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const buttonDoc = defineComponentDoc(buttonMetadata, {
	profiles: ['primitive', 'animated'],
	sourceApi: buttonApiFacts,
	teaching: {
		props: {
			disabled: { default: 'false', description: '映射到原生disabled并阻止全部用户操作。' },
			end: { default: '—', description: '在主体内容之后渲染的图标或辅助Snippet。' },
			fullWidth: { default: 'false', description: '让按钮占满父容器的可用行内宽度。' },
			loading: { default: 'false', description: '设置busy状态、显示指示器并阻止重复操作。' },
			loadingIndicator: {
				default: '内置省略指示器',
				description: '替换loading状态中的视觉指示器；可访问名称仍由按钮提供。'
			},
			loadingLabel: {
				default: '—',
				description: 'loading期间覆盖按钮的可访问名称，例如“正在保存设置”。'
			},
			ref: { default: 'null', description: '真实HTMLButtonElement引用。' },
			size: { default: "'medium'", description: '统一控制高度、间距与文本尺寸。' },
			start: { default: '—', description: '在主体内容之前渲染的图标或辅助Snippet。' },
			variant: {
				default: "'primary'",
				description: '当前视觉强调层级；tone正交化将在迁移阶段完成。'
			}
		},
		summary: '保留原生button与表单语义，提供稳定尺寸、视觉层级、异步busy状态和Snippet组合能力。'
	},
	demos: [
		{
			covers: ['basic-render', 'variants-and-states'],
			component: VariantsDemo,
			description: '每一种视觉变体都生成稳定、可复用的 recipe class。',
			id: 'button-variants',
			source: variantsSource,
			title: '视觉变体'
		},
		{
			covers: ['density', 'disabled', 'loading'],
			component: StatesDemo,
			description: '尺寸、加载和禁用状态都保留原生 button 语义，点击事件通过 onclick 传递。',
			id: 'button-states',
			source: statesSource,
			title: '尺寸与状态'
		},
		{
			covers: ['composition', 'native-props'],
			component: CompositionDemo,
			description: '前后内容、自定义加载指示器和全宽布局通过Snippet与ZUI组件组合。',
			id: 'button-composition',
			source: compositionSource,
			title: '内容组合'
		},
		{
			covers: ['loading', 'resource-cleanup', 'reduced-motion'],
			component: AsyncDemo,
			description: '异步任务由调用方持有；loading提供busy语义、阻止重复操作并允许自定义内容。',
			id: 'button-async',
			source: asyncSource,
			title: '异步操作与加载'
		},
		{
			covers: ['form-data', 'form-reset', 'native-props'],
			component: FormDemo,
			description: 'ZButton默认type=button；只有显式type=submit/reset时才进入对应原生表单流程。',
			id: 'button-form',
			source: formSource,
			title: '表单按钮语义'
		},
		{
			covers: ['accessible-name', 'focus', 'keyboard'],
			component: IconDemo,
			description: '纯图标操作继续使用真实button，并用aria-label提供稳定的可访问名称。',
			id: 'button-icon-only',
			source: iconSource,
			title: '只有图标的按钮'
		}
	],
	accessibility: [
		'默认type=button，避免在表单中意外提交。',
		'loading设置aria-busy并禁用交互。',
		'保留键盘、焦点和原生button事件语义。'
	]
});
