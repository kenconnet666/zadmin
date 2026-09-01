import { separatorMetadata } from '@zadmin/zui/metadata';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import SemanticsDemo from './SemanticsDemo.svelte';
import semanticsSource from './SemanticsDemo.svelte?raw';
import NamedDemo from './NamedDemo.svelte';
import namedSource from './NamedDemo.svelte?raw';
import NativeDemo from './NativeDemo.svelte';
import nativeSource from './NativeDemo.svelte?raw';
import { separatorApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const separatorDoc = defineComponentDoc(separatorMetadata, {
	profiles: ['primitive'],
	sourceApi: separatorApiFacts,
	teaching: {
		props: {
			decorative: { default: 'false', description: '纯视觉分隔线退出可访问树。' },
			label: { default: 'undefined', description: '语义separator的可访问名称；decorative时忽略。' },
			orientation: { default: "'horizontal'", description: '水平原生hr或垂直ARIA separator。' },
			ref: { default: 'null', description: '真实HTMLHRElement或HTMLDivElement引用。' }
		},
		summary: '保留原生/ARIA语义、装饰模式、名称、逻辑方向和currentColor高对比的最小Separator。'
	},
	demos: [
		{
			component: BasicDemo,
			covers: ['basic-render', 'native-props', 'variants-and-states'],
			description: '水平模式使用原生hr；垂直模式使用role=separator和aria-orientation。',
			id: 'separator-basic',
			source: basicSource,
			title: '水平与垂直语义'
		},
		{
			component: SemanticsDemo,
			covers: ['accessible-name', 'native-props'],
			description: 'decorative显式退出可访问树；默认分隔线表达真实内容边界。',
			id: 'separator-semantics',
			source: semanticsSource,
			title: '语义与装饰'
		},
		{
			component: NamedDemo,
			covers: ['accessible-name', 'composition'],
			description: '只在名称帮助理解页面边界时提供label；装饰线不携带名称。',
			id: 'separator-named',
			source: namedSource,
			title: '具名内容边界'
		},
		{
			component: NativeDemo,
			covers: ['native-props', 'rtl', 'variants-and-states'],
			description: '原生id/data属性、垂直stretch和currentColor forced-colors边界保持稳定。',
			id: 'separator-native',
			source: nativeSource,
			title: '原生属性与高对比'
		}
	],
	accessibility: [
		'默认表达真实内容边界；纯视觉场景必须设置decorative。',
		'垂直分隔线显式声明aria-orientation="vertical"。',
		'语义separator可具名；decorative同时设置presentation与aria-hidden并忽略名称。',
		'线条使用Theme border作为currentColor，允许forced-colors映射；不增加厚度/颜色/尺寸API。',
		'参考Radix Separator的orientation/decorative边界，不采用asChild或响应式样式props。'
	]
});
