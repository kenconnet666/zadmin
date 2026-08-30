import { carouselMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const carouselDoc = defineComponentDoc(carouselMetadata, {
	demos: [
		{
			component: FormDemo,
			description: '稳定slide key、显式rotation control和直接跳转保持同一value。',
			id: 'carousel-controls',
			source,
			title: '可暂停轮播'
		}
	],
	accessibility: [
		'根使用具名region与carousel roledescription，每个slide具备全局位置和名称。',
		'自动轮播存在时必须渲染暂停/开始按钮；焦点进入、hover和reduced-motion都会暂停。',
		'自动旋转时viewport aria-live=off，暂停后切换为polite，避免连续公告。',
		'上一张、下一张和直接跳转均使用原生button，不劫持页面方向键。'
	],
	keywords: ['carousel', 'slides', 'autoplay', 'reduced motion', 'rotation control']
});
