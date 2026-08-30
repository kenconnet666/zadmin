import { alertMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const alertDoc = defineComponentDoc(alertMetadata, {
	demos: [
		{
			component: FormDemo,
			description: '关闭只发送动作，是否移除由调用方持有。',
			id: 'alert-live',
			source,
			title: '行内反馈'
		}
	],
	accessibility: [
		'polite映射role=status，assertive映射role=alert；仅真正紧急且动态出现的消息使用assertive。',
		'live=off用于页面首屏已有的静态说明，避免无意义公告。',
		'关闭按钮名称必须包含消息上下文。'
	],
	keywords: ['alert', 'status', 'live region', 'feedback']
});
