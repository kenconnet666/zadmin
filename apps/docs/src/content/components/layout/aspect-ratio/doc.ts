import { aspectRatioMetadata } from '@zadmin/zui/metadata';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import GalleryDemo from './GalleryDemo.svelte';
import gallerySource from './GalleryDemo.svelte?raw';
import MediaDemo from './MediaDemo.svelte';
import mediaSource from './MediaDemo.svelte?raw';
import ResponsiveDemo from './ResponsiveDemo.svelte';
import responsiveSource from './ResponsiveDemo.svelte?raw';
import { aspectRatioApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const aspectRatioDoc = defineComponentDoc(aspectRatioMetadata, {
	profiles: ['primitive'],
	sourceApi: aspectRatioApiFacts,
	teaching: {
		props: {
			ratio: { default: "'16 / 9'", description: '正有限number或正有限width / height字符串。' },
			ref: { default: 'null', description: '真实比例div引用。' }
		},
		summary: '用原生CSS aspect-ratio、严格正有限比例和父级宽度约束承载图片、视频、自定义或空内容。'
	},
	demos: [
		{
			component: BasicDemo,
			covers: ['basic-render', 'native-props', 'variants-and-states'],
			description: '比例通过作用域CSS变量驱动原生aspect-ratio，动态更新不生成新结构规则。',
			id: 'aspect-ratio-basic',
			source: basicSource,
			title: '原生比例区域'
		},
		{
			component: GalleryDemo,
			covers: ['basic-render', 'composition', 'variants-and-states'],
			description: '数字与宽高字符串都归一化为原生aspect-ratio。',
			id: 'aspect-ratio-gallery',
			source: gallerySource,
			title: '常用比例'
		},
		{
			component: MediaDemo,
			covers: ['accessible-name', 'composition', 'native-props'],
			description: 'img和video保留自己的alt/label/controls，比例容器只拥有尺寸关系。',
			id: 'aspect-ratio-media',
			source: mediaSource,
			title: '图片与视频内容'
		},
		{
			component: ResponsiveDemo,
			covers: ['composition', 'native-props', 'ssr'],
			description: '长宽容器和无内容占位都受父级max-width约束，不创建测量器。',
			id: 'aspect-ratio-responsive',
			source: responsiveSource,
			title: '响应式、自定义与空内容'
		}
	],
	accessibility: [
		'组件只负责尺寸关系；媒体内容仍需自己的alt、caption、controls或可访问名称。',
		'number和width/height字符串都必须正且有限；0、负值、Infinity和非法CSS输入早失败。',
		'max-width:100%与min-width:0使比例区域服从窄父容器；无内容时仍保留布局空间。',
		'参考原生CSS/Chakra比例token思路，但不增加图片fit、overflow、breakpoint对象或ResizeObserver。'
	]
});
