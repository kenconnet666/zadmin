import { codeMetadata } from '@zadmin/zui/metadata';
import CopyDemo from './CopyDemo.svelte';
import copySource from './CopyDemo.svelte?raw';
import HighlightDemo from './HighlightDemo.svelte';
import highlightSource from './HighlightDemo.svelte?raw';
import InlineDemo from './InlineDemo.svelte';
import inlineSource from './InlineDemo.svelte?raw';
import LinesDemo from './LinesDemo.svelte';
import linesSource from './LinesDemo.svelte?raw';
import SchemeDemo from './SchemeDemo.svelte';
import schemeSource from './SchemeDemo.svelte?raw';
import { codeApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const codeDoc = defineComponentDoc(codeMetadata, {
	profiles: ['primitive'],
	sourceApi: codeApiFacts,
	teaching: {
		props: {
			ariaLabel: { default: '—', description: '为代码区域提供用途明确的可访问名称。' },
			code: { default: '必填', description: '始终按纯文本处理并保留选择、复制和SSR语义。' },
			copiedLabel: {
				default: 'localePack.code.copied',
				description: '复制成功后的按钮名称与polite公告。'
			},
			copyable: {
				default: 'false',
				description: '仅为block代码增加ZButton复制操作；与inline互斥。'
			},
			copyFailedLabel: {
				default: 'localePack.code.copyFailed',
				description: 'Clipboard被拒绝或不可用时的安全文案，不泄漏错误细节。'
			},
			copyLabel: { default: 'localePack.code.copy', description: '复制操作的初始名称。' },
			embedded: { default: 'false', description: '移除外层边框和圆角以嵌入已有surface。' },
			highlightedLines: {
				default: '[]',
				description: '以1-based行号突出重点；不会改变源码或读屏顺序。'
			},
			inline: { default: 'false', description: '渲染真实inline code；不提供复制按钮。' },
			lang: { default: 'undefined', description: '受控语言集合；缺失时保持纯文本。' },
			lineNumbers: { default: 'false', description: '显示装饰性行号，不进入可访问名称。' },
			loading: { default: '—', description: '异步加载高亮器时的可选Snippet。' },
			onCopy: { default: '—', description: '复制完成后报告copied/failed，不传递原始异常。' },
			ref: { default: 'null', description: '最终code或pre元素引用。' },
			scheme: { default: 'Provider colorScheme', description: '显式选择亮暗代码表面。' },
			size: {
				default: "inline ? 'small' : 'medium'",
				description:
					'共享Theme字号；正文中的行内代码可显式medium，与正文统一，紧凑API类型保留small。'
			},
			theme: {
				default: 'GitHub high contrast light/dark',
				description: '只接受已加载且通过Docs Axe对比度门禁的高对比主题。'
			},
			wrap: { default: 'false', description: '允许长代码换行；默认保留横向滚动。' }
		},
		summary:
			'SSR先输出纯文本，客户端generation-safe按需加载Shiki高对比tokens，并可组合安全、可本地化的复制操作。'
	},
	demos: [
		{
			component: HighlightDemo,
			covers: ['basic-render', 'resource-cleanup', 'ssr'],
			description: 'SSR先输出纯文本，客户端按需加载Shiki并只提交最新generation。',
			id: 'code-highlight',
			source: highlightSource,
			title: '按需语法高亮'
		},
		{
			component: InlineDemo,
			covers: ['composition', 'native-props', 'variants-and-states'],
			description: 'inline、wrap和普通代码块覆盖命令与结构化数据场景。',
			id: 'code-inline',
			source: inlineSource,
			title: '行内与换行代码'
		},
		{
			component: SchemeDemo,
			covers: ['composition', 'native-props', 'variants-and-states'],
			description: '显式亮暗scheme与高对比theme覆盖Provider，embedded嵌入ZCard。',
			id: 'code-scheme-embedded',
			source: schemeSource,
			title: '主题与嵌入容器'
		},
		{
			component: CopyDemo,
			covers: ['accessible-name', 'keyboard', 'locale', 'resource-cleanup'],
			description: 'ZButton保持焦点，Clipboard拒绝转成安全failed状态，反馈计时器归属owner Window。',
			id: 'code-copy',
			source: copySource,
			title: '复制与失败反馈'
		},
		{
			component: LinesDemo,
			covers: ['accessible-name', 'composition', 'native-props'],
			description: '行号、重点行和wrap只改变视觉，源码文本与阅读顺序保持不变。',
			id: 'code-lines',
			source: linesSource,
			title: '行号与重点行'
		}
	],
	accessibility: [
		'源码始终保留为真实可选择文本；Shiki只提供token颜色，不写入HTML字符串。',
		'默认GitHub高对比亮暗主题通过文档站Axe门禁；行号为装饰内容。',
		'copyable只用于block代码，使用真实ZButton并用polite状态公告成功或失败；焦点不跳离操作。',
		'Clipboard权限拒绝不抛到控制台，也不暴露异常细节；调用方只接收copied/failed。',
		'未知语言、超出高亮上限或异步高亮失败时回退原始纯文本。'
	],
	keywords: ['code', 'shiki', 'syntax highlight', 'copy', 'clipboard', 'SSR', 'CSP']
});
