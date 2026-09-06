import { copyButtonMetadata } from '@zadmin/zui/metadata';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import CustomDemo from './CustomDemo.svelte';
import customSource from './CustomDemo.svelte?raw';
import ControllerDemo from './ControllerDemo.svelte';
import controllerSource from './ControllerDemo.svelte?raw';
import DynamicDemo from './DynamicDemo.svelte';
import dynamicSource from './DynamicDemo.svelte?raw';
import { copyButtonApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const copyButtonDoc = defineComponentDoc(copyButtonMetadata, {
	profiles: ['primitive', 'form-control'],
	sourceApi: copyButtonApiFacts,
	teaching: {
		props: {
			timeout: { default: '2000', description: '反馈保留毫秒，0表示直到reset或value变化。' },
			value: { default: '必填', description: '直接写入剪贴板的字符串；组件不读取系统剪贴板。' },
			onCopy: { default: '—', description: '当前用户请求真正写入成功后调用。' },
			onCopyError: { default: '—', description: '当前用户请求失败后调用，不伪造copied。' }
		},
		summary:
			'复用Button和owner Window ClipboardController提供真实用户手势复制、成功/失败反馈与可清理异步生命周期。'
	},
	demos: [
		{
			component: BasicDemo,
			covers: ['basic-render', 'focus', 'native-props', 'variants-and-states'],
			description:
				'明确value由按钮用户手势写入，结果通过onCopy/onCopyError显示，不假定权限一定存在。',
			id: 'copy-button-basic',
			source: basicSource,
			title: '明确文本与结果反馈'
		},
		{
			component: CustomDemo,
			covers: ['composition', 'native-props', 'variants-and-states'],
			description: 'children和icon snippet读取只读snapshot；iconOnly保留完整aria-label和状态。',
			id: 'copy-button-custom',
			source: customSource,
			title: '自定义内容与图标按钮'
		},
		{
			component: DynamicDemo,
			covers: ['controlled', 'focus', 'resource-cleanup', 'variants-and-states'],
			description: 'value变化自动reset旧结果，timeout=0由外部reset控制反馈生命周期。',
			id: 'copy-button-dynamic',
			source: dynamicSource,
			title: '动态值与Reset'
		},
		{
			component: ControllerDemo,
			covers: ['composition', 'resource-cleanup', 'variants-and-states'],
			description:
				'直接组合ClipboardController与Button；copy保持在真实click调用栈中，reset和destroy只使反馈失效，不宣称撤销原生写入。',
			id: 'copy-button-controller',
			source: controllerSource,
			title: '直接组合 ClipboardController'
		}
	],
	accessibility: [
		'复制只由真实Button用户激活触发；组件不在mount/onMount中写入剪贴板，也不读取系统内容。',
		'copied/failed状态提供可见标签和polite live message；失败保留可重试按钮。',
		'iconOnly仍保留完整label/aria-label；owner Window变化或组件卸载会使迟到请求失效。'
	]
});
