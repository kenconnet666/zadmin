import { commandPaletteMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import ExternalTriggerDemo from './ExternalTriggerDemo.svelte';
import externalTriggerSource from './ExternalTriggerDemo.svelte?raw';
import PersistentDemo from './PersistentDemo.svelte';
import persistentSource from './PersistentDemo.svelte?raw';
import ControlledDemo from './ControlledDemo.svelte';
import controlledSource from './ControlledDemo.svelte?raw';
import ScopedShortcutDemo from './ScopedShortcutDemo.svelte';
import scopedShortcutSource from './ScopedShortcutDemo.svelte?raw';
import { commandPaletteApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const commandPaletteDoc = defineComponentDoc(commandPaletteMetadata, {
	profiles: ['collection', 'layer'],
	sourceApi: commandPaletteApiFacts,
	teaching: {
		props: {
			closeLabel: {
				default: 'localePack.common.close',
				description: '真实Dialog关闭按钮的名称；显式值优先于Provider locale。'
			},
			defaultOpen: {
				default: 'false',
				description: '非受控初始打开状态；后续内部状态仍由Dialog owner管理。'
			},
			defaultQuery: {
				default: "''",
				description: '非受控查询初值，也是resetQueryOnClose恢复目标。'
			},
			description: {
				default: 'undefined',
				description: '可选Dialog说明；缺失时不应产生悬空aria-describedby。'
			},
			disabled: {
				default: 'false',
				description: '同时禁用内置Trigger、快捷键打开与Command交互。'
			},
			emptyText: {
				default: 'localePack.command.empty',
				description: '过滤结果为空时的可见说明。'
			},
			inputLabel: {
				default: 'localePack.command.inputLabel',
				description: 'Command搜索输入的可访问名称。'
			},
			listLabel: {
				default: 'localePack.command.listLabel',
				description: '结果listbox的可访问名称。'
			},
			placeholder: {
				default: 'localePack.command.placeholder',
				description: '查询输入提示；不替代inputLabel。'
			},
			title: {
				default: 'localePack.command.paletteTitle',
				description: '真实Dialog标题与aria-labelledby owner。'
			},
			triggerLabel: {
				default: 'localePack.command.paletteTrigger',
				description: '内置Dialog Trigger的可访问名称。'
			}
		},
		summary:
			'CommandPalette只组合ZCommand的筛选/active-descendant与ZDialog的模态焦点/Portal，并以显式DOM作用域快捷键协调打开；路由、异步请求和业务确认由调用方拥有。'
	},
	demos: [
		{
			component: FormDemo,
			covers: ['accessible-name', 'focus', 'keyboard', 'portal'],
			description: '按钮或Ctrl/⌘+K打开；提交命令后关闭并恢复焦点，Escape与Tab复用Dialog合同。',
			id: 'command-palette-dialog',
			source,
			title: '模态快速操作'
		},
		{
			component: PersistentDemo,
			covers: ['composition', 'controlled', 'external-clear'],
			description: '自定义Lucide Trigger与关闭后保留查询验证可组合Palette合同。',
			id: 'command-palette-persistent',
			source: persistentSource,
			title: '自定义Trigger与查询持久化'
		},
		{
			component: ExternalTriggerDemo,
			covers: ['controlled', 'focus', 'portal'],
			description: 'showTrigger=false移除内置入口，由业务按钮和受控open拥有打开时机与焦点恢复。',
			id: 'command-palette-external-trigger',
			source: externalTriggerSource,
			title: '外部Trigger所有权'
		},
		{
			component: ControlledDemo,
			covers: ['controlled', 'external-clear', 'keyboard', 'variants-and-states'],
			description:
				'外部owner写open/query不伪造用户callback；可取消Action能保持Dialog打开并继续输入。',
			id: 'command-palette-controlled-query',
			source: controlledSource,
			title: 'Open、Query与Action所有权'
		},
		{
			component: ScopedShortcutDemo,
			covers: ['focus', 'keyboard', 'resource-cleanup'],
			description: '显式Element快捷键边界随ref建立/销毁，不回退到全局document争抢同一组合键。',
			id: 'command-palette-scoped-shortcut',
			source: scopedShortcutSource,
			title: 'DOM作用域快捷键'
		}
	],
	accessibility: [
		'Palette不复制过滤或键盘逻辑：ZCommand负责结果，ZDialog负责Portal、inert、scroll lock和focus trap。',
		'全局快捷键必须显式配置；未配置时组件不会监听document，多个Palette不会隐式争抢快捷键。',
		'onAction调用preventDefault可保持Palette打开，适合需要二次确认或继续输入的命令。',
		'open/query的外部owner写入不触发用户change callback；真实输入、Action、Escape与Trigger才产生对应状态转换。',
		'shortcutTarget可限定Document、Element或ShadowRoot；listener随作用域替换和卸载清理，null显式关闭快捷键。',
		'showTrigger=false时关闭焦点回到打开前的真实元素；组件不会为外部Trigger伪造第二个焦点owner。',
		'异步结果由调用方更新items与业务状态；Palette不观察Promise、不发请求，也不复制Command的筛选状态机。'
	],
	keywords: ['command palette', 'dialog', 'shortcut', 'focus trap', 'modal']
});
