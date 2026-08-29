import GalleryDemo from '../demos/icon/GalleryDemo.svelte';
import gallerySource from '../demos/icon/GalleryDemo.svelte?raw';
import { defineComponentDoc } from './types.js';

export const iconDoc = defineComponentDoc({
	id: 'icon',
	category: 'gene',
	name: 'ZIcon',
	summary: '由受控manifest生成的SVG图标，禁止注入任意SVG字符串。',
	importStatement: "import { ZIcon } from '@zadmin/zui';",
	source: 'ui/zui/src/lib/components/gene/ZIcon.svelte',
	demos: [
		{
			id: 'icon-gallery',
			title: '内置图标',
			description: '当前manifest保持在真实使用的少量图标范围。',
			component: GalleryDemo,
			source: gallerySource
		}
	],
	api: [
		{
			title: 'Props',
			rows: [
				{
					name: 'name',
					type: 'keyof typeof iconManifest',
					default: '必填',
					description: '受控manifest图标名。'
				},
				{
					name: 'size',
					type: "keyof ZuiTheme['size'] | number",
					default: "'medium'",
					description: 'Theme尺寸token或明确像素数值。'
				},
				{
					name: 'label',
					type: 'string',
					default: '—',
					description: '有label时生成可访问图像名称。'
				},
				{ name: 'ref', type: 'SVGSVGElement | null', default: 'null', description: '真实svg引用。' }
			]
		}
	],
	accessibility: ['没有label时设置aria-hidden=true。', '有label时使用role=img与可访问名称。']
});
