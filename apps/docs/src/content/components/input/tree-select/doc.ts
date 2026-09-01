import { treeSelectMetadata } from '@zadmin/zui/metadata';
import ControlledDemo from './ControlledDemo.svelte';
import controlledSource from './ControlledDemo.svelte?raw';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import LazyVirtualDemo from './LazyVirtualDemo.svelte';
import lazyVirtualSource from './LazyVirtualDemo.svelte?raw';
import StatesDemo from './StatesDemo.svelte';
import statesSource from './StatesDemo.svelte?raw';
import { treeSelectApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const treeSelectDoc = defineComponentDoc(treeSelectMetadata, {
	profiles: ['collection', 'form-control', 'layer', 'virtualized'],
	sourceApi: treeSelectApiFacts,
	teaching: {
		props: {
			ariaLabel: {
				default: '—',
				description: '旧Tree可访问名称alias；新代码使用原生aria-label或treeLabel。'
			},
			clearLabel: { default: 'localePack.common.clear', description: '独立清空按钮的可访问名称。' },
			controlId: { default: 'Field或自动生成', description: '唯一Trigger焦点owner ID。' },
			defaultExpandedKeys: { default: '[]', description: '内部ZTree非受控展开初值。' },
			defaultOpen: { default: 'false', description: '非受控Popover初始状态。' },
			defaultValue: { default: 'null', description: '非受控选择初值；null表示明确为空。' },
			expandedKeys: { default: '[]', description: '直接交给同一个ZTree的受控或bindable展开keys。' },
			form: { default: '最近form', description: '把唯一FormValueBridge关联到外部form id。' },
			height: { default: '320', description: 'virtualized popup tree高度px。' },
			item: { default: 'node.label', description: '直接转发给ZTree的typed节点正文。' },
			itemSize: { default: '36', description: 'virtualized popup tree固定行高px。' },
			onLoadChildren: {
				default: '—',
				description: '直接复用ZTree的lazy请求、去重、abort、error和retry合同。'
			},
			onLoadError: { default: '—', description: '内部ZTree lazy失败通知。' },
			onExpandedChange: { default: '—', description: '内部ZTree展开变化。' },
			onOpenChange: {
				default: '—',
				description: 'Popover打开变化；disabled/readonly不会伪造打开。'
			},
			onValueChange: { default: '—', description: '用户选择或清空后的typed key/null。' },
			open: { default: 'false', description: '受控或bindablePopover状态。' },
			overscan: { default: '4', description: 'virtualized popup tree overscan。' },
			placeholder: {
				default: 'localePack.collection.selectNode',
				description: 'value=null时的Trigger文本。'
			},
			ref: { default: 'null', description: '组合根div；Field焦点owner是内部Trigger。' },
			treeLabel: {
				default: 'aria-label或locale pack',
				description: 'Popup ZTree的独立可访问名称。'
			},
			valueLabel: {
				default: 'node.label或String(key)',
				description: '异步orphan key仍保留可见标签策略。'
			},
			virtualized: {
				default: 'false',
				description: '让内部ZTree复用P2 ZVirtualList与active mount握手。'
			}
		},
		summary:
			'TreeSelect只拥有value/open/Field/FormValue与Popover组合；层级、expanded、active、selection、lazy和virtual全部委托同一个ZTree。'
	},
	demos: [
		{
			covers: ['form-data', 'form-reset', 'uncontrolled'],
			component: FormDemo,
			description:
				'Trigger显示typed节点标签，Popup直接复用ZTree；选择后关闭、恢复Trigger并通过唯一FormValueBridge提交key。',
			id: 'tree-select-form',
			source,
			title: '树节点选择与表单'
		},
		{
			covers: ['controlled', 'external-clear', 'keyboard'],
			component: ControlledDemo,
			description: 'value、open和expandedKeys三个owner可独立受控；null清空不会和prop未提供混淆。',
			id: 'tree-select-controlled',
			source: controlledSource,
			title: '受控状态与清空'
		},
		{
			covers: ['disabled', 'readonly', 'variants-and-states'],
			component: StatesDemo,
			description:
				'placeholder、disabled和readonly保持不同语义；readonly Trigger可聚焦但不会打开、清空或触发lazy。',
			id: 'tree-select-states',
			source: statesSource,
			title: '空值、只读与禁用'
		},
		{
			covers: ['loading', 'portal', 'resource-cleanup', 'ssr'],
			component: LazyVirtualDemo,
			description:
				'lazy branch由调用方更新nodes，Tree协调AbortSignal；一千个children通过同一个ZVirtualList窗口挂载。',
			id: 'tree-select-lazy-virtual',
			source: lazyVirtualSource,
			title: 'Lazy与Virtual Tree Select'
		}
	],
	accessibility: [
		'Trigger是Field唯一焦点owner并使用aria-haspopup=tree；Popup的ZTree是另一个明确的容器焦点owner。',
		'打开时Popover把焦点交给Tree root；选择后关闭并恢复Trigger，Escape只dismiss不改变value。',
		'disabled移除Trigger交互和FormData；readonly保持Trigger可聚焦但强制关闭Popup并禁用内部Tree安全防线。',
		'value使用typed key或null；非法number key在显示、选择或defaultValue阶段立即拒绝，合法异步orphan保持。',
		'name只由外层FormValueBridge提交一次；内部ZTree关闭reset和表单参与，避免双状态机与重复字段。'
	],
	keywords: [
		'tree select',
		'logical tree',
		'popover',
		'clear',
		'lazy children',
		'virtual tree',
		'form value'
	]
});
