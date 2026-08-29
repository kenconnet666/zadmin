import { separatorMetadata } from '@zadmin/zui/metadata';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const separatorDoc = defineComponentDoc(separatorMetadata, {
	demos: [
		{
			component: BasicDemo,
			description: '水平模式使用原生hr；垂直模式使用role=separator和aria-orientation。',
			id: 'separator-basic',
			source: basicSource,
			title: '水平与垂直语义'
		}
	],
	accessibility: [
		'只用于表达真实内容边界，不应代替纯装饰边框。',
		'垂直分隔线显式声明aria-orientation="vertical"。'
	]
});
