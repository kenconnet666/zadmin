import { boxMetadata } from '@zadmin/zui/metadata';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import NativeDemo from './NativeDemo.svelte';
import nativeSource from './NativeDemo.svelte?raw';
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
		}
	],
	accessibility: ['不伪造role。', '原生aria-*、data-*和事件直接转发到div。']
});
