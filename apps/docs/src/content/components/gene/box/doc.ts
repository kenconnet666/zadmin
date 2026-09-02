import { boxMetadata } from '@zadmin/zui/metadata';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import NativeDemo from './NativeDemo.svelte';
import nativeSource from './NativeDemo.svelte?raw';
import CompositionDemo from './CompositionDemo.svelte';
import compositionSource from './CompositionDemo.svelte?raw';
import VisibilityDemo from './VisibilityDemo.svelte';
import visibilitySource from './VisibilityDemo.svelte?raw';
import { boxApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const boxDoc = defineComponentDoc(boxMetadata, {
	profiles: ['primitive'],
	sourceApi: boxApiFacts,
	teaching: {
		props: {
			ref: { default: 'null', description: '绑定真实HTMLDivElement根节点。' }
		},
		summary: '零包装的div基础容器，原生属性、事件、class、style、ref与ICSS变量落到同一根节点。'
	},
	demos: [
		{
			covers: ['basic-render', 'composition'],
			component: BasicDemo,
			description: '使用ICSS class为ZBox添加视觉样式，不产生包装层。',
			id: 'box-basic',
			source: basicSource,
			title: '真实根元素'
		},
		{
			covers: ['focus', 'native-props'],
			component: NativeDemo,
			description: 'ARIA、tabindex、data、class、style和ref直接落到同一个真实div。',
			id: 'box-native',
			source: nativeSource,
			title: '原生属性与Ref'
		},
		{
			covers: ['composition', 'native-props'],
			component: CompositionDemo,
			description: 'Box作为无语义surface根组合Heading、Stack、Text与Button，不复制Card anatomy。',
			id: 'box-composition',
			source: compositionSource,
			title: '无包装组合边界'
		},
		{
			covers: ['native-props', 'variants-and-states'],
			component: VisibilityDemo,
			description: '原生hidden、role、data与长内容样式落到同一div，状态仍由调用方拥有。',
			id: 'box-native-visibility',
			source: visibilitySource,
			title: '原生可见性与长内容'
		}
	],
	accessibility: [
		'不伪造role；只有调用方明确需要region/group等语义时才传入原生role与名称。',
		'原生aria-*、data-*、hidden、事件、class、style和ref直接转发到唯一div。',
		'Box不是Card、Stack或交互控件，不拥有标题、布局、点击、焦点、loading与响应式状态。'
	]
});
