import { resultMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import TonesDemo from './TonesDemo.svelte';
import tonesSource from './TonesDemo.svelte?raw';
import CustomIconDemo from './CustomIconDemo.svelte';
import customIconSource from './CustomIconDemo.svelte?raw';
import DetailedDemo from './DetailedDemo.svelte';
import detailedSource from './DetailedDemo.svelte?raw';
import HeadingDemo from './HeadingDemo.svelte';
import headingSource from './HeadingDemo.svelte?raw';
import { resultApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const resultDoc = defineComponentDoc(resultMetadata, {
	profiles: ['data-view'],
	sourceApi: resultApiFacts,
	teaching: {
		props: {
			contentAlign: {
				default: "'center'",
				description: '详细正文可切换为逻辑起点对齐；标题、图标和操作区仍保持居中。'
			},
			headingLevel: {
				default: '2',
				description: '投射到真实ZHeading level 1–6，视觉字号不会随层级漂移。'
			},
			icon: {
				default: 'tone对应Lucide图标',
				description: 'Snippet替换默认图标；null显式隐藏。图标容器始终aria-hidden。'
			},
			ref: { default: 'null', description: '具名结果section的真实HTMLElement引用。' },
			title: { default: '必填', description: '操作处理结果标题，也是section的可访问名称。' },
			tone: {
				default: "'info'",
				description: '与ZAlert一致的info/success/warning/danger语义轴。'
			}
		},
		summary:
			'用于重要操作处理结果的具名section：真实ZHeading、Alert同构tone、装饰图标、详细正文与后续操作保持独立。'
	},
	demos: [
		{
			component: FormDemo,
			covers: ['accessible-name', 'basic-render', 'composition', 'keyboard'],
			description: '状态页使用具名section组合图形、说明和操作。',
			id: 'result-success',
			source,
			title: '成功结果'
		},
		{
			component: TonesDemo,
			covers: ['accessible-name', 'variants-and-states'],
			description: 'Info与Danger结果使用Lucide图形和不同语义色表达后续状态。',
			id: 'result-tones',
			source: tonesSource,
			title: '结果语义'
		},
		{
			component: DetailedDemo,
			covers: ['composition', 'native-props', 'variants-and-states'],
			description:
				'复杂错误正文使用content Snippet与逻辑起点对齐；操作仍是独立真实按钮，不把Result变成表单或Alert。',
			id: 'result-detailed-content',
			source: detailedSource,
			title: '详细处理结果与修复操作'
		},
		{
			component: CustomIconDemo,
			covers: ['accessible-name', 'composition', 'variants-and-states'],
			description: '自定义Lucide和icon=null共享同一标题名称；图形不会被辅助技术重复朗读。',
			id: 'result-custom-icon',
			source: customIconSource,
			title: '自定义或隐藏装饰图标'
		},
		{
			component: HeadingDemo,
			covers: ['native-props', 'ssr', 'variants-and-states'],
			description: '页面h1与嵌套h2都是真实ZHeading；长中英文标识与操作区在窄容器中安全换行。',
			id: 'result-heading-responsive',
			source: headingSource,
			title: '标题层级、原生属性与长内容'
		}
	],
	accessibility: [
		'section通过SSR稳定ID关联真实ZHeading；headingLevel支持1–6且不会使用role伪造标题。',
		'默认与自定义图标容器始终aria-hidden，结果标题和正文提供完整文本，不重复朗读图标名称。',
		'Result不是live region；异步完成公告应由任务状态或Alert/Toast承担。',
		'操作保持真实按钮或链接；长正文支持逻辑起点对齐和任意长标识换行，操作区可响应式换行。',
		'Result只表达重要操作的处理结果；集合没有数据使用ZEmpty，加载中使用Spinner/Skeleton owner组合。',
		'参考Ant Result采用title、subtitle/body、icon和extra分区；保留与ZAlert一致的四种tone，不复制403/404/500为视觉状态，也不引入loading。'
	],
	keywords: ['result', 'status page', 'success', 'operation outcome', 'heading', 'actions']
});
