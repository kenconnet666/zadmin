import { formFieldMetadata, formMetadata } from '@zadmin/zui/metadata';
import BusyDemo from './BusyDemo.svelte';
import busySource from './BusyDemo.svelte?raw';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import NativeDemo from './NativeDemo.svelte';
import nativeSource from './NativeDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const formDoc = defineComponentDoc(formMetadata, {
	members: [formFieldMetadata],
	demos: [
		{
			component: FormDemo,
			description:
				'Standard Schema异步验证按字段路径分发；change防抖、submit竞态和首错聚焦共享同一Registry。',
			id: 'form-schema',
			source,
			title: '异步Schema与字段状态'
		},
		{
			component: NativeDemo,
			description: '无需schema时可启用浏览器constraint validation，并继续获得FormData提交回调。',
			id: 'form-native',
			source: nativeSource,
			title: '原生约束验证'
		},
		{
			component: BusyDemo,
			description: '外部服务任务可以通过原生aria-busy公告状态，不必复用会禁用按钮的loading语义。',
			id: 'form-external-busy',
			source: busySource,
			title: '外部Busy与可操作性'
		}
	],
	accessibility: [
		'ZForm保持原生form与FormData；默认关闭浏览器constraint阻断，由Standard Schema形成统一错误来源。',
		'ZFormField把schema消息交给ZField生成稳定description/error IDs，真实输入继续拥有label与aria-describedby。',
		'无效提交等待最新异步验证完成后聚焦首个注册错误字段；reset取消旧验证并清空dirty/touched/errors。'
	],
	keywords: [
		'form',
		'standard schema',
		'async validation',
		'aria-busy',
		'first error',
		'dirty',
		'touched'
	]
});
