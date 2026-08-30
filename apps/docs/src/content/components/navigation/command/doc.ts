import { commandMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const commandDoc = defineComponentDoc(commandMetadata, {
	demos: [
		{
			component: FormDemo,
			description: '输入保持焦点；结果按标签、词首、关键词和子序列相关性排序，并保留稳定分组。',
			id: 'command-ranked',
			source,
			title: '相关性命令搜索'
		}
	],
	accessibility: [
		'输入使用combobox与aria-activedescendant，结果是分组listbox；disabled命令可见但不可active。',
		'ArrowUp/Down按loop策略移动，Home/End定位边界，Enter发送可取消CommandActionEvent。',
		'shouldFilter=false时ZCommand只管理键盘与action，允许服务端或业务层提供已排序结果。'
	],
	keywords: ['command', 'ranked filter', 'active descendant', 'keyboard', 'action']
});
