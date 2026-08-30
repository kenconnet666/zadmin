import { iconMetadata } from '@zadmin/zui/metadata';
import GalleryDemo from './GalleryDemo.svelte';
import gallerySource from './GalleryDemo.svelte?raw';
import SemanticsDemo from './SemanticsDemo.svelte';
import semanticsSource from './SemanticsDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const iconDoc = defineComponentDoc(iconMetadata, {
	demos: [
		{
			component: GalleryDemo,
			description:
				'ZIcon提供常用名称封装；项目安装必需peer后，可从@lucide/svelte/icons/*直接使用完整图标组件。',
			id: 'icon-gallery',
			source: gallerySource,
			title: '受控图标与完整图标入口'
		},
		{
			component: SemanticsDemo,
			description: '装饰与具名图标采用不同ARIA合同，并支持token或数值尺寸。',
			id: 'icon-semantics',
			source: semanticsSource,
			title: '尺寸与可访问语义'
		}
	],
	accessibility: ['没有可访问名称时设置aria-hidden。', '具名图标使用role=img。']
});
