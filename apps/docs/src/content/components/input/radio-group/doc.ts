import { radioGroupItemMetadata, radioGroupMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import formSource from './FormDemo.svelte?raw';
import BoundariesDemo from './BoundariesDemo.svelte';
import boundariesSource from './BoundariesDemo.svelte?raw';
import DynamicDemo from './DynamicDemo.svelte';
import dynamicSource from './DynamicDemo.svelte?raw';
import ReadonlyDemo from './ReadonlyDemo.svelte';
import readonlySource from './ReadonlyDemo.svelte?raw';
import OptionsDemo from './OptionsDemo.svelte';
import optionsSource from './OptionsDemo.svelte?raw';
import { radioGroupApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const radioGroupDoc = defineComponentDoc(radioGroupMetadata, {
	members: [radioGroupItemMetadata],
	profiles: ['form-control', 'collection'],
	sourceApi: radioGroupApiFacts,
	teaching: {
		props: {
			defaultValue: { default: 'undefined', description: 'typed非受控初值与form reset目标。' },
			form: { default: '最近祖先form', description: '把每个真实radio关联到DOM外部form。' },
			invalid: { default: '继承Field或false', description: '同步组级aria-invalid和Item视觉。' },
			loop: { default: 'true', description: '控制方向键在可用Item首尾是否循环。' },
			name: { default: '继承Field或—', description: '所有真实radio共享的FormData字段名。' },
			onValueChange: {
				default: '—',
				description: '仅可编辑状态的用户选择调用；焦点浏览、readonly、owner同步与reset不调用。'
			},
			orientation: {
				default: "'vertical'",
				description: '布局和方向键轴；horizontal结合Provider direction处理RTL。'
			},
			options: {
				default: 'undefined（compound模式）',
				description: '数据化typed key、label和disabled权威集合；不能与children同时提供。'
			},
			readonly: {
				default: '自身或Field/Form任一readonly',
				description: '保留单一Tab stop与方向键焦点浏览，但冻结选中值和FormData。'
			},
			ref: { default: 'null', description: 'role=radiogroup的HTMLDivElement引用。' },
			required: {
				default: '继承Field或false',
				description: '映射到真实radio组的原生Constraint Validation。'
			},
			value: {
				default: 'undefined',
				description: 'Svelte bindable SelectionKey；建立值后可由owner清为undefined。'
			}
		},
		summary:
			'真实radio承担FormData/required，LogicalCollection、SelectionModel与MountedElements分别承担typed选项、选择和roving焦点。'
	},
	demos: [
		{
			covers: ['controlled', 'form-data', 'native-props'],
			component: OptionsDemo,
			description: 'options模式区分数字/字符串key，并从Field继承name、required和可访问标签。',
			id: 'radio-group-options',
			source: optionsSource,
			title: 'Options、Typed key与Field'
		},
		{
			covers: ['controlled', 'form-data', 'form-reset', 'keyboard', 'uncontrolled'],
			component: FormDemo,
			description: '原生radio表单语义与Collection、单选状态和roving focus共同管理动态Item。',
			id: 'radio-group-form',
			source: formSource,
			title: '单选、键盘与表单'
		},
		{
			covers: ['controlled', 'external-clear', 'focus', 'form-data', 'keyboard'],
			component: DynamicDemo,
			description:
				'动态移除active/selected option时roving焦点恢复最近可用项；owner值不被伪造修改，并可显式清空。',
			id: 'radio-group-dynamic',
			source: dynamicSource,
			title: '动态Options与受控清空'
		},
		{
			covers: ['disabled', 'invalid', 'keyboard', 'rtl', 'variants-and-states'],
			component: BoundariesDemo,
			description: 'vertical、loop=false、invalid和disabled覆盖方向键边界与组状态。',
			id: 'radio-group-boundaries',
			source: boundariesSource,
			title: '方向与导航边界'
		},
		{
			covers: ['focus', 'form-data', 'keyboard', 'readonly'],
			component: ReadonlyDemo,
			description:
				'只读组允许方向键浏览可用radio焦点而不改变选择、回调或FormData；owner同步仍有效，并提供可编辑对照。',
			id: 'radio-group-readonly',
			source: readonlySource,
			title: '只读焦点浏览与Owner同步'
		}
	],
	accessibility: [
		'根节点使用radiogroup，Item保留真实input[type=radio]与label/FormData语义。',
		'LogicalCollection是typed顺序和disabled的唯一事实，SelectionModel single是选择唯一owner。',
		'MountedElements只登记真实radio；CollectionNavigation移动active后才执行DOM focus与可编辑选择。',
		'方向键、Home和End移动焦点并选择，disabled Item会被跳过；动态删除active后优先后继再前驱。',
		'horizontal模式遵循Provider RTL方向，Tab只进入一个可用Item。',
		'数字与字符串key在业务状态中不同；真实radio value和FormData按HTML合同序列化为字符串。',
		'options与compound children共享同一collection/navigation/selection路径，不维护第二套索引。',
		'aria-readonly设置在支持该状态的radiogroup；Item保留真实radio并通过data-readonly投射视觉状态。',
		'普通组遵循APG方向键“移动并选择”；只读组采用toolbar式focus-only浏览，Space/click/change不能改值。',
		'readonly不会设置原生disabled，因此当前radio继续参与FormData与required校验。',
		'readonly不转发Item的onclick/onkeydown/onchange或组onValueChange；owner写入与reset仍同步原生checked。',
		'required由真实同名radio执行原生Constraint Validation；业务表单应提供稳定name。'
	]
});
