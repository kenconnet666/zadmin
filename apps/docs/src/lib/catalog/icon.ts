import { iconMetadata } from '@zadmin/zui/metadata';
import GalleryDemo from '../demos/IconGalleryDemo.svelte';
import gallerySource from '../demos/IconGalleryDemo.svelte?raw';
import { defineComponentDoc } from './types.js';

export const iconDoc = defineComponentDoc(iconMetadata, {
	demos: [
		{
			component: GalleryDemo,
			description: 'manifest只包含当前真实使用的受控图标。',
			id: 'icon-gallery',
			source: gallerySource,
			title: '内置图标'
		}
	],
	accessibility: ['没有可访问名称时设置aria-hidden。', '具名图标使用role=img。']
});
