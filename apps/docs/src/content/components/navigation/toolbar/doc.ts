import { toolbarItemMetadata, toolbarMetadata } from '@zadmin/zui/metadata';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import ControlsDemo from './ControlsDemo.svelte';
import controlsSource from './ControlsDemo.svelte?raw';
import ToggleGroupDemo from './ToggleGroupDemo.svelte';
import toggleGroupSource from './ToggleGroupDemo.svelte?raw';
import OverflowDemo from './OverflowDemo.svelte';
import overflowSource from './OverflowDemo.svelte?raw';
import { toolbarApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const toolbarDoc = defineComponentDoc(toolbarMetadata, {
	members: [toolbarItemMetadata],
	profiles: ['collection', 'primitive'],
	sourceApi: toolbarApiFacts,
	teaching: {
		props: {
			gap: { default: "'small'", description: 'Toolbar项目之间的Theme间距。' },
			loop: { default: 'true', description: '方向键到边界时是否循环。' },
			orientation: { default: "'horizontal'", description: '逻辑方向和aria-orientation。' },
			size: {
				default: 'Provider componentDefaults或density',
				description: '传给Toolbar-aware第一方组合的五档尺寸。'
			}
		},
		summary:
			'以一个Toolbar焦点集合组合异构原生控件；ZToolbarItem不产生DOM，只为真实控件提供焦点和禁用属性。'
	},
	demos: [
		{
			component: BasicDemo,
			covers: ['accessible-name', 'basic-render', 'composition', 'native-props'],
			description:
				'真实保存按钮和原生导航链接通过children props注册到同一个Toolbar，ToolbarItem自身不增加DOM。',
			id: 'toolbar-basic',
			source: basicSource,
			title: '异构控件与原生链接'
		},
		{
			component: ControlsDemo,
			covers: ['composition', 'focus', 'keyboard', 'native-props'],
			description:
				'keyPolicy=control保留输入框自己的Arrow/Home/End编辑键，同时Toolbar仍处理不冲突的方向导航。',
			id: 'toolbar-control-policy',
			source: controlsSource,
			title: '编辑控件与键盘策略'
		},
		{
			component: ToggleGroupDemo,
			covers: ['composition', 'focus', 'keyboard', 'readonly', 'variants-and-states'],
			description:
				'两个ToggleGroup使用相同value字符串但各自拥有独立SelectionModel；焦点移动不自动改变pressed选择。',
			id: 'toolbar-toggle-groups',
			source: toggleGroupSource,
			title: 'ToggleGroup边界与选择所有权'
		},
		{
			component: OverflowDemo,
			covers: ['composition', 'focus', 'keyboard', 'variants-and-states'],
			description:
				'窄宽度下ZOverflowList折叠ToolbarItem；overflow trigger是真实ToolbarItem，Popover内隐藏命令使用普通Button。',
			id: 'toolbar-overflow',
			source: overflowSource,
			title: '窄屏溢出与焦点入口'
		}
	],
	accessibility: [
		'Toolbar根必须有aria-label或aria-labelledby；内部只保留一个roving Tab stop，Tab离开Toolbar。',
		'ZToolbarItem不产生DOM，children props必须spread到真实button、input或link；不要额外包装或嵌套button。',
		'keyPolicy=control尊重输入控件的编辑键；readonly/disabled由子控件和ToolbarItem分别表达，不混成一个状态。',
		'Overflow入口是唯一可聚焦ToolbarItem；Popover内隐藏命令是普通Button，不注册第二个Toolbar焦点集合。'
	]
});
