import {
	comboboxContentMetadata,
	comboboxInputMetadata,
	comboboxItemMetadata,
	comboboxMetadata
} from '@zadmin/zui/metadata';
import AsyncDemo from './AsyncDemo.svelte';
import asyncSource from './AsyncDemo.svelte?raw';
import ControlledDemo from './ControlledDemo.svelte';
import controlledSource from './ControlledDemo.svelte?raw';
import FilterDemo from './FilterDemo.svelte';
import filterSource from './FilterDemo.svelte?raw';
import FormDemo from './FormDemo.svelte';
import formSource from './FormDemo.svelte?raw';
import OptionsDemo from './OptionsDemo.svelte';
import optionsSource from './OptionsDemo.svelte?raw';
import PreferencesDemo from './PreferencesDemo.svelte';
import preferencesSource from './PreferencesDemo.svelte?raw';
import VirtualDemo from './VirtualDemo.svelte';
import virtualSource from './VirtualDemo.svelte?raw';
import { comboboxApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const comboboxDoc = defineComponentDoc(comboboxMetadata, {
	members: [comboboxInputMetadata, comboboxContentMetadata, comboboxItemMetadata],
	profiles: ['form-control', 'collection', 'layer', 'virtualized'],
	sourceApi: comboboxApiFacts,
	teaching: {
		props: {
			loading: {
				default: 'false',
				description:
					'可与AsyncCollectionQuery组合；查询层负责AbortSignal与latest-wins，Combobox只消费显式loading/data/error状态。'
			},
			controlId: {
				default: '继承Field或自动生成',
				description: '真实输入焦点owner的id，Field label始终指向它而不是内部option。'
			},
			form: { default: '最近祖先form', description: '把FormValueBridge关联到DOM外部原生form。' },
			invalid: {
				default: '继承Field或false',
				description: '同步真实输入的aria-invalid与视觉状态。'
			},
			name: {
				default: '继承Field或—',
				description: 'FormData只提交稳定value；查询inputValue永远不泄漏为内部字段。'
			},
			placement: {
				default: "'bottom-start'",
				description: '建议listbox的Floating首选位置；Portal仍遵循Provider ownerDocument容器。'
			},
			required: {
				default: '继承Field或false',
				description: '向真实combobox输入暴露必填语义；业务值校验由Field/Form拥有。'
			}
		},
		summary:
			'生产单选Combobox：inputValue、value和open三轴独立，完整LogicalCollection在过滤与DOM挂载之外拥有顺序，ActiveDescendant只引用当前真实option。'
	},
	demos: [
		{
			component: FormDemo,
			covers: ['form-data', 'form-reset', 'focus', 'keyboard', 'uncontrolled'],
			description:
				'输入始终保留DOM焦点，选择key而不是显示文本进入FormData，reset同时恢复输入和值。',
			id: 'combobox-filter-form',
			source: formSource,
			title: 'Compound、过滤与表单'
		},
		{
			component: OptionsDemo,
			covers: ['composition', 'disabled', 'keyboard', 'variants-and-states'],
			description:
				'权威options提供分组、自定义内容和严格typed key；数字1与字符串1不会被DOM id或字符串化合并。',
			id: 'combobox-options',
			source: optionsSource,
			title: '数据源、分组与typed key'
		},
		{
			component: VirtualDemo,
			covers: ['controlled', 'focus', 'keyboard', 'resource-cleanup'],
			description:
				'无分组权威options可使用固定行VirtualList；输入保持焦点，导航目标真实挂载后才更新aria-activedescendant。',
			id: 'combobox-virtual',
			source: virtualSource,
			title: '千项过滤、虚拟化与输入焦点'
		},
		{
			component: AsyncDemo,
			covers: ['controlled', 'loading', 'locale', 'portal'],
			description:
				'shouldFilter=false接收服务端结果；AsyncCollectionQuery负责取消过期请求与latest-wins，Combobox只消费显式loading/empty/error，远程结果缺少当前key时仍保留选择与输入。',
			id: 'combobox-async',
			source: asyncSource,
			title: '远程搜索、空状态与孤儿值'
		},
		{
			component: ControlledDemo,
			covers: ['controlled', 'external-clear'],
			description: 'value、inputValue与open可分别受控；owner清空时明确同步两个值轴。',
			id: 'combobox-controlled',
			source: controlledSource,
			title: '三轴受控与外部清空'
		},
		{
			component: FilterDemo,
			covers: ['disabled', 'readonly', 'locale', 'variants-and-states'],
			description: '自定义前缀过滤、disabled与readonly仍复用同一逻辑view和active-descendant。',
			id: 'combobox-filter',
			source: filterSource,
			title: '过滤策略与交互状态'
		},
		{
			component: PreferencesDemo,
			covers: ['accessible-name', 'locale', 'rtl'],
			description:
				'嵌套Provider动态提供阿拉伯语、RTL和Collator过滤，输入焦点与垂直active导航保持稳定。',
			id: 'combobox-preferences',
			source: preferencesSource,
			title: 'Locale与RTL'
		}
	],
	accessibility: [
		'Input使用combobox、aria-autocomplete=list、expanded、controls与activedescendant；键盘移动不会把DOM焦点移出输入。',
		'aria-activedescendant只在active key对应的可见option真实挂载后出现；过滤掉或尚未虚拟挂载的项不会产生悬空id。',
		'ArrowDown/ArrowUp打开或移动；Home/End只在popup打开时接管，关闭时保留原生文本光标语义；Enter选择，Escape关闭。',
		'IME composing和legacy keyCode 229期间不接管导航或Enter；本地默认过滤使用Provider locale的Intl.Collator。',
		'options模式把分组、disabled和完整业务顺序放在DOM之外；compound Item只用于非虚拟兼容模式。',
		'同一group必须在options中连续出现，避免过滤前后的逻辑顺序与分组视觉顺序分叉。',
		'virtual只接受无group的权威options；输入仍是唯一DOM焦点owner，虚拟listbox显式可聚焦但不会被FocusScope移动焦点，真实ZComboboxItem继续拥有option/id/selection。',
		'虚拟器只拥有固定行窗口和scroll-to-key；compound、grouped、dynamic-height和sticky group虚拟化会明确拒绝，过滤后的LogicalCollection view仍是唯一导航顺序。',
		'readonly使用真实input readonly并阻止打开和选择，但保持文本可聚焦复制；disabled另行阻止焦点与FormData。',
		'name只由FormValueBridge提交value，内部ZInput明确没有name/form自重置，查询草稿不会污染FormData。',
		'受控value、inputValue和open互相独立；选择option时组件同步业务key与显示文本，外部清空时owner应明确更新需要拥有的轴。',
		'异步结果默认保留未加载的selected key与已见标签；AsyncCollectionQuery可作为无缓存、无全局store的调用方数据层，提供AbortSignal、latest-wins、loading/error/data状态；value、open、active和渲染options仍由调用方拥有。'
	],
	keywords: [
		'combobox',
		'autocomplete',
		'logical collection',
		'active descendant',
		'async',
		'remote',
		'group',
		'ime',
		'virtual list',
		'form reset'
	]
});
