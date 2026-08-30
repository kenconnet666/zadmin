import { cardMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import VariantsDemo from './VariantsDemo.svelte';
import variantsSource from './VariantsDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
export const cardDoc = defineComponentDoc(cardMetadata, {
	demos: [
		{
			component: FormDemo,
			description: 'article、header、body与footer保持真实内容结构。',
			id: 'card-anatomy',
			source,
			title: 'Card Anatomy'
		},
		{
			component: VariantsDemo,
			description: '最小正文和带操作Card使用同一article anatomy。',
			id: 'card-variants',
			source: variantsSource,
			title: '最小与操作Card'
		}
	],
	accessibility: [
		'Card根是article；标题层级由header内容自行选择。',
		'整卡可点击时由调用方使用单一link覆盖，不嵌套交互元素。'
	],
	keywords: ['card', 'article', 'header', 'footer']
});
