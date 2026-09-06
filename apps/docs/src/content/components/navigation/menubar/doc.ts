import {
	menubarMetadata,
	menubarMenuMetadata,
	menubarTriggerMetadata,
	menubarContentMetadata
} from '@zadmin/zui/metadata';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import RtlControlledDemo from './RtlControlledDemo.svelte';
import rtlSource from './RtlControlledDemo.svelte?raw';
import CancelDemo from './CancelDemo.svelte';
import cancelSource from './CancelDemo.svelte?raw';
import { menubarApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const menubarDoc = defineComponentDoc(menubarMetadata, {
	members: [menubarMenuMetadata, menubarTriggerMetadata, menubarContentMetadata],
	profiles: ['collection', 'layer'],
	sourceApi: menubarApiFacts,
	teaching: {
		props: {
			defaultValue: { default: 'null', description: '初始打开的根菜单key。' },
			loop: { default: 'true', description: '根trigger方向导航是否循环。' },
			size: {
				default: 'Provider menubar → button → density',
				description: '根trigger与菜单行的五档尺寸。'
			},
			value: { default: 'null', description: '单开根菜单key；null表示关闭。' }
		},
		summary: '协调多个既有DropdownMenu的单开状态和根级menuitem焦点，菜单命令仍由ZMenu拥有。'
	},
	demos: [
		{
			component: BasicDemo,
			covers: ['accessible-name', 'basic-render', 'composition', 'keyboard'],
			description: '两个真实Dropdown菜单共享一个menubar焦点集合，内部命令使用ZMenuItem。',
			id: 'menubar-basic',
			source: basicSource,
			title: '根菜单与命令内容'
		},
		{
			component: RtlControlledDemo,
			covers: ['controlled', 'keyboard', 'rtl', 'variants-and-states'],
			description: 'RTL根trigger方向和受控value输出，ArrowDown/Up进入首项或末项。',
			id: 'menubar-rtl-controlled',
			source: rtlSource,
			title: 'RTL与受控打开状态'
		},
		{
			component: CancelDemo,
			covers: ['composition', 'focus', 'keyboard', 'variants-and-states'],
			description: '用户keydown和onAction可以取消内部导航或命令关闭，取消后保留当前焦点与菜单。',
			id: 'menubar-cancel',
			source: cancelSource,
			title: '取消与焦点恢复'
		}
	],
	accessibility: [
		'根是具名role=menubar，只有一个Tab入口；Tab离开整个menubar，方向键在根trigger间移动。',
		'菜单内容继续使用ZMenu的menu/menuitem/typeahead/checkbox/radio/submenu语义，不把menubar触发器当menuitem内容。',
		'根value只表达单开菜单，不等于业务selection；Escape和action完成后恢复对应真实trigger。'
	]
});
