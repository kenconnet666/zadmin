import { fileUploadMetadata } from '@zadmin/zui/metadata';
import { fileUploadApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
import AutoTransportDemo from './AutoTransportDemo.svelte';
import autoTransportSource from './AutoTransportDemo.svelte?raw';
import ControlledDemo from './ControlledDemo.svelte';
import controlledSource from './ControlledDemo.svelte?raw';
import DefaultsDemo from './DefaultsDemo.svelte';
import defaultsSource from './DefaultsDemo.svelte?raw';
import FormDemo from './FormDemo.svelte';
import formSource from './FormDemo.svelte?raw';
import ManualTransportDemo from './ManualTransportDemo.svelte';
import manualTransportSource from './ManualTransportDemo.svelte?raw';
import StatesDemo from './StatesDemo.svelte';
import statesSource from './StatesDemo.svelte?raw';

export const fileUploadDoc = defineComponentDoc(fileUploadMetadata, {
	profiles: ['form-control', 'animated'],
	sourceApi: fileUploadApiFacts,
	teaching: {
		props: {
			abortLabel: {
				default: 'localePack.fileUpload.abortUpload(item.file.name)',
				description: 'uploading项的中止命令名称；显式函数优先于Provider typed locale。'
			},
			chooseLabel: {
				default: 'localePack.fileUpload.chooseFiles',
				description: 'drop zone主操作文本；真实交互owner是原生button而非伪造键盘div。'
			},
			controlId: {
				default: 'Field controlId或自动ID',
				description: 'drop zone按钮ID；Field label和focus registry都指向此真实焦点owner。'
			},
			disabled: {
				default: '继承Field或false',
				description: '退出选择、拖放、命令和FormData；与readonly语义严格分开。'
			},
			dropLabel: {
				default: 'localePack.fileUpload.dropFiles',
				description: '选择按钮内的拖放说明；accept仍会由组件对drop来源重新校验。'
			},
			emptyText: {
				default: 'localePack.fileUpload.emptyQueue',
				description: '命名文件列表为空时的本地化状态。'
			},
			errorMessage: {
				default: 'localePack.fileUpload.failed(item.file.name)',
				description: '把未知transport错误映射成可呈现字符串；组件不泄漏response或私有异常。'
			},
			form: {
				default: '最近祖先form',
				description: 'FileFormValueBridge的原生form关联；支持组件位于目标form之外。'
			},
			inputLabel: {
				default: 'localePack.fileUpload.inputLabel',
				description: '不可见原生file picker的可访问名称。'
			},
			invalid: {
				default: '继承Field或false',
				description: '投射到根data-state与drop zone的aria-invalid。'
			},
			queueLabel: {
				default: 'localePack.fileUpload.queueLabel',
				description: 'typed文件list的可访问名称。'
			},
			removeLabel: {
				default: 'localePack.fileUpload.removeFile(item.file.name)',
				description: '单项移除命令名称；移除uploading项会先中止对应世代。'
			},
			required: {
				default: '继承Field或false',
				description: '投射到真实焦点owner；业务校验由Field/Form schema拥有。'
			},
			retryLabel: {
				default: 'localePack.fileUpload.retryUpload(item.file.name)',
				description: 'error或aborted项的重试命令名称。'
			},
			uploadLabel: {
				default: 'localePack.fileUpload.uploadFile(item.file.name)',
				description: '手动queued项的上传命令名称。'
			}
		},
		summary:
			'生产FilePicker/queue边界：原生选择与拖放只创建typed队列，组件管理可控状态、进度、AbortSignal、重试和FormData；transport由调用方注入，默认手动且不拥有URL、fetch、凭据、响应、缓存或分片策略。'
	},
	demos: [
		{
			component: FormDemo,
			covers: ['form-data', 'form-reset', 'invalid', 'keyboard', 'uncontrolled'],
			description:
				'选择或拖放后按accept、大小、数量与重复规则进入typed队列；Field拥有name/required，原生formdata事件提交重复同名File并支持reset。',
			id: 'file-upload-form-queue',
			source: formSource,
			title: '校验队列、Field与FormData'
		},
		{
			component: ManualTransportDemo,
			covers: ['keyboard', 'loading', 'resource-cleanup', 'uncontrolled'],
			description:
				'默认不自动上传；显式命令驱动调用方adapter，进度、失败、中止与重试按稳定item id和请求世代回写。',
			id: 'file-upload-manual-transport',
			source: manualTransportSource,
			title: '手动Transport、Abort与Retry'
		},
		{
			component: AutoTransportDemo,
			covers: ['controlled', 'external-clear', 'loading', 'resource-cleanup'],
			description:
				'autoUpload只把新queued项交给同一个adapter；外部替换队列会取消已失效世代，不把请求配置塞入组件。',
			id: 'file-upload-auto-transport',
			source: autoTransportSource,
			title: '显式开启Auto Upload'
		},
		{
			component: ControlledDemo,
			covers: ['controlled', 'external-clear', 'variants-and-states'],
			description:
				'业务owner可整体替换或清空含status/progress/error的不可变队列；外部同步不会伪造选择事件。',
			id: 'file-upload-controlled',
			source: controlledSource,
			title: '受控Typed队列'
		},
		{
			component: StatesDemo,
			covers: ['disabled', 'focus', 'invalid', 'readonly'],
			description:
				'Field统一投射invalid/required/readonly/disabled；readonly保持焦点和FormData但阻止所有写命令。',
			id: 'file-upload-states',
			source: statesSource,
			title: 'Invalid、Readonly与Disabled'
		},
		{
			component: DefaultsDemo,
			covers: ['form-reset', 'locale', 'uncontrolled', 'variants-and-states'],
			description:
				'defaultFiles可表达已有success和error项，reset恢复完整初始状态而非只恢复File引用。',
			id: 'file-upload-default-queue',
			source: defaultsSource,
			title: '初始状态队列与Reset'
		}
	],
	accessibility: [
		'FilePicker与queue/transport分层：原生input和button只负责打开系统选择器；drop zone使用同一个button焦点owner，避免给div手写不完整键盘语义。',
		'typed FileUploadItem固定包含id、File、queued/uploading/success/error/aborted、0–100 progress和可选error；所有状态迁移都生成新对象并通过files/onFilesChange统一观察。',
		'transport只收到item、owner-realm AbortSignal和reportProgress命令。URL、fetch/XHR、headers、credentials、response、缓存、签名、分片、并发调度和服务端删除全部属于调用方。',
		'autoUpload默认false，吸收Naive UI的manual submit与Ant的customRequest思路但拒绝内置action/fetch；显式true只自动启动queued项，不自动重试error。',
		'每个active request由item id和对象世代隔离；中止、移除、reset、外部清空和卸载都会终止AbortController，迟到的progress/resolve/reject不能复活旧项。',
		'accept是原生picker提示而不是安全边界；组件对input和drop来源都再次执行MIME/扩展名、单文件大小、重复元数据和总数校验，并以精确reason返回拒绝项。',
		'FormData不依赖跨浏览器不可移植的FileList赋值：FileFormValueBridge在关联form的原生formdata事件追加权威队列；owner-realm DataTransfer仅用于尽力同步公开inputRef.files。',
		'readonly保留drop zone焦点、队列阅读、状态和FormData，但阻止picker、drop、upload、abort、retry、remove与clear；disabled同时退出焦点和FormData。',
		'进度由ZProgress承载；新增项只在owner element支持WAAPI且未减少动画时做短入场，Provider motion或系统减少动画会取消动画。',
		'参考取舍：采用Ant/Naive的受控列表、状态和命令，采用React Aria FileTrigger/DropZone的原生pressable边界，采用MUI的原生隐藏file input模式；暂不承诺directory、camera capture、paste、preview/thumb、drag-sort或chunk runtime，这些需要独立可访问性和资源生命周期设计。'
	],
	keywords: [
		'file picker',
		'file upload',
		'drop zone',
		'typed queue',
		'transport adapter',
		'abort signal',
		'retry',
		'progress',
		'formdata',
		'readonly'
	]
});
