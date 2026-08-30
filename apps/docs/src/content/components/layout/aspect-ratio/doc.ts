import { aspectRatioMetadata } from '@zadmin/zui/metadata';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import GalleryDemo from './GalleryDemo.svelte';
import gallerySource from './GalleryDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const aspectRatioDoc = defineComponentDoc(aspectRatioMetadata, {
	demos: [
		{
			component: BasicDemo,
			description: '比例通过作用域CSS变量驱动原生aspect-ratio，动态更新不生成新结构规则。',
			id: 'aspect-ratio-basic',
			source: basicSource,
			title: '原生比例区域'
		},
		{
			component: GalleryDemo,
			description: '数字与宽高字符串都归一化为原生aspect-ratio。',
			id: 'aspect-ratio-gallery',
			source: gallerySource,
			title: '常用比例'
		}
	],
	accessibility: ['组件只负责尺寸关系；媒体内容仍需自己的alt、caption或可访问名称。']
});
