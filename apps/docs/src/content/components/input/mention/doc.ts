import { mentionMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const mentionDoc = defineComponentDoc(mentionMetadata, {
	demos: [
		{
			component: FormDemo,
			description: '在光标前输入@或#过滤成员；提交后替换当前片段，textarea焦点和光标位置保持。',
			id: 'mention-caret',
			source,
			title: '光标感知建议'
		}
	],
	accessibility: [
		'trigger只在文本开头、空白或标点后生效，避免把邮箱等普通文本误判为mention。',
		'textarea持有DOM焦点并通过aria-activedescendant指向建议；Enter/Tab提交，Escape只关闭。',
		'中文输入法组合期间不重算建议，compositionend后再按真实光标位置解析。'
	],
	keywords: ['mention', 'textarea', 'trigger', 'caret', 'active descendant']
});
