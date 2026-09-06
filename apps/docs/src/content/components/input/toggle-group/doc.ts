import { toggleGroupMetadata } from '@zadmin/zui/metadata';
import SingleDemo from './SingleDemo.svelte';
import singleSource from './SingleDemo.svelte?raw';
import MultipleDemo from './MultipleDemo.svelte';
import multipleSource from './MultipleDemo.svelte?raw';
import VisualDemo from './VisualDemo.svelte';
import visualSource from './VisualDemo.svelte?raw';
import KeyboardDemo from './KeyboardDemo.svelte';
import keyboardSource from './KeyboardDemo.svelte?raw';
import { toggleGroupApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const toggleGroupDoc = defineComponentDoc(toggleGroupMetadata, {
	profiles: ['form-control', 'collection'],
	sourceApi: toggleGroupApiFacts,
	teaching: {
		props: {
			allowEmpty: {
				default: 'true',
				description: 'false阻止用户清除最后一个已选项，不会自动创建默认值。'
			},
			items: { default: '必填', description: '稳定typed value、label和disabled项目。' },
			orientation: {
				default: "'horizontal'",
				description: '视觉与方向键轴，RTL由Provider direction处理。'
			},
			roving: {
				default: 'true',
				description: 'true为单一Tab stop；false保留每个可用button的原生Tab入口。'
			},
			selectionMode: { default: "'single'", description: 'single或multiple，value始终是数组。' },
			value: {
				default: 'undefined',
				description: 'bindable readonly typed key数组；focus本身不改变它。'
			}
		},
		summary:
			'用真实button与aria-pressed表达单/多选切换，不使用radiogroup语义；焦点导航与选择状态保持正交。'
	},
	demos: [
		{
			component: SingleDemo,
			covers: ['controlled', 'focus', 'keyboard', 'variants-and-states'],
			description: 'single模式始终绑定数组value；切换allowEmpty后观察最后一个选项是否允许清除。',
			id: 'toggle-group-single-empty',
			source: singleSource,
			title: '单选、空值与数组 value'
		},
		{
			component: MultipleDemo,
			covers: ['form-data', 'form-reset', 'native-props', 'variants-and-states'],
			description:
				'multiple模式同时展示数字1与字符串"1"是不同typed key，并通过原生FormData和reset验证。',
			id: 'toggle-group-multiple-form',
			source: multipleSource,
			title: '多选、typed key与原生表单'
		},
		{
			component: VisualDemo,
			covers: ['basic-render', 'composition', 'variants-and-states'],
			description:
				'五档size、semantic tone和variant组合使用真实按钮的data-state与aria-pressed变化。',
			id: 'toggle-group-visual-states',
			source: visualSource,
			title: '五档视觉与按下状态'
		},
		{
			component: KeyboardDemo,
			covers: ['disabled', 'keyboard', 'readonly', 'rtl'],
			description: '垂直RTL roving、readonly浏览、disabled项目与roving=false原生Tab入口并列验证。',
			id: 'toggle-group-keyboard-boundaries',
			source: keyboardSource,
			title: '键盘、RTL与焦点模式'
		}
	],
	accessibility: [
		'每项是原生button并使用aria-pressed；组件不伪装radiogroup，RadioGroup/Segmented的radio语义保持独立。',
		'roving=true时只有当前可用项进入Tab顺序，方向键/Home/End移动焦点但不会选择；Enter/Space由button激活选择。',
		'roving=false时组件不接管方向键，每个可用button保留原生Tab入口，适合由外层Toolbar等owner协调。',
		'allowEmpty=false只阻止用户清除最后一个值，不从空defaultValue推导或创建默认选择。',
		'FormValueBridge按name输出重复成功字段；disabled移除字段，reset恢复defaultValue且不伪造用户change。'
	]
});
