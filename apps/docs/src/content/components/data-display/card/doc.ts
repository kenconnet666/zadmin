import { cardMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import formSource from './FormDemo.svelte?raw';
import LoadingDemo from './LoadingDemo.svelte';
import loadingSource from './LoadingDemo.svelte?raw';
import MediaActionsDemo from './MediaActionsDemo.svelte';
import mediaActionsSource from './MediaActionsDemo.svelte?raw';
import SemanticRootsDemo from './SemanticRootsDemo.svelte';
import semanticRootsSource from './SemanticRootsDemo.svelte?raw';
import VariantsDemo from './VariantsDemo.svelte';
import variantsSource from './VariantsDemo.svelte?raw';
import { cardApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const cardDoc = defineComponentDoc(cardMetadata, {
	profiles: ['data-view'],
	sourceApi: cardApiFacts,
	teaching: {
		props: {
			actions: {
				default: '—',
				description: '与正文分离的补充操作集合；不会把整张Card伪装成button。'
			},
			as: {
				default: "'div'",
				description: '默认中性div；article和section必须由调用方提供真实标题关系。'
			},
			children: { default: '—', description: 'Card正文；loading时暂由内置Skeleton替换。' },
			footer: { default: '—', description: '补充说明区域，不承担主要操作。' },
			header: { default: '—', description: '标题与摘要区域；标题层级由调用方拥有。' },
			loading: {
				default: 'false',
				description: '在body显示ZSkeleton并设置aria-busy，media/header/footer/actions保持挂载。'
			},
			media: { default: '—', description: '位于Card首部且不带内边距的媒体区域。' },
			ref: { default: 'null', description: '当前真实div/article/section根引用。' },
			variant: {
				default: "componentDefaults.card.variant或'elevated'",
				description:
					'显式variant优先于严格Provider组件默认；elevated使用Theme阴影，outlined使用Theme边框。'
			}
		},
		summary:
			'以默认中性div避免article泛滥，按固定media→header→body→footer→actions顺序组合语义内容面。'
	},
	demos: [
		{
			component: VariantsDemo,
			covers: ['basic-render', 'variants-and-states'],
			description: 'elevated与outlined只改变surface视觉，不改变内容所有权。',
			id: 'card-variants',
			source: variantsSource,
			title: 'Surface变体'
		},
		{
			component: FormDemo,
			covers: ['accessible-name', 'composition', 'native-props'],
			description: '可独立分发的发布记录显式选择article并关联真实标题。',
			id: 'card-anatomy',
			source: formSource,
			title: '独立Article Anatomy'
		},
		{
			component: MediaActionsDemo,
			covers: ['composition', 'native-props'],
			description: '媒体、标题、正文和补充操作使用固定区域顺序，避免嵌套交互魔法。',
			id: 'card-media-actions',
			source: mediaActionsSource,
			title: '媒体与补充操作'
		},
		{
			component: LoadingDemo,
			covers: ['loading', 'variants-and-states'],
			description: 'loading替换body并暴露busy语义，非正文结构继续稳定挂载。',
			id: 'card-loading',
			source: loadingSource,
			title: '加载占位'
		},
		{
			component: SemanticRootsDemo,
			covers: ['accessible-name', 'native-props'],
			description: '默认div、页面section与独立article由真实内容语义决定，而不是由视觉决定。',
			id: 'card-semantic-roots',
			source: semanticRootsSource,
			title: '显式根语义'
		}
	],
	accessibility: [
		'默认根是div；只有可独立分发的单一主题使用article，页面章节使用section并关联标题。',
		'loading设置aria-busy且只替换body；业务完成公告由调用方自己的status或页面状态承担。',
		'整卡不是隐式button。主操作使用真实ZLink，补充操作放入actions，避免嵌套交互目标。',
		'参考取舍：采用MUI的surface/media/actions职责分离和Ant的loading/outlined能力；不复制ActionArea、tabs、Meta、Grid、hoverable或无限styles map。'
	],
	keywords: ['card', 'surface', 'article', 'section', 'media', 'actions', 'loading']
});
