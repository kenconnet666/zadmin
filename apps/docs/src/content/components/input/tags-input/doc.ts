import { tagsInputMetadata } from '@zadmin/zui/metadata';
import { tagsInputApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
import ConstraintsDemo from './ConstraintsDemo.svelte';
import constraintsSource from './ConstraintsDemo.svelte?raw';
import DraftDemo from './DraftDemo.svelte';
import draftSource from './DraftDemo.svelte?raw';
import EditingDemo from './EditingDemo.svelte';
import editingSource from './EditingDemo.svelte?raw';
import FieldDemo from './FieldDemo.svelte';
import fieldSource from './FieldDemo.svelte?raw';
import FormDemo from './FormDemo.svelte';
import formSource from './FormDemo.svelte?raw';
import OverflowDemo from './OverflowDemo.svelte';
import overflowSource from './OverflowDemo.svelte?raw';

export const tagsInputDoc = defineComponentDoc(tagsInputMetadata, {
	profiles: ['collection', 'data-view', 'form-control'],
	sourceApi: tagsInputApiFacts,
	teaching: {
		props: {
			addLabel: {
				default: 'localePack.tagsInput.addTag',
				description: '草稿input和无Field时group的可访问名称。'
			},
			controlId: {
				default: 'Field controlId或生成ID',
				description: '真实草稿input ID，也是Field label的focus owner。'
			},
			editLabel: {
				default: 'localePack.tagsInput.editTag(value)',
				description: '每个标签编辑操作和编辑input的本地化名称。'
			},
			form: {
				default: '最近祖先form',
				description: '把唯一FormValueBridge关联到外部form；草稿和编辑input不会提交。'
			},
			inputRef: {
				default: 'null',
				description: '真实草稿input引用，用于聚焦、选择或宿主集成。'
			},
			invalid: {
				default: 'Field context或false',
				description: '与新增/编辑校验失败合并到边框、input aria-invalid和data-invalid。'
			},
			overflowLabel: {
				default: 'omitted => `+${omitted.length}`',
				description: '未聚焦时被maxVisibleTags折叠的业务标签摘要。'
			},
			placeholder: {
				default: 'localePack.tagsInput.addTag',
				description: '草稿为空时的视觉提示，不能替代addLabel。'
			},
			removeLabel: {
				default: 'localePack.tagsInput.removeTag(value)',
				description: '传给真实ZTag remove按钮的本地化名称。'
			},
			required: {
				default: 'Field context或false',
				description: '投射到草稿input aria-required；业务提交阻断由ZForm schema拥有。'
			},
			size: {
				default: 'Field size，其次为Provider density',
				description: '统一root padding和草稿字号。'
			}
		},
		summary:
			'生产级string-only TagsInput：独立values/draft owner、ZTag复用、方向键标签焦点、批量粘贴、可选编辑、视觉overflow与多值FormValueBridge保持正交。'
	},
	demos: [
		{
			component: FormDemo,
			covers: ['form-data', 'form-reset', 'keyboard', 'uncontrolled'],
			description: 'Enter、逗号、粘贴和空草稿Backspace共享去重、校验、上限与单次回调合同。',
			id: 'tags-input-form',
			source: formSource,
			title: '编辑、粘贴与表单'
		},
		{
			component: ConstraintsDemo,
			covers: ['disabled', 'invalid', 'readonly', 'variants-and-states'],
			description: '多分隔符、数量上限、校验、自定义Tag与只读/禁用状态保持独立。',
			id: 'tags-input-constraints',
			source: constraintsSource,
			title: '约束、自定义正文与状态'
		},
		{
			component: DraftDemo,
			covers: ['controlled', 'external-clear', 'focus', 'variants-and-states'],
			description: '受控草稿、重复值和commitOnBlur分别表达自动提交与保留草稿的所有权。',
			id: 'tags-input-draft-ownership',
			source: draftSource,
			title: '草稿、重复值与失焦'
		},
		{
			component: EditingDemo,
			covers: ['controlled', 'focus', 'keyboard', 'variants-and-states'],
			description:
				'编辑使用同一transform、validate和duplicate合同；方向键进入标签后Enter提供完整键盘入口。',
			id: 'tags-input-editing',
			source: editingSource,
			title: '标签编辑与规范化'
		},
		{
			component: OverflowDemo,
			covers: ['focus', 'keyboard', 'resource-cleanup', 'ssr'],
			description:
				'maxVisibleTags只折叠未聚焦的视觉ZTag；聚焦时恢复全部管理操作，业务值和FormData不丢失。',
			id: 'tags-input-overflow',
			source: overflowSource,
			title: '大量标签与Overflow'
		},
		{
			component: FieldDemo,
			covers: ['focus', 'form-data', 'form-reset', 'invalid', 'native-props'],
			description:
				'Field拥有label/name/required/invalid/size；DOM外部控件通过统一FormValueBridge关联外部form。',
			id: 'tags-input-field',
			source: fieldSource,
			title: 'Field与外部Form Owner'
		}
	],
	accessibility: [
		'Root是命名group，草稿input是唯一Tab入口；空草稿上的逻辑前方向键进入最后标签，标签操作间支持方向键和Home/End。',
		'每个可见标签复用ZTag及本地化remove按钮；editable模式额外提供命名编辑按钮，Enter进入、Escape退出。',
		'IME composing期间不提交；空草稿Backspace删除最后标签，粘贴批量操作只触发一次values更新。',
		'maxVisibleTags只在组件失焦时折叠视觉内容；聚焦后恢复全部操作，避免overflow让键盘用户无法管理隐藏标签。',
		'每个标签通过FormValueBridge重复提交同名字段，reset同时恢复values、清空草稿并退出编辑。',
		'标签值保持string-only，因为它们由文本创建、编辑、transform和paste产生；需要typed option selection时使用MultiSelect而不是扩张此状态机。',
		'Autocomplete建议、远程选项和free-solo选择属于Combobox/MultiSelect组合，不塞入TagsInput。'
	],
	keywords: [
		'tags input',
		'tag group',
		'draft ownership',
		'paste',
		'IME',
		'editable tag',
		'overflow',
		'form values'
	]
});
