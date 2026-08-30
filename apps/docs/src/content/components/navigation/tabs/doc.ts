import {
	tabsListMetadata,
	tabsMetadata,
	tabsPanelMetadata,
	tabsTriggerMetadata
} from '@zadmin/zui/metadata';
import InteractiveDemo from './InteractiveDemo.svelte';
import interactiveSource from './InteractiveDemo.svelte?raw';
import ManualDemo from './ManualDemo.svelte';
import manualSource from './ManualDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const tabsDoc = defineComponentDoc(tabsMetadata, {
	members: [tabsListMetadata, tabsTriggerMetadata, tabsPanelMetadata],
	demos: [
		{
			component: InteractiveDemo,
			description: '焦点、激活值、Trigger/Panel ARIA关系和disabled跳过由共享Collection统一管理。',
			id: 'tabs-interactive',
			source: interactiveSource,
			title: '自动激活Tabs'
		},
		{
			component: ManualDemo,
			description: '垂直轴、manual激活和非循环焦点验证Trigger与Panel分离合同。',
			id: 'tabs-manual',
			source: manualSource,
			title: '手动激活的垂直Tabs'
		}
	],
	accessibility: [
		'List、Trigger和Panel分别使用tablist、tab和tabpanel角色。',
		'Trigger与Panel通过SSR稳定id、aria-controls和aria-labelledby双向关联。',
		'方向键、Home、End、RTL与automatic/manual激活遵循APG Tabs模式。'
	]
});
