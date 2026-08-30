import { tourMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import NonModalDemo from './NonModalDemo.svelte';
import nonModalSource from './NonModalDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const tourDoc = defineComponentDoc(tourMetadata, {
	demos: [
		{
			component: FormDemo,
			description: '两步导览复用真实目标、Portal、Floating和modal焦点生命周期。',
			id: 'tour-guided',
			source,
			title: '生产发布导览'
		},
		{
			component: NonModalDemo,
			description: '非模态模式不trap页面焦点，遮罩不可关闭并在完成时回调。',
			id: 'tour-non-modal',
			source: nonModalSource,
			title: '非模态导览'
		}
	],
	accessibility: [
		'打开层是具名modal dialog；FocusScope在整个导览期间只创建一次，完成或关闭后恢复启动焦点。',
		'目标通过selector或函数显式解析并注册为Layer branch；缺失目标调用onTargetMissing并关闭。',
		'四片遮罩保留真实目标孔洞，spotlight只装饰；Escape归最顶层LayerStack所有。',
		'scrollIntoView在reduced-motion下使用auto，否则允许smooth，Floating持续跟踪目标位置。'
	],
	keywords: ['tour', 'spotlight', 'floating', 'focus scope', 'portal']
});
