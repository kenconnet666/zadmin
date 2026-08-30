import { commandPaletteMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import ExternalTriggerDemo from './ExternalTriggerDemo.svelte';
import externalTriggerSource from './ExternalTriggerDemo.svelte?raw';
import PersistentDemo from './PersistentDemo.svelte';
import persistentSource from './PersistentDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const commandPaletteDoc = defineComponentDoc(commandPaletteMetadata, {
	demos: [
		{
			component: FormDemo,
			description: '按钮或Ctrl/⌘+K打开；提交命令后关闭并恢复焦点，Escape与Tab复用Dialog合同。',
			id: 'command-palette-dialog',
			source,
			title: '模态快速操作'
		},
		{
			component: PersistentDemo,
			description: '自定义Lucide Trigger与关闭后保留查询验证可组合Palette合同。',
			id: 'command-palette-persistent',
			source: persistentSource,
			title: '自定义Trigger与查询持久化'
		},
		{
			component: ExternalTriggerDemo,
			description: 'showTrigger=false移除内置入口，由业务按钮和受控open拥有打开时机与焦点恢复。',
			id: 'command-palette-external-trigger',
			source: externalTriggerSource,
			title: '外部Trigger所有权'
		}
	],
	accessibility: [
		'Palette不复制过滤或键盘逻辑：ZCommand负责结果，ZDialog负责Portal、inert、scroll lock和focus trap。',
		'全局快捷键必须显式配置；未配置时组件不会监听document，多个Palette不会隐式争抢快捷键。',
		'onAction调用preventDefault可保持Palette打开，适合需要二次确认或继续输入的命令。'
	],
	keywords: ['command palette', 'dialog', 'shortcut', 'focus trap', 'modal']
});
