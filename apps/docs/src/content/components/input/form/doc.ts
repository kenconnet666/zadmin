import { formFieldMetadata, formMetadata } from '@zadmin/zui/metadata';
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
import { formApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const formDoc = defineComponentDoc(formMetadata, {
	members: [formFieldMetadata],
	profiles: ['form-control'],
	sourceApi: formApiFacts,
	teaching: {
		props: {
			onReset: {
				default: '—',
				description: 'deprecated兼容回调；新代码使用原生小写onreset，二者同一函数时不会重复调用。'
			},
			onSubmit: {
				default: '—',
				description:
					'deprecated兼容回调；新代码使用原生小写onsubmit并可preventDefault取消语义提交。'
			}
		},
		summary:
			'以原生FormData为值事实、Standard Schema为typed输出边界，并用FieldPath图拥有依赖验证、消息状态、竞态和首错导航的生产表单。'
	},
	demos: [
		{
			covers: ['controlled', 'focus', 'invalid', 'resource-cleanup'],
			component: FormDemo,
			description:
				'Standard Schema异步验证按字段路径分发；change防抖、submit竞态和首错聚焦共享同一Registry。',
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
			covers: ['controlled', 'loading', 'native-props'],
			component: BusyDemo,
			description: '外部服务任务可以通过原生aria-busy公告状态，不必复用会禁用按钮的loading语义。',
			id: 'form-external-busy',
			source: busySource,
			title: '外部Busy与可操作性'
		},
		{
			covers: ['disabled', 'focus', 'form-reset', 'native-props'],
			component: ControllerDemo,
			description:
				'controller注入服务端错误和字段状态，并演示表单外submit、原生小写事件、整表禁用与原生reset。',
			id: 'form-controller',
			source: controllerSource,
			title: 'Controller与外部Form owner'
		}
	],
	accessibility: [
		'ZForm保持原生form与FormData；默认关闭浏览器constraint阻断，由Standard Schema形成统一错误来源。',
		'ZFormField把schema完整路径映射的消息交给ZField生成稳定description/error/warning/success IDs，真实输入继续拥有label与aria-describedby。',
		'无效提交等待最新异步验证完成后，按实时DOM顺序滚动并聚焦首错；reset取消旧验证并清空dirty/touched/messages。',
		'FieldPath内部身份保留string/number段类型，HTML name独立生成；多个相同路径实例共享状态，但不会把ZForm变成私有值store。'
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
		'touched'
	]
});
