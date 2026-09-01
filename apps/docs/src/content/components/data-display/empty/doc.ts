import { emptyMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import MinimalDemo from './MinimalDemo.svelte';
import minimalSource from './MinimalDemo.svelte?raw';
import ContextsDemo from './ContextsDemo.svelte';
import contextsSource from './ContextsDemo.svelte?raw';
import CustomIconDemo from './CustomIconDemo.svelte';
import customIconSource from './CustomIconDemo.svelte?raw';
import LongDescriptionDemo from './LongDescriptionDemo.svelte';
import longDescriptionSource from './LongDescriptionDemo.svelte?raw';
import { emptyApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const emptyDoc = defineComponentDoc(emptyMetadata, {
	profiles: ['data-view'],
	sourceApi: emptyApiFacts,
	teaching: {
		props: {
			headingLevel: {
				default: '2',
				description: '投射到真实ZHeading level 1–6，按集合宿主的大纲选择。'
			},
			icon: {
				default: 'Inbox Lucide图标',
				description: 'Snippet替换默认图标；null显式隐藏。图标只用于视觉，不参与名称。'
			},
			ref: { default: 'null', description: '具名空状态section的真实HTMLElement引用。' },
			title: { default: '必填', description: '清楚说明集合为什么为空，而不是泛化为“错误”。' }
		},
		summary:
			'面向集合无数据、筛选无结果或初次创建的中性Empty：真实ZHeading、装饰图标、原因说明与可选恢复操作。'
	},
	demos: [
		{
			component: FormDemo,
			covers: ['accessible-name', 'basic-render', 'composition', 'keyboard'],
			description: '说明原因并给出一个主恢复路径。',
			id: 'empty-recovery',
			source,
			title: '可恢复空状态'
		},
		{
			component: MinimalDemo,
			covers: ['accessible-name', 'basic-render', 'variants-and-states'],
			description: '无操作空状态使用Lucide装饰图形并保持具名section。',
			id: 'empty-minimal',
			source: minimalSource,
			title: '最小空状态'
		},
		{
			component: ContextsDemo,
			covers: ['composition', 'native-props', 'variants-and-states'],
			description:
				'首次使用、筛选无结果和主动清空共享Empty边界，但说明、图标与恢复操作按上下文取舍。',
			id: 'empty-contexts',
			source: contextsSource,
			title: '三种集合为空上下文'
		},
		{
			component: CustomIconDemo,
			covers: ['accessible-name', 'composition', 'keyboard'],
			description: '自定义Lucide保持装饰性；说明与真实按钮提供理解和恢复路径。',
			id: 'empty-custom-icon',
			source: customIconSource,
			title: '自定义图标与创建操作'
		},
		{
			component: LongDescriptionDemo,
			covers: ['native-props', 'ssr', 'variants-and-states'],
			description: '真实h5、长CJK和连续英文标识安全换行；两个操作在窄容器内自动折行。',
			id: 'empty-long-description',
			source: longDescriptionSource,
			title: '长说明、标题层级与响应式操作'
		}
	],
	accessibility: [
		'section通过SSR稳定ID关联真实ZHeading；headingLevel支持1–6并按集合宿主页面大纲选择。',
		'默认和自定义图形都从可访问树隐藏；title与description完整解释集合为空的原因。',
		'操作使用真实button/link，允许响应式换行，避免让整个空状态成为点击目标。',
		'Empty只表达集合无数据、筛选无结果、初次创建或主动清空；操作失败和状态页使用ZResult。',
		'Empty没有loading prop；集合owner在请求期间组合ZSkeleton/ZSpinner，确定数据为空后再渲染Empty。',
		'参考Ant Empty采用image/description/footer分区与恢复引导；ZUI只接受Lucide/CSS或Snippet图标，不接受图片URL快捷API和全局renderEmpty单例。'
	],
	keywords: ['empty', 'no data', 'no results', 'first use', 'recovery', 'collection state']
});
