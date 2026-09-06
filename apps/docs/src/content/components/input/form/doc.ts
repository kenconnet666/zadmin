import SizingDemo from './SizingDemo.svelte';
import sizingSource from './SizingDemo.svelte?raw';
import BusyDemo from './BusyDemo.svelte';
import busySource from './BusyDemo.svelte?raw';
import ControllerDemo from './ControllerDemo.svelte';
import controllerSource from './ControllerDemo.svelte?raw';
import FieldGraphDemo from './FieldGraphDemo.svelte';
import fieldGraphSource from './FieldGraphDemo.svelte?raw';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import NativeDemo from './NativeDemo.svelte';
import nativeSource from './NativeDemo.svelte?raw';
import NativeValuesDemo from './NativeValuesDemo.svelte';
import nativeValuesSource from './NativeValuesDemo.svelte?raw';
import ModelDemo from './ModelDemo.svelte';
import modelSource from './ModelDemo.svelte?raw';
import ListDemo from './ListDemo.svelte';
import listSource from './ListDemo.svelte?raw';
import NestedListDemo from './NestedListDemo.svelte';
import nestedListSource from './NestedListDemo.svelte?raw';
import AdaptersDemo from './AdaptersDemo.svelte';
import adaptersSource from './AdaptersDemo.svelte?raw';
import CollectionAdaptersDemo from './CollectionAdaptersDemo.svelte';
import collectionAdaptersSource from './CollectionAdaptersDemo.svelte?raw';
import {
	formApiFacts,
	formFieldApiFacts,
	formListApiFacts
} from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
import { formFieldMetadata, formListMetadata, formMetadata } from '@zadmin/zui/metadata';

export const formDoc = defineComponentDoc(formMetadata, {
	members: [formFieldMetadata, formListMetadata],
	memberApis: [formFieldApiFacts, formListApiFacts],
	profiles: ['form-control'],
	sourceApi: formApiFacts,
	teaching: {
		props: {
			controller: {
				default: '—',
				description:
					'公开为ZFormController<TOutput, TValues>。模型模式可读写、initialize并精确reset字段；native模式只读当前successful controls。getState/subscribeState提供不可变聚合状态快照。'
			},
			onreset: {
				default: '—',
				description: '原生reset事件阶段同步回调；可调用event.preventDefault()阻止字段状态和值复位。'
			},
			onsubmit: {
				default: '—',
				description: '原生submit回调；可调用preventDefault取消语义提交。'
			}
		},
		summary:
			'ZForm可注入唯一FormModel，由ZFormField把字段路径提供给适配控件自动读写；Standard Schema消费模型输入并产生typed output，原生FormData仍独立遵守successful controls规则。FieldPath图统一拥有依赖验证、错误分层、竞态和首错导航。'
	},
	demos: [
		{
			component: SizingDemo,
			covers: ['composition', 'variants-and-states'],
			description:
				'五档尺寸按组件用途同步文字、留白和内部控件；Field/Form 显式尺寸优先于 Provider density。',
			id: 'form-sizing',
			source: sizingSource,
			title: '五档尺寸与组合比例'
		},
		{
			covers: ['controlled', 'form-data', 'invalid', 'loading'],
			component: FormDemo,
			description:
				'Standard Schema把模型字符串输入转换为typed输出，同时保留原生FormData快照；异步提交暴露submitting、拦截重复提交并通过onSubmitError报告拒绝。',
			id: 'form-schema',
			source,
			title: '异步Schema与字段状态'
		},
		{
			covers: ['controlled', 'form-data', 'invalid', 'resource-cleanup'],
			component: FieldGraphDemo,
			description:
				'完整FieldPath映射嵌套Schema输入；password改变只重验自身和依赖字段，动态卸载会释放注册状态。',
			id: 'form-field-graph',
			source: fieldGraphSource,
			title: 'FieldPath、依赖与动态字段'
		},
		{
			covers: ['form-data', 'native-props'],
			component: NativeDemo,
			description: '无需schema时可启用浏览器constraint validation，并继续获得FormData提交回调。',
			id: 'form-native',
			source: nativeSource,
			title: '原生约束验证'
		},
		{
			covers: ['controlled', 'form-data', 'native-props'],
			component: NativeValuesDemo,
			description:
				'getValues/getFieldValue从当前successful controls读取深冻结native快照；输入改回挂载baseline后dirty恢复false。',
			id: 'form-native-values',
			source: nativeValuesSource,
			title: 'Native Values与Baseline Dirty'
		},
		{
			covers: ['composition', 'controlled', 'disabled', 'form-data', 'form-reset'],
			component: ModelDemo,
			description:
				'一个FormModel自动连接Input、PasswordInput、Textarea、Checkbox、NativeSelect和CheckboxGroup；展示批量写入、reset以及readonly/disabled对model与FormData的不同影响。',
			id: 'form-model-composition',
			source: modelSource,
			title: '自动Model与六族控件'
		},
		{
			covers: ['composition', 'controlled', 'form-reset', 'invalid', 'resource-cleanup'],
			component: ListDemo,
			description:
				'实验性首批以稳定row.id驱动一个动态成员列表；append、insert、move、replace、remove会成套迁移字段状态和错误，字段与表单reset继续使用同一model基线。',
			id: 'form-list',
			source: listSource,
			title: '动态FormList与稳定行身份'
		},
		{
			covers: ['composition', 'controlled', 'form-reset', 'invalid', 'resource-cleanup'],
			component: NestedListDemo,
			description:
				'每层列表独立持有行身份；内层路径与基线跟随父行移动，外层移除同时清理后代字段与错误。',
			id: 'form-nested-list',
			source: nestedListSource,
			title: '嵌套团队与成员'
		},
		{
			covers: ['composition', 'controlled', 'form-data', 'form-reset'],
			component: AdaptersDemo,
			description:
				'Switch、RadioGroup、Slider、RangeSlider和Rating作为真实值owner自动连接FormModel，并继续按各自原生input合同生成FormData。',
			id: 'form-choice-number-adapters',
			source: adaptersSource,
			title: '选择与数值控件Model适配'
		},
		{
			covers: ['composition', 'controlled', 'form-data', 'form-reset'],
			component: CollectionAdaptersDemo,
			description:
				'NumberField、Segmented、TagsInput、Select和MultiSelect自动连接同一FormModel；number key与不可变数组保持typed，FormData继续使用原生字符串和重复字段。',
			id: 'form-collection-adapters',
			source: collectionAdaptersSource,
			title: '集合与Typed Key控件适配'
		},
		{
			covers: ['controlled', 'loading', 'native-props'],
			component: BusyDemo,
			description: '外部服务任务可以通过原生aria-busy公告状态，不必复用会禁用按钮的loading语义。',
			id: 'form-external-busy',
			source: busySource,
			title: '外部Busy与可操作性'
		},
		{
			covers: ['controlled', 'form-reset', 'invalid', 'resource-cleanup'],
			component: ControllerDemo,
			description:
				'双泛型controller批量更新、保留dirty值重新initialize、resetField并观察聚合状态；显式schema重验不会覆盖已有server/manual错误。',
			id: 'form-controller',
			source: controllerSource,
			title: 'Controller、基线与错误分层'
		}
	],
	accessibility: [
		'异步反馈可通过ZFormField.feedbackMinLines预留行高，减少错误出现或消失时按钮位移；它是最小高度，不裁剪超长消息。',
		'ZForm保持原生form与FormData；默认关闭浏览器constraint阻断，由Standard Schema形成统一错误来源。',
		'ZFormField把schema完整路径映射的消息交给ZField生成稳定description/error/warning/success IDs，真实输入继续拥有label与aria-describedby。',
		'无效提交等待最新异步验证完成后，按实时DOM顺序滚动并聚焦首错；reset取消旧验证并清空dirty/touched/messages。',
		'FieldPath内部身份保留string/number段类型，HTML name独立生成；多个相同路径实例共享状态，但不会把ZForm变成私有值store。',
		'模型模式的getValues/getFieldValue返回FormModel快照；native模式按FieldPath形成successful FormData对象。两者都不冒充Standard Schema的typed output。',
		'模型模式的dirty按当前值与initialize/reset基线精确比较；批量写入与initialize会同步到已注册控件，resetField只恢复一个路径。',
		'ZFormField内的Input、PasswordInput、Textarea、Checkbox、NativeSelect、CheckboxGroup、Switch、RadioGroup、Slider、RangeSlider、Rating、NumberField、Segmented、TagsInput、Select和MultiSelect自动读取并写入model；不要再同时传value/checked形成第二个业务owner。',
		'readonly控件保留原生提交，disabled控件从FormData排除；FormModel仍保留两类字段的业务值。',
		'错误分为schema、server和manual三层：schema校验只更新schema层，setErrors写server层，setFieldFeedback的errors写manual层；clearErrors可按路径清理。',
		'onValidSubmit可以返回Promise；等待期间submitting为true并拦截重复语义提交，拒绝交给onSubmitError。reset会使旧提交结果失效，但不会取消应用已经发出的请求。',
		'ZFormList只在model表单内使用；children必须以row.id作为each key，字段路径在row.path后追加相对段。数组索引只表示当前地址，不能充当渲染身份。',
		'ZFormList的append、insert、remove、move和replace返回model owner是否接受写入；Form disabled/readonly时操作返回false。删除聚焦行会把焦点移到相邻行或列表根。',
		'字段卸载时model表单默认preserve=true，native表单默认false；ZFormField.preserve可逐字段覆盖。显式FormList remove始终删除对应行和值，不属于条件卸载保留。',
		'嵌套ZFormList在父列表的keyed行中渲染；内层地址和baseline按父行稳定身份定位。父行删除后旧内层操作失效，不会写到移位后的其他行。',
		"同一表单的typed FieldPath不能互为父子（例如['profile']与['profile','email']），且htmlName不能为空；注册阶段会报告配置错误，避免提交时才出现标量/对象输入错误。"
	],
	keywords: [
		'form',
		'standard schema',
		'async validation',
		'aria-busy',
		'first error',
		'field path',
		'dependency graph',
		'controller',
		'server errors',
		'dirty',
		'touched',
		'field array',
		'form list'
	]
});
