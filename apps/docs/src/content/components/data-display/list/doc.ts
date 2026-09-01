import { listMetadata } from '@zadmin/zui/metadata';
import CustomItemsDemo from './CustomItemsDemo.svelte';
import customItemsSource from './CustomItemsDemo.svelte?raw';
import FormDemo from './FormDemo.svelte';
import formSource from './FormDemo.svelte?raw';
import LongRtlDemo from './LongRtlDemo.svelte';
import longRtlSource from './LongRtlDemo.svelte?raw';
import ManualDemo from './ManualDemo.svelte';
import manualSource from './ManualDemo.svelte?raw';
import StatesDemo from './StatesDemo.svelte';
import statesSource from './StatesDemo.svelte?raw';
import VirtualBoundaryDemo from './VirtualBoundaryDemo.svelte';
import virtualBoundarySource from './VirtualBoundaryDemo.svelte?raw';
import { listApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const listDoc = defineComponentDoc(listMetadata, {
	profiles: ['collection', 'data-view'],
	sourceApi: listApiFacts,
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
				description: '保持空ul/ol并在其后展示状态，不把Skeleton伪造成li。'
			},
			loadingCount: { default: '3', description: '默认ZSkeleton占位行数。' },
			loadingText: {
				default: 'localePack.collection.loading',
				description: 'loading status的可访问名称。'
			},
			ordered: { default: 'false', description: '选择真实ol；否则为真实ul。' },
			ref: { default: 'null', description: '始终指向真实ul/ol，即使处于empty/loading。' }
		},
		summary:
			'语义List只拥有ul/ol/li、typed key和有限rich/action snippets；手写children由调用方拥有li结构，empty/loading位于列表之外，大数据改用ZVirtualList。'
	},
	demos: [
		{
			component: FormDemo,
			covers: ['basic-render', 'native-props'],
			description: 'typed key驱动有序数据便利层，默认label/description仍输出真实ol/li。',
			id: 'list-ordered-data',
			source: formSource,
			title: '有序数据列表'
		},
		{
			component: CustomItemsDemo,
			covers: ['composition', 'focus', 'keyboard'],
			description: 'item与action snippets组合ZText、ZTag、ZLink，交互焦点由真实子控件拥有。',
			id: 'list-rich-actions',
			source: customItemsSource,
			title: 'Rich Item与Action'
		},
		{
			component: ManualDemo,
			covers: ['composition', 'native-props'],
			description: '手写children模式由调用方提供li，可嵌套另一个语义ZList，不与items混用。',
			id: 'list-manual-nested',
			source: manualSource,
			title: '手写与嵌套列表'
		},
		{
			component: StatesDemo,
			covers: ['accessible-name', 'loading', 'locale', 'variants-and-states'],
			description: '默认/自定义ZEmpty与ZSkeleton loading位于空列表之外，通过describedby关联。',
			id: 'list-empty-loading',
			source: statesSource,
			title: 'Empty与Loading'
		},
		{
			component: LongRtlDemo,
			covers: ['composition', 'rtl', 'variants-and-states'],
			description: '长标识在窄容器断行，action位于逻辑末端，RTL不写死物理方向。',
			id: 'list-long-rtl',
			source: longRtlSource,
			title: '长内容、窄容器与RTL'
		},
		{
			component: VirtualBoundaryDemo,
			covers: ['accessible-name', 'composition', 'resource-cleanup'],
			description:
				'一万项使用ZVirtualList role=list/listitem；ZList不复制窗口、测量或滚动controller。',
			id: 'list-virtual-boundary',
			source: virtualBoundarySource,
			title: 'VirtualList边界'
		}
	],
	accessibility: [
		'ordered选择真实ol，否则使用真实ul；数据模式每个业务项始终是li，手写模式要求调用方提供li。',
		'数据items与手写children互斥；List不把任意视觉Stack声明为列表，也不承担选择、排序、分页或表格关系。',
		'empty/loading期间ul/ol保持为空并通过aria-describedby关联外部状态；ZEmpty、ZSkeleton不会伪装成li或污染项目计数。',
		'Item action由真实ZButton/ZLink等子组件拥有键盘和焦点语义；整行不会默认变成button。',
		'number 1与string 1是不同typed key；重复、NaN、Infinity和negative zero会在渲染前拒绝。',
		'嵌套列表使用手写li包裹内层ZList；大量数据使用ZVirtualList的list/listitem角色，不在ZList复制Virtualizer。'
	],
	keywords: [
		'list',
		'ordered list',
		'semantic list',
		'typed key',
		'empty list',
		'loading list',
		'virtual list'
	]
});
