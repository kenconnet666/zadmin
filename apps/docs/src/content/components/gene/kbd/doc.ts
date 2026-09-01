import { kbdMetadata } from '@zadmin/zui/metadata';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import SequencesDemo from './SequencesDemo.svelte';
import sequencesSource from './SequencesDemo.svelte?raw';
import NestedDemo from './NestedDemo.svelte';
import nestedSource from './NestedDemo.svelte?raw';
import PlatformDemo from './PlatformDemo.svelte';
import platformSource from './PlatformDemo.svelte?raw';
import { kbdApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const kbdDoc = defineComponentDoc(kbdMetadata, {
	profiles: ['primitive'],
	sourceApi: kbdApiFacts,
	teaching: {
		props: { ref: { default: 'null', description: '真实HTMLElement/kbd引用。' } },
		summary: '只表达用户输入文本的原生kbd；组合、嵌套和平台替代文本由调用方显式组织。'
	},
	demos: [
		{
			component: BasicDemo,
			covers: ['basic-render', 'composition', 'native-props'],
			description: '使用原生kbd元素组合跨平台快捷键说明。',
			id: 'kbd-basic',
			source: basicSource,
			title: '快捷键序列'
		},
		{
			component: SequencesDemo,
			covers: ['composition', 'native-props'],
			description: '组合键和单键都使用可读文字保持正确顺序。',
			id: 'kbd-sequences',
			source: sequencesSource,
			title: '常用按键组合'
		},
		{
			component: PlatformDemo,
			covers: ['accessible-name', 'composition', 'native-props'],
			description: '应用显式提供Ctrl/Command等替代文本；符号可使用aria-label，但组件不侦测平台。',
			id: 'kbd-platform',
			source: platformSource,
			title: '平台替代文本'
		},
		{
			component: NestedDemo,
			covers: ['composition', 'ssr'],
			description: '原生kbd允许外层完整输入与内层单键，也允许调用方提供菜单路径文字。',
			id: 'kbd-nested',
			source: nestedSource,
			title: '嵌套组合与输入序列'
		}
	],
	accessibility: [
		'kbd是文本语义，不自动注册或监听快捷键。',
		'按键顺序和分隔符必须用可读文本表达；符号键可用aria-label补充名称。',
		'组件不读取navigator、不猜测OS、不把Ctrl自动替换成Command。',
		'参考MDN的多kbd嵌套输入语义和Chakra组合示例，不增加keys数组、平台map、variant或size API。'
	]
});
