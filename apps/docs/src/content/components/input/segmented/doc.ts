import { segmentedMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import formSource from './FormDemo.svelte?raw';
import DynamicDemo from './DynamicDemo.svelte';
import dynamicSource from './DynamicDemo.svelte?raw';
import OptionsDemo from './OptionsDemo.svelte';
import optionsSource from './OptionsDemo.svelte?raw';
import ReadonlyDemo from './ReadonlyDemo.svelte';
import readonlySource from './ReadonlyDemo.svelte?raw';
import VerticalDemo from './VerticalDemo.svelte';
import verticalSource from './VerticalDemo.svelte?raw';
import { segmentedApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
export const segmentedDoc = defineComponentDoc(segmentedMetadata, {
	profiles: ['form-control', 'collection'],
	sourceApi: segmentedApiFacts,
	teaching: {
		props: {
			defaultValue: { default: 'undefined', description: 'typed非受控初值与form reset目标。' },
			form: {
				default: '最近祖先form',
				description: '把隐藏的成功提交字段与reset owner关联到DOM外部form。'
			},
			items: {
				default: 'undefined',
				description: '兼容旧调用方的options别名；不能与options同时提供。'
			},
			invalid: { default: '继承Field或false', description: '同步aria-invalid与危险边框。' },
			loop: { default: 'true', description: '控制方向键在首尾是否循环。' },
			name: { default: '继承Field或—', description: 'FormValueBridge成功值字段名。' },
			onchange: {
				default: '—',
				description: '仅真实用户改变选择时转发原始pointer或keyboard事件。'
			},
			onValueChange: {
				default: '—',
				description: '仅可编辑状态的用户选择调用；焦点浏览、readonly、owner同步与reset不调用。'
			},
			orientation: {
				default: "'horizontal'",
				description: '视觉与方向键轴；horizontal结合Provider direction处理RTL。'
			},
			options: {
				default: '必填（或兼容items）',
				description: '完整typed key、label与disabled权威集合，支持动态替换。'
			},
			readonly: {
				default: '自身或Field/Form任一readonly',
				description: '允许在segment间浏览焦点，同时冻结选择与隐藏FormData值。'
			},
			ref: { default: 'null', description: 'role=radiogroup的HTMLDivElement引用。' },
			required: {
				default: '继承Field或false',
				description: '同步radiogroup aria-required；业务阻断由ZForm schema拥有。'
			},
			value: {
				default: 'undefined',
				description: 'Svelte bindable SelectionKey；建立值后可由owner清为undefined。'
			}
		},
		summary:
			'LogicalCollection、SelectionModel、MountedElements和FormValueBridge分别拥有typed options、选择、roving焦点与表单值的Segmented。'
	},
	demos: [
		{
			covers: ['controlled', 'form-data', 'native-props'],
			component: OptionsDemo,
			description: 'options区分数字与字符串key，并从Field继承name、required和可访问语义。',
			id: 'segmented-options',
			source: optionsSource,
			title: 'Options、Typed key与Field'
		},
		{
			covers: ['controlled', 'form-data', 'form-reset', 'keyboard', 'uncontrolled'],
			component: FormDemo,
			description: '紧凑视觉保持radiogroup/radio语义、单一Tab stop、方向键选择和隐藏表单值。',
			id: 'segmented-form',
			source: formSource,
			title: '单选周期'
		},
		{
			covers: ['controlled', 'external-clear', 'focus', 'form-data', 'keyboard'],
			component: DynamicDemo,
			description:
				'动态删除option后焦点恢复最近可用项，业务孤儿值由owner保留；显式清空同步移除FormValue。',
			id: 'segmented-dynamic',
			source: dynamicSource,
			title: '动态Options与受控清空'
		},
		{
			covers: ['disabled', 'keyboard', 'rtl', 'variants-and-states'],
			component: VerticalDemo,
			description: '垂直方向切换键盘轴，禁用组阻止选择与提交。',
			id: 'segmented-vertical',
			source: verticalSource,
			title: '垂直与禁用状态'
		},
		{
			covers: ['focus', 'form-data', 'keyboard', 'readonly'],
			component: ReadonlyDemo,
			description: '只读状态保持radiogroup焦点浏览和隐藏成功值，抑制选择回调，并提供可编辑对照。',
			id: 'segmented-readonly',
			source: readonlySource,
			title: '只读焦点浏览与可编辑对照'
		}
	],
	accessibility: [
		'Root使用radiogroup，segment按钮使用radio与aria-checked。',
		'LogicalCollection拥有typed顺序和disabled，SelectionModel single拥有选择，MountedElements仅登记真实button。',
		'方向键按orientation和RTL选择并移动焦点，disabled segment跳过；动态删除active后优先后继再前驱。',
		'FormValueBridge只在有name和值时提交，disabled移除成功值，reset恢复defaultValue且不触发用户回调。',
		'业务孤儿值在动态options更新时保留并继续提交；只有owner显式清空才移除FormValue。',
		'required投射aria-required并进入Field/ZForm语义；隐藏FormValue不伪装原生Constraint Validation owner。',
		'aria-readonly设置在radiogroup；每个segment通过data-readonly呈现但不会被disabled。',
		'只读方向键按orientation和RTL移动roving focus，不改变aria-checked、FormData或onValueChange。',
		'pointer、Enter和Space仍可把焦点放到segment，但select防线冻结业务值；owner写入与reset照常生效。'
	]
});
