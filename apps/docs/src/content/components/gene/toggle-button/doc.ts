import { toggleButtonMetadata } from '@zadmin/zui/metadata';
import InteractiveDemo from './InteractiveDemo.svelte';
import interactiveSource from './InteractiveDemo.svelte?raw';
import IconOnlyDemo from './IconOnlyDemo.svelte';
import iconOnlySource from './IconOnlyDemo.svelte?raw';
import OwnerDemo from './OwnerDemo.svelte';
import ownerSource from './OwnerDemo.svelte?raw';
import SizesDemo from './SizesDemo.svelte';
import sizesSource from './SizesDemo.svelte?raw';
import VisualDemo from './VisualDemo.svelte';
import visualSource from './VisualDemo.svelte?raw';
import { toggleButtonApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const toggleButtonDoc = defineComponentDoc(toggleButtonMetadata, {
	profiles: ['primitive', 'animated'],
	sourceApi: toggleButtonApiFacts,
	teaching: {
		props: {
			defaultPressed: { default: 'false', description: '非受控初始状态，仅在初始化时读取。' },
			disabled: { default: 'false', description: '使用原生disabled并阻止click与pressed写入。' },
			fullWidth: { default: 'false', description: '复用Button的整行布局。' },
			pressed: { default: 'false', description: '当前双态owner，并映射为原生aria-pressed。' },
			ref: { default: 'null', description: '真实HTMLButtonElement引用。' },
			shape: {
				default: "'default'",
				description: '复用Button default/square/circle；图标按钮必须具名。'
			},
			size: { default: 'Provider density', description: '复用Button控制高度和内容间距。' },
			tone: { default: "'default'", description: '复用Button有限语义tone。' },
			variant: {
				default: "'secondary'",
				description: '复用Button视觉层级；pressed由同一recipe增加选中表现。'
			}
		},
		summary:
			'只拥有pressed/defaultPressed/onPressedChange状态，复用Button原生语义与variant、tone、size、shape视觉合同的独立双态操作。'
	},
	demos: [
		{
			covers: ['controlled', 'disabled', 'keyboard', 'uncontrolled'],
			component: InteractiveDemo,
			description: '受控绑定、非受控默认值与回调保持同一个aria-pressed合同。',
			id: 'toggle-button-interactive',
			source: interactiveSource,
			title: '按下状态'
		},
		{
			covers: ['density', 'disabled', 'native-props', 'variants-and-states'],
			component: SizesDemo,
			description: '尺寸、start图标、fullWidth和disabled保持正交。',
			id: 'toggle-button-sizes',
			source: sizesSource,
			title: '尺寸与布局状态'
		},
		{
			covers: ['variants-and-states'],
			component: VisualDemo,
			description: 'pressed状态复用Button的variant/tone矩阵，不建立Toggle专属颜色枚举。',
			id: 'toggle-button-visual',
			source: visualSource,
			title: '视觉层级与Tone'
		},
		{
			covers: ['accessible-name', 'focus', 'keyboard'],
			component: IconOnlyDemo,
			description: 'Lucide图标配合square/circle和aria-label形成真实具名ToggleButton。',
			id: 'toggle-button-icon-only',
			source: iconOnlySource,
			title: '只有图标的切换按钮'
		},
		{
			covers: ['controlled', 'external-clear'],
			component: OwnerDemo,
			description: '外部owner可随时写入true/false，且不会伪造用户onPressedChange。',
			id: 'toggle-button-owner',
			source: ownerSource,
			title: '动态Owner同步'
		}
	],
	accessibility: [
		'使用真实button并通过aria-pressed公开双态语义。',
		'Enter和Space沿用原生button激活行为。',
		'disabled使用原生属性并停止点击与状态变化。',
		'variant、tone、size、shape完全复用Button；pressed只增加aria-pressed与选中视觉。',
		'square/circle纯图标Toggle必须提供aria-label，title不能替代可访问名称。'
	]
});
