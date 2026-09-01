import {
	tabsListMetadata,
	tabsMetadata,
	tabsPanelMetadata,
	tabsTriggerMetadata
} from '@zadmin/zui/metadata';
import { tabsApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
import ControlledDemo from './ControlledDemo.svelte';
import controlledSource from './ControlledDemo.svelte?raw';
import DynamicDemo from './DynamicDemo.svelte';
import dynamicSource from './DynamicDemo.svelte?raw';
import InteractiveDemo from './InteractiveDemo.svelte';
import interactiveSource from './InteractiveDemo.svelte?raw';
import ManualDemo from './ManualDemo.svelte';
import manualSource from './ManualDemo.svelte?raw';
import MountingDemo from './MountingDemo.svelte';
import mountingSource from './MountingDemo.svelte?raw';
import RtlDemo from './RtlDemo.svelte';
import rtlSource from './RtlDemo.svelte?raw';

export const tabsDoc = defineComponentDoc(tabsMetadata, {
	members: [tabsListMetadata, tabsTriggerMetadata, tabsPanelMetadata],
	profiles: ['collection'],
	sourceApi: tabsApiFacts,
	teaching: {
		props: {
			activationMode: {
				default: "'automatic'",
				description: 'automatic让focus同步selection；manual只移动active，Enter/Space再激活。'
			},
			activeValue: {
				default: 'selected key或第一enabled key',
				description: '独立roving active owner；manual模式可与value不同。'
			},
			defaultActiveValue: { default: 'null', description: '非受控初始active typed key。' },
			defaultValue: {
				default: 'null',
				description: '非受控初始selection；null保留显式无Panel状态。'
			},
			disabled: { default: 'false', description: '禁用所有Trigger，但保留当前Panel内容。' },
			loop: { default: 'true', description: '方向键到Collection边界时是否循环。' },
			onActiveValueChange: {
				default: 'undefined',
				description: '用户active变化时调用；collection动态恢复不调用。'
			},
			onValueChange: {
				default: 'undefined',
				description: '用户激活新typed key时调用；owner null和动态恢复不调用。'
			},
			orientation: {
				default: "'horizontal'",
				description: 'TabList布局和CollectionNavigation键盘轴。'
			},
			panelMount: {
				default: "'keep-mounted'",
				description: '默认预加载并隐藏；lazy访问后保留；active-only切换即卸载。'
			},
			value: {
				default: 'null',
				description: '当前typed selection；number 1与string 1严格区分，null是显式无选择。'
			}
		},
		summary:
			'生产Tabs compound collection：LogicalCollection/MountedElements/CollectionNavigation分离逻辑顺序、DOM和active焦点；nullable typed selection支持automatic/manual、动态nearest恢复、RTL/IME和明确Panel挂载策略。'
	},
	demos: [
		{
			component: InteractiveDemo,
			covers: ['basic-render', 'controlled', 'focus', 'keyboard', 'uncontrolled'],
			description:
				'automatic焦点同步选择，disabled跳过，默认keep-mounted保证箭头激活没有加载延迟。',
			id: 'tabs-automatic',
			source: interactiveSource,
			title: 'Automatic Tabs与预挂载Panel'
		},
		{
			component: ManualDemo,
			covers: ['focus', 'keyboard', 'variants-and-states'],
			description: '垂直manual轴中方向键只改变active；Enter/Space或click才提交selection。',
			id: 'tabs-manual',
			source: manualSource,
			title: 'Manual激活的垂直Tabs'
		},
		{
			component: ControlledDemo,
			covers: ['controlled', 'external-clear', 'native-props'],
			description:
				'number 1/string 1、独立active/value owner和显式null验证typed identity与受控同步。',
			id: 'tabs-controlled-typed',
			source: controlledSource,
			title: 'Typed key、双owner与null'
		},
		{
			component: DynamicDemo,
			covers: ['controlled', 'focus', 'resource-cleanup'],
			description:
				'动态删除selected/active和重排时优先恢复原位置之后的enabled Tab，不伪造用户回调。',
			id: 'tabs-dynamic',
			source: dynamicSource,
			title: '动态集合与Nearest恢复'
		},
		{
			component: MountingDemo,
			covers: ['composition', 'resource-cleanup', 'ssr'],
			description: 'keep-mounted、lazy与active-only明确展示初始成本、状态保留和卸载取舍。',
			id: 'tabs-mounting',
			source: mountingSource,
			title: 'Panel挂载与状态策略'
		},
		{
			component: RtlDemo,
			covers: ['accessible-name', 'keyboard', 'locale', 'rtl'],
			description: 'ar-EG/RTL水平Tabs反转逻辑左右键；manual selection继续与active焦点分离。',
			id: 'tabs-rtl',
			source: rtlSource,
			title: 'Locale、RTL与逻辑方向键'
		}
	],
	accessibility: [
		'ZTabsList、Trigger和Panel分别使用tablist、tab和tabpanel，opaque SSR稳定ID建立aria-controls/labelledby双向关系。',
		'Arrow按orientation移动enabled active key；水平RTL反转左右；Home/End移动首尾；IME composing/keyCode 229完全放行。',
		'automatic只适用于无需明显等待的Panel，因此默认keep-mounted；异步或重内容应选择manual或明确的lazy/active-only策略。',
		'动态删除/禁用selected或active Tab时优先选择旧位置之后的enabled key，再选择之前；collection恢复不触发onValueChange。',
		'keep-mounted保留全部Panel DOM与本地状态；lazy只在首次访问前不挂载；active-only每次切换卸载非active Panel。',
		'Panel默认tabindex=0，若Panel首个有意义内容已可聚焦，可显式传tabindex=-1避免额外Tab停靠点。'
	],
	keywords: [
		'tabs',
		'logical collection',
		'typed key',
		'manual activation',
		'panel lifecycle',
		'rtl'
	]
});
