import { alertMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import TonesDemo from './TonesDemo.svelte';
import tonesSource from './TonesDemo.svelte?raw';
import { alertApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const alertDoc = defineComponentDoc(alertMetadata, {
	profiles: ['primitive'],
	sourceApi: alertApiFacts,
	demos: [
		{
			component: FormDemo,
			covers: ['accessible-name', 'controlled', 'keyboard'],
			description: '关闭只发送动作，是否移除由调用方持有。',
			id: 'alert-live',
			source,
			title: '行内反馈'
		},
		{
			component: TonesDemo,
			covers: ['native-props', 'variants-and-states'],
			description: '四种语义tone与live优先级分别表达静态、礼貌和紧急反馈。',
			id: 'alert-tones',
			source: tonesSource,
			title: '语义与Live优先级'
		}
	],
	accessibility: [
		'polite映射role=status，assertive映射role=alert；仅真正紧急且动态出现的消息使用assertive。',
		'live=off用于页面首屏已有的静态说明，避免无意义公告。',
		'默认关闭名称来自Provider localePack.feedback.dismissAlert；同页存在多个Alert时应显式提供包含消息上下文的dismissLabel。'
	],
	keywords: ['alert', 'status', 'live region', 'feedback']
});
