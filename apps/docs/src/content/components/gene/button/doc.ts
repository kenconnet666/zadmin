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
import ToneDemo from './ToneDemo.svelte';
import toneSource from './ToneDemo.svelte?raw';
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
			loading: {
				default: 'false',
				description: '设置aria-busy、阻止重复操作，并用绝对覆盖层保持内容固有宽度。'
			},
			loadingIndicator: {
				default: 'ZSpinner',
				description: '替换默认Spinner；整个指示器容器aria-hidden，busy语义只由Button拥有。'
			},
			loadingLabel: {
				default: '—',
				description: 'loading期间覆盖按钮的可访问名称，例如“正在保存设置”。'
			},
			ref: { default: 'null', description: '真实HTMLButtonElement引用。' },
			shape: {
				default: "'default'",
				description: 'square/circle移除行内padding并让宽高跟随size，适合具名纯图标操作。'
			},
			size: { default: "'medium'", description: '统一控制高度、间距与文本尺寸。' },
			start: { default: '—', description: '在主体内容之前渲染的图标或辅助Snippet。' },
			tone: {
				default: "'default'",
				description: '有限语义色调；danger与所有variant正交组合。'
			},
			variant: {
				default: "'primary'",
				description: '只表达primary、secondary或ghost视觉强调层级。'
			}
		},
		summary:
			'保留原生button、type/form与callback语义，以正交variant/tone、size/shape和宽度稳定ZSpinner loading提供生产操作合同。'
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
			covers: ['variants-and-states'],
			component: ToneDemo,
			description: 'danger tone与primary/secondary/ghost逐一组合，替代旧variant="danger"。',
			id: 'button-tone',
			source: toneSource,
			title: '语义Tone与视觉层级'
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
			covers: ['accessible-name', 'density', 'focus', 'keyboard'],
			component: IconDemo,
			description: '纯图标操作用square把各size收敛为等宽高真实button，并用aria-label提供稳定名称。',
			id: 'button-icon-only',
			source: iconSource,
			title: '只有图标的按钮'
		}
	],
	accessibility: [
		'默认type=button，避免在表单中意外提交。',
		'loading设置aria-busy并禁用交互；正常内容以透明方式保留固有宽度和可访问名称。',
		'默认ZSpinner位于aria-hidden覆盖层，不产生嵌套status/live语义；loadingLabel可覆盖Button名称。',
		'保留键盘、焦点和原生button事件语义。',
		'auto按button.ownerDocument的系统偏好解析；full显式保留Theme过渡，reduced把过渡时长归零。'
	]
});
