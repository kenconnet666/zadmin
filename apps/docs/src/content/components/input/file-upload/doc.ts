import { fileUploadMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const fileUploadDoc = defineComponentDoc(fileUploadMetadata, {
	demos: [
		{
			component: FormDemo,
			description:
				'选择或拖放文件后按accept、大小、数量与重复规则进入队列；移除会同步真实input.files。',
			id: 'file-upload-queue',
			source,
			title: '配置文件队列'
		}
	],
	accessibility: [
		'组件不发送网络请求：服务端、直传、分片、重试和凭据属于应用层上传策略。',
		'原生file input始终是FormData文件来源；DataTransfer只用于把经过验证的UI队列回写到input.files。',
		'拒绝原因区分type、size、duplicate和max-files；应用可以按原因本地化提示。'
	],
	keywords: ['file upload', 'drop zone', 'accept', 'queue', 'formdata']
});
