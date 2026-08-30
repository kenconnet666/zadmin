import { separatorMetadata } from '@zadmin/zui/metadata';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import SemanticsDemo from './SemanticsDemo.svelte';
import semanticsSource from './SemanticsDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const separatorDoc = defineComponentDoc(separatorMetadata, {
	demos: [
		{
			component: BasicDemo,
			description: '水平模式使用原生hr；垂直模式使用role=separator和aria-orientation。',
			id: 'separator-basic',
			source: basicSource,
			title: '水平与垂直语义'
		},
		{
			component: SemanticsDemo,
			description: 'decorative显式退出可访问树；默认分隔线表达真实内容边界。',
			id: 'separator-semantics',
			source: semanticsSource,
			title: '语义与装饰'
		}
	],
	accessibility: [
		'默认表达真实内容边界；纯视觉场景必须设置decorative。',
		'垂直分隔线显式声明aria-orientation="vertical"。'
	]
});
