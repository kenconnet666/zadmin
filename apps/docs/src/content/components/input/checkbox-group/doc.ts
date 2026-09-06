import {
	checkboxGroupItemMetadata,
	checkboxGroupMetadata,
	checkboxGroupSelectAllMetadata
} from '@zadmin/zui/metadata';
import { checkboxGroupApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
import FormSizingDemo from './FormSizingDemo.svelte';
import formSizingSource from './FormSizingDemo.svelte?raw';
import LimitsDemo from './LimitsDemo.svelte';
import limitsSource from './LimitsDemo.svelte?raw';
import OptionsDemo from './OptionsDemo.svelte';
import optionsSource from './OptionsDemo.svelte?raw';
import SelectAllDemo from './SelectAllDemo.svelte';
import selectAllSource from './SelectAllDemo.svelte?raw';

export const checkboxGroupDoc = defineComponentDoc(checkboxGroupMetadata, {
	members: [checkboxGroupItemMetadata, checkboxGroupSelectAllMetadata],
	profiles: ['form-control', 'collection'],
	sourceApi: checkboxGroupApiFacts,
	teaching: {
		props: {
			defaultValue: { default: '[]', description: '非受控typed选择与form reset基线。' },
			maxSelected: { default: 'undefined', description: '达到上限后阻止新增选择，但允许取消。' },
			minSelected: { default: '0', description: '取消时保留的最小选择数。' },
			options: { default: '与children二选一', description: '数据化typed选项集合。' },
			preserveUnknownValues: {
				default: 'false',
				description: '移除选项时是否保留暂未挂载的typed值。'
			},
			required: {
				default: 'false',
				description: '把有效最小值提升到至少1，并使用组级原生validity。'
			},
			value: {
				default: 'undefined',
				description: '按集合顺序输出的完整readonly SelectionKey数组。'
			},
			validationMessage: {
				default: 'localePack.common.selectionRange',
				description: 'min>1或外部值超过max时写入第一个可用input的customValidity。'
			}
		},
		summary: '真实ZCheckbox形成重复FormData，typed多选、组约束与mixed全选共享同一selection。'
	},
	demos: [
		{
			component: OptionsDemo,
			covers: ['accessible-name', 'basic-render', 'controlled', 'native-props'],
			description: 'options模式保留数字与字符串typed identity，Field提供组名与表单name。',
			id: 'checkbox-group-options',
			source: optionsSource,
			title: 'Typed Options与Field'
		},
		{
			component: LimitsDemo,
			covers: ['controlled', 'invalid', 'keyboard', 'variants-and-states'],
			description: 'required、minSelected和maxSelected约束完整readonly选择数组。',
			id: 'checkbox-group-limits',
			source: limitsSource,
			title: 'Required与选择数量边界'
		},
		{
			component: SelectAllDemo,
			covers: ['composition', 'disabled', 'keyboard', 'variants-and-states'],
			description:
				'compound Item用可见label命名；SelectAll按真实:disabled排除项，在当前max容量内以mixed表达部分选择。',
			id: 'checkbox-group-select-all',
			source: selectAllSource,
			title: 'Compound与Mixed全选'
		},
		{
			component: FormSizingDemo,
			covers: ['density', 'disabled', 'form-data', 'form-reset', 'readonly'],
			description: 'readonly组保留重复FormData并可reset；五档size/tone提供禁用对照。',
			id: 'checkbox-group-form-sizing',
			source: formSizingSource,
			title: 'FormData、Reset与五档尺寸'
		}
	],
	accessibility: [
		'Field或显式aria-label/aria-labelledby命名整个group；每个Item仍由children原生label或aria-label分别命名。',
		'每项保留真实checkbox与普通Tab顺序，Space切换当前项；组不引入radio式roving focus。',
		'required和minSelected使用第一个可用input的组级validity，不会错误要求每一项都选中。',
		'maxSelected达到后只阻止新增选择，已选项保持可取消且不会被伪装成disabled。',
		'SelectAll不带name且不进入FormData；它按真实:disabled排除项，checked表示已达到当前max允许容量，partial为mixed。',
		'所有已选且successful的Item以同名真实checkbox形成有序重复FormData；readonly保留，disabled排除。',
		'options和compound模式共享typed集合与selection；preserveUnknownValues显式控制移除项值。'
	]
});
