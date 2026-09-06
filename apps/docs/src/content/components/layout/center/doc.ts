import { centerMetadata } from '@zadmin/zui/metadata';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import InlineDemo from './InlineDemo.svelte';
import inlineSource from './InlineDemo.svelte?raw';
import { centerApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const centerDoc = defineComponentDoc(centerMetadata, {
	profiles: ['primitive'],
	sourceApi: centerApiFacts,
	teaching: {
		props: {
			inline: { default: 'false', description: 'block flex或inline-flex，两个轴始终居中。' },
			ref: { default: 'null', description: '真实中心div引用。' }
		},
		summary: '不测量内容的原生双轴居中容器；inline只控制外部格式，不改变居中算法。'
	},
	demos: [
		{
			component: BasicDemo,
			covers: ['basic-render', 'composition', 'native-props'],
			description: '块级Center在调用方给定的可用区域内居中普通内容。',
			id: 'center-block',
			source: basicSource,
			title: '块级两轴居中'
		},
		{
			component: InlineDemo,
			covers: ['composition', 'native-props', 'rtl'],
			description: 'inline-flex在文本流中保留自身盒子，同时居中其中的Tag。',
			id: 'center-inline',
			source: inlineSource,
			title: '行内中心容器'
		}
	],
	accessibility: [
		'根保持div，不添加role、焦点或名称；内容语义与交互属于调用方。',
		'align-items和justify-content都为center；RTL不会改变DOM或键盘顺序。',
		'Center不指定宽高或最小高度，因此可用居中区域由宿主布局与原生style决定。'
	],
	keywords: ['center', 'flex', 'inline flex', 'alignment', 'layout']
});
