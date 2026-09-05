import {
	multiSelectContentMetadata,
	multiSelectItemMetadata,
	multiSelectMetadata,
	multiSelectTriggerMetadata
} from '@zadmin/zui/metadata';
import AsyncDemo from './AsyncDemo.svelte';
import asyncSource from './AsyncDemo.svelte?raw';
import FormDemo from './FormDemo.svelte';
import formSource from './FormDemo.svelte?raw';
import OptionsDemo from './OptionsDemo.svelte';
import optionsSource from './OptionsDemo.svelte?raw';
import StatesDemo from './StatesDemo.svelte';
import statesSource from './StatesDemo.svelte?raw';
import VirtualDemo from './VirtualDemo.svelte';
import virtualSource from './VirtualDemo.svelte?raw';
import { multiSelectApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const multiSelectDoc = defineComponentDoc(multiSelectMetadata, {
	members: [multiSelectTriggerMetadata, multiSelectContentMetadata, multiSelectItemMetadata],
	profiles: ['form-control', 'collection', 'layer', 'virtualized'],
	sourceApi: multiSelectApiFacts,
	teaching: {
		props: {
			controlId: {
				default: '继承Field或自动生成',
				description: '唯一真实Trigger焦点owner的id，也是Field label与listbox命名锚点。'
			},
			form: {
				default: '最近祖先form',
				description: '把重复同名的FormValueBridge entries关联到DOM外部原生form。'
			},
			invalid: {
				default: '继承Field或false',
				description: '同步Trigger的aria-invalid与data-invalid，不混同disabled或readonly。'
			},
			name: {
				default: '继承Field或—',
				description: '每个selected key生成一个同名FormData entry，顺序与value一致。'
			},
			required: {
				default: '继承Field或false',
				description: '向Trigger暴露必填语义；空集合校验仍由Field/Form schema拥有。'
			}
		},
		summary:
			'生产多选集合：value统一数组主值命名，LogicalCollection拥有完整typed-key顺序，SelectionModel拥有toggle，ActiveDescendant拥有容器焦点，ZTag、Popover、VirtualList与FormValueBridge分别承接摘要、浮层、大数据窗口和提交。'
	},
	demos: [
		{
			component: FormDemo,
			covers: ['form-data', 'form-reset', 'keyboard', 'uncontrolled'],
			description:
				'推荐value/defaultValue API、compound Items、持久toggle、重复同名FormData与reset共享一个选择源。',
			id: 'multi-select-form',
			source: formSource,
			title: 'Compound、多值表单与reset'
		},
		{
			component: OptionsDemo,
			covers: ['composition', 'controlled', 'disabled', 'variants-and-states'],
			description:
				'权威options在DOM之外建立分组和完整顺序，数字1与字符串1严格区分；内置ZTag支持上限、溢出、移除与清空。',
			id: 'multi-select-options',
			source: optionsSource,
			title: '数据源、typed key与标签溢出'
		},
		{
			component: AsyncDemo,
			covers: ['controlled', 'loading', 'locale', 'portal'],
			description:
				'加载、空结果与结果分页由owner控制；当前selected key暂时不在结果中时保留值和最后已知标签。',
			id: 'multi-select-async-orphan',
			source: asyncSource,
			title: '异步状态与孤儿值'
		},
		{
			component: VirtualDemo,
			covers: ['external-clear', 'focus', 'keyboard', 'resource-cleanup'],
			description:
				'无分组权威options可使用固定行VirtualList；导航先ensureKey，真实option挂载后才暴露active id。',
			id: 'multi-select-virtual',
			source: virtualSource,
			title: '千项虚拟化与按key挂载'
		},
		{
			component: StatesDemo,
			covers: ['accessible-name', 'disabled', 'readonly'],
			description: '空值、原生disabled和保持可聚焦可读的readonly使用同一Trigger焦点合同。',
			id: 'multi-select-states',
			source: statesSource,
			title: '空值、禁用与只读'
		}
	],
	accessibility: [
		'Trigger是唯一aria-haspopup=listbox的原生button焦点owner；Content本身持有DOM焦点并用aria-activedescendant引用当前真实option。',
		'Option使用aria-selected且tabindex=-1；disabled Option退出pointer、键盘、typeahead与SelectionModel toggle。',
		'Arrow/Home/End只移动逻辑active key；Enter/Space toggle并保持打开；Escape由Popover关闭并恢复Trigger焦点。',
		'IME composing和legacy keyCode 229期间不接管导航、选择或tag删除；typeahead使用Provider locale的Intl.Collator。',
		'Trigger内的tag remove图标不创建第二个tab stop；指针可移除对应值，Trigger上的Backspace/Delete可访问地移除最后一个值。clearable开启Control/Command+Backspace与清空图标。',
		'maxTagCount只接受非负整数并以本地化数字显示+N；不伪造responsive测量。容器宽度驱动的responsive overflow保留给未来非button token-layout焦点模型。',
		'options是权威完整集合，group标题不进入选择或焦点顺序；同一group必须连续，compound children只用于非虚拟兼容模式。',
		'virtual只接受无group的权威options；VirtualList只拥有窗口、测量和scroll-to-key，active与selection仍由共享runtime拥有。分组、sticky header和动态行虚拟化暂不伪造。',
		'readonly保持Trigger可聚焦和值可读，以aria-disabled表达不可激活并阻止打开、toggle、tag移除、clear和用户回调；disabled另用原生disabled并阻止FormData。',
		'name通过FormValueBridge按value顺序提交重复同名entry，reset恢复defaultValue并清理selection/navigation瞬态，不触发onValueChange。',
		'异步options变化默认保留未加载selected key；valueLabel或已见标签缓存使Trigger不依赖伪造option，未知孤儿仍可由tag删除或clear。',
		'主值API统一使用value/defaultValue/onValueChange；不建立第二套主值或回调事实源。',
		'长期边界：ZSelect负责单值button/listbox；ZMultiSelect负责多值tag与重复FormData；需要自由文本查询和输入草稿时使用Combobox类输入模型，不把第二套inputValue塞进当前button焦点合同。'
	],
	keywords: [
		'multi select',
		'listbox',
		'logical collection',
		'multiple selection',
		'active descendant',
		'typed key',
		'tag overflow',
		'virtual list',
		'async orphan',
		'form reset'
	]
});
