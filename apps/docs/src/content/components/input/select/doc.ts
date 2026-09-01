import {
	selectContentMetadata,
	selectItemMetadata,
	selectMetadata,
	selectTriggerMetadata
} from '@zadmin/zui/metadata';
import AsyncDemo from './AsyncDemo.svelte';
import asyncSource from './AsyncDemo.svelte?raw';
import ControlledDemo from './ControlledDemo.svelte';
import controlledSource from './ControlledDemo.svelte?raw';
import FormDemo from './FormDemo.svelte';
import formSource from './FormDemo.svelte?raw';
import OptionsDemo from './OptionsDemo.svelte';
import optionsSource from './OptionsDemo.svelte?raw';
import PreferencesDemo from './PreferencesDemo.svelte';
import preferencesSource from './PreferencesDemo.svelte?raw';
import StatesDemo from './StatesDemo.svelte';
import statesSource from './StatesDemo.svelte?raw';
import VirtualDemo from './VirtualDemo.svelte';
import virtualSource from './VirtualDemo.svelte?raw';
import { selectApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const selectDoc = defineComponentDoc(selectMetadata, {
	members: [selectTriggerMetadata, selectContentMetadata, selectItemMetadata],
	profiles: ['form-control', 'collection', 'layer', 'virtualized'],
	sourceApi: selectApiFacts,
	teaching: {
		props: {
			controlId: {
				default: '继承Field或自动生成',
				description: '真实Trigger焦点owner的id，也是Field label和listbox命名的稳定锚点。'
			},
			form: { default: '最近祖先form', description: '把FormValueBridge关联到DOM外部原生form。' },
			invalid: {
				default: '继承Field或false',
				description: '同步Trigger的aria-invalid与data-invalid，不混同disabled。'
			},
			name: { default: '继承Field或—', description: '提交typed key的FormData字段名。' },
			required: {
				default: '继承Field或false',
				description: '向Trigger暴露必填语义；业务校验仍由Field/Form schema统一拥有。'
			}
		},
		summary:
			'生产单选集合：options模式在未挂载时仍拥有完整typed-key顺序，compound模式保持兼容；SelectionModel、ActiveDescendant、Popover与FormValueBridge分别拥有选择、焦点、浮层和提交。'
	},
	demos: [
		{
			component: FormDemo,
			covers: ['form-data', 'form-reset', 'keyboard', 'uncontrolled'],
			description: '单选值、逻辑键盘、Popover、隐藏表单值与reset保持同一状态源。',
			id: 'select-form',
			source: formSource,
			title: 'Compound、键盘与表单'
		},
		{
			component: OptionsDemo,
			covers: ['composition', 'disabled', 'keyboard', 'variants-and-states'],
			description:
				'权威options在DOM之外建立完整集合，分组、禁用、自定义内容以及数字1与字符串1保持严格身份。',
			id: 'select-options',
			source: optionsSource,
			title: '数据源、分组与typed key'
		},
		{
			component: VirtualDemo,
			covers: ['controlled', 'focus', 'keyboard', 'resource-cleanup'],
			description:
				'无分组权威options可使用固定行VirtualList；导航先ensureKey，真实option挂载后才暴露active id。',
			id: 'select-virtual',
			source: virtualSource,
			title: '千项虚拟化与按key挂载'
		},
		{
			component: AsyncDemo,
			covers: ['controlled', 'loading', 'locale', 'portal'],
			description: '加载、空结果和远程结果替换由owner控制；当前key暂时不在结果中时保留值与标签。',
			id: 'select-async-orphan',
			source: asyncSource,
			title: '异步状态与孤儿值'
		},
		{
			component: ControlledDemo,
			covers: ['controlled', 'external-clear'],
			description: '外部状态独立拥有open和value，并能把value清回undefined而不伪造用户回调。',
			id: 'select-controlled-label',
			source: controlledSource,
			title: '受控打开、值标签与清空'
		},
		{
			component: StatesDemo,
			covers: ['disabled', 'readonly', 'variants-and-states'],
			description: '自定义Trigger、定位、可取消onSelect、disabled与readonly保持正交。',
			id: 'select-states',
			source: statesSource,
			title: '自定义Trigger与交互状态'
		},
		{
			component: PreferencesDemo,
			covers: ['accessible-name', 'locale', 'rtl'],
			description:
				'嵌套Provider动态提供阿拉伯语、RTL与本地化默认文案，逻辑垂直导航和start定位不反向。',
			id: 'select-preferences',
			source: preferencesSource,
			title: 'Locale与RTL'
		}
	],
	accessibility: [
		'Trigger是aria-haspopup=listbox的原生button；Content本身是唯一DOM焦点owner并通过aria-activedescendant引用当前真实挂载option。',
		'Option使用aria-selected且tabindex=-1；disabled Option同时退出pointer、键盘与typeahead。',
		'Arrow/Home/End只移动逻辑active key；Enter/Space选择；Escape由Popover关闭并恢复Trigger焦点。',
		'IME composing和legacy keyCode 229期间不接管导航或选择，typeahead使用Provider locale的Collator。',
		'options是权威完整集合，group标题不进入选择或焦点顺序；compound children只用于非虚拟兼容模式。',
		'同一group必须在options中连续出现，避免逻辑导航顺序与分组后的视觉DOM顺序分叉。',
		'virtual只接受无group的权威options；ZVirtualList是可聚焦listbox owner，wrapper使用presentation，真实ZSelectItem继续拥有option/id/selection语义。',
		'虚拟器只拥有固定行窗口和scroll-to-key；compound、grouped、dynamic-height和sticky group虚拟化会明确拒绝，不建立第二套active或selection状态。',
		'readonly保持Trigger可聚焦和值可读，以aria-disabled表达不可激活并阻止打开、选择与用户回调；disabled另行使用原生disabled且阻止表单提交。',
		'name通过FormValueBridge提交业务key，reset恢复defaultValue且不触发onValueChange。',
		'异步options变化默认保留当前未加载key，valueLabel或已见标签缓存保证Trigger不依赖伪造option。'
	],
	keywords: [
		'select',
		'listbox',
		'logical collection',
		'active descendant',
		'typed key',
		'async',
		'group',
		'virtual list',
		'form reset'
	]
});
