import { descriptionListMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import DetailsDemo from './DetailsDemo.svelte';
import detailsSource from './DetailsDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
export const descriptionListDoc = defineComponentDoc(descriptionListMetadata, {
	demos: [
		{
			component: FormDemo,
			description: '键值信息直接使用dl/dt/dd。',
			id: 'description-list-basic',
			source,
			title: '部署详情'
		},
		{
			component: DetailsDemo,
			description: '多项发布元数据继续使用原生dl、dt和dd。',
			id: 'description-list-details',
			source: detailsSource,
			title: '发布详情'
		}
	],
	accessibility: ['term使用dt、说明使用dd，不以Grid伪造键值语义。'],
	keywords: ['description list', 'dl', 'metadata']
});
