import { descriptionListMetadata } from '@zadmin/zui/metadata';
import DetailsDemo from './DetailsDemo.svelte';
import detailsSource from './DetailsDemo.svelte?raw';
import FormDemo from './FormDemo.svelte';
import formSource from './FormDemo.svelte?raw';
import ManualDemo from './ManualDemo.svelte';
import manualSource from './ManualDemo.svelte?raw';
import ResponsiveRtlDemo from './ResponsiveRtlDemo.svelte';
import responsiveRtlSource from './ResponsiveRtlDemo.svelte?raw';
import RichDemo from './RichDemo.svelte';
import richSource from './RichDemo.svelte?raw';
import StatesDemo from './StatesDemo.svelte';
import statesSource from './StatesDemo.svelte?raw';
import { descriptionListApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const descriptionListDoc = defineComponentDoc(descriptionListMetadata, {
	profiles: ['collection', 'data-view'],
	sourceApi: descriptionListApiFacts,
	teaching: {
		props: {
			emptyText: {
				default: 'localePack.collection.empty',
				description: '数据模式空数组的默认ZEmpty标题；完整结构可用empty snippet替换。'
			},
			items: {
				default: '与children二选一',
				description: 'typed data convenience；推荐key，deprecated id仅用于既有迁移。'
			},
			loading: {
				default: 'false',
				description: '保持空dl并在其后展示状态，不把Skeleton伪造成dt/dd。'
			},
			loadingCount: { default: '3', description: '默认ZSkeleton键值组数。' },
			loadingText: {
				default: 'localePack.collection.loading',
				description: 'loading status的可访问名称。'
			},
			ref: { default: 'null', description: '始终指向真实dl，即使处于empty/loading。' },
			responsive: {
				default: 'true',
				description: 'auto-fit到单列或多列；false固定单列且不改变dt/dd语义。'
			}
		},
		summary:
			'DescriptionList只拥有dl/dt/dd、typed key、有限term/description/action snippets和响应式展示；手写children保留复杂原生分组，empty/loading位于dl之外。'
	},
	demos: [
		{
			component: FormDemo,
			covers: ['basic-render', 'native-props'],
			description: 'typed data convenience直接输出真实dl、dt与dd。',
			id: 'description-list-basic',
			source: formSource,
			title: '基础键值信息'
		},
		{
			component: DetailsDemo,
			covers: ['accessible-name', 'basic-render', 'variants-and-states'],
			description: '多项发布元数据使用响应式原生dl，而不是Grid或Table伪造键值关系。',
			id: 'description-list-details',
			source: detailsSource,
			title: '响应式发布详情'
		},
		{
			component: RichDemo,
			covers: ['composition', 'focus', 'keyboard'],
			description: 'term、description与action snippets组合ZText、ZTag、ZLink并保持typed key身份。',
			id: 'description-list-rich',
			source: richSource,
			title: 'Rich内容与Action'
		},
		{
			component: ManualDemo,
			covers: ['composition', 'native-props'],
			description: '手写模式由调用方提供dt/dd，适合一对多说明或特殊分组，不与items混用。',
			id: 'description-list-manual',
			source: manualSource,
			title: '手写原生结构'
		},
		{
			component: StatesDemo,
			covers: ['accessible-name', 'loading', 'locale', 'variants-and-states'],
			description: '默认/自定义ZEmpty与ZSkeleton loading位于空dl之外，通过describedby关联。',
			id: 'description-list-empty-loading',
			source: statesSource,
			title: 'Empty与Loading'
		},
		{
			component: ResponsiveRtlDemo,
			covers: ['composition', 'rtl', 'variants-and-states'],
			description: 'auto-fit布局在窄容器退回单列，长term/description断行且RTL使用逻辑方向。',
			id: 'description-list-responsive-rtl',
			source: responsiveRtlSource,
			title: '响应式、长内容与RTL'
		}
	],
	accessibility: [
		'数据模式每组使用div包裹一个真实dt和dd；手写模式由调用方提供有效dt/dd或允许的div分组。',
		'items与children互斥；DescriptionList不复制DataTable的列、排序、选择、分页或单元格模型。',
		'empty/loading期间dl保持为空并通过aria-describedby关联外部状态；ZEmpty、ZSkeleton不会伪装成term/description。',
		'action位于dd内部且由真实ZButton/ZLink拥有交互语义，dt/dd本身不变成可点击控件。',
		'number 1与string 1是不同typed key；重复、NaN、Infinity和negative zero会在渲染前拒绝。',
		'responsive只改变CSS列数，不改DOM次序；RTL与间距使用逻辑属性，长内容允许任意断行。'
	],
	keywords: [
		'description list',
		'dl',
		'dt',
		'dd',
		'metadata',
		'typed key',
		'empty state',
		'responsive details'
	]
});
