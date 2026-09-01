import { timelineMetadata } from '@zadmin/zui/metadata';
import AlternateRtlDemo from './AlternateRtlDemo.svelte';
import alternateRtlSource from './AlternateRtlDemo.svelte?raw';
import CustomDemo from './CustomDemo.svelte';
import customSource from './CustomDemo.svelte?raw';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import LongContentDemo from './LongContentDemo.svelte';
import longContentSource from './LongContentDemo.svelte?raw';
import PendingReverseDemo from './PendingReverseDemo.svelte';
import pendingReverseSource from './PendingReverseDemo.svelte?raw';
import StatusesDemo from './StatusesDemo.svelte';
import statusesSource from './StatusesDemo.svelte?raw';
import TypedKeysDemo from './TypedKeysDemo.svelte';
import typedKeysSource from './TypedKeysDemo.svelte?raw';
import { timelineApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const timelineDoc = defineComponentDoc(timelineMetadata, {
	profiles: ['collection', 'data-view'],
	sourceApi: timelineApiFacts,
	teaching: {
		props: {
			item: {
				default: '—',
				description: 'pre-1.0 content单参数迁移别名；不能与content同时提供。'
			},
			items: {
				default: '必填',
				description: '优先使用typed key；number 1与string "1"独立，重复同类型key会早抛。'
			},
			label: {
				default: "'Timeline'",
				description: '根ol名称；原生aria-label优先，生产页面应传入业务名称。'
			},
			ref: { default: 'null', description: '真实HTMLOListElement引用。' }
		},
		summary:
			'只呈现历史事件的真实ol/li集合：typed key、独立content/icon/time、状态tone、pending、reverse及RTL响应式alternate，不承担Steps导航。'
	},
	demos: [
		{
			component: FormDemo,
			covers: ['accessible-name', 'basic-render', 'native-props', 'ssr'],
			description: '发布事件保持有序列表、状态、typed key与机器可读时间。',
			id: 'timeline-release',
			source,
			title: '发布历程'
		},
		{
			component: CustomDemo,
			covers: ['composition', 'native-props', 'variants-and-states'],
			description: 'content、icon与time分别组合ZUI和Lucide，稳定li仍由Timeline拥有。',
			id: 'timeline-custom',
			source: customSource,
			title: '分区Snippet'
		},
		{
			component: StatusesDemo,
			covers: ['accessible-name', 'basic-render', 'variants-and-states'],
			description: 'done/current/error/pending映射默认tone，单项tone可显式覆盖。',
			id: 'timeline-statuses',
			source: statusesSource,
			title: '状态与色调'
		},
		{
			component: PendingReverseDemo,
			covers: ['composition', 'loading', 'variants-and-states'],
			description: 'pending属于逻辑时间尾端；reverse只改变视觉顺序，并复用ZSpinner。',
			id: 'timeline-pending-reverse',
			source: pendingReverseSource,
			title: 'Pending与倒序'
		},
		{
			component: AlternateRtlDemo,
			covers: ['native-props', 'rtl', 'variants-and-states'],
			description: 'alternate使用逻辑起止侧，在RTL镜像，并在窄视口回落为start单轴。',
			id: 'timeline-alternate-rtl',
			source: alternateRtlSource,
			title: '交错、RTL与响应式'
		},
		{
			component: LongContentDemo,
			covers: ['native-props', 'ssr', 'variants-and-states'],
			description: '长CJK标题和说明在minmax网格中自然换行，不改变li语义。',
			id: 'timeline-long-content',
			source: longContentSource,
			title: '长内容'
		},
		{
			component: TypedKeysDemo,
			covers: ['basic-render', 'composition', 'ssr'],
			description: 'number与string SelectionKey保持类型身份，不做字符串化去重。',
			id: 'timeline-typed-keys',
			source: typedKeysSource,
			title: 'Typed Key身份'
		}
	],
	accessibility: [
		'根始终是具名ol，每个事件与pending始终是真实li；marker、connector和Lucide icon均为装饰。',
		'current事件使用aria-current="true"，但Timeline不提供方向键、焦点或步骤跳转；交互流程应使用Steps/Tabs。',
		'默认时间使用原生time/datetime；自定义time snippet由调用方继续提供等价语义。',
		'pending设置aria-busy并要求可见正文；默认ZSpinner位于装饰轴内，不制造第二套可访问名称。',
		'alternate使用逻辑网格侧，在RTL自动镜像并于30rem以下回落单轴；长正文保持min-width:0。',
		'参考Ant Design的items/mode/reverse/pending、MUI的alternate/opposite与Naive UI的RTL经验，但不复制Steps、水平轴或可导航状态机。'
	],
	keywords: [
		'timeline',
		'ol',
		'li',
		'time',
		'typed key',
		'status',
		'pending',
		'reverse',
		'alternate',
		'rtl'
	]
});
