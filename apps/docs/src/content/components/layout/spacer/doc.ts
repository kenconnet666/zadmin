import { spacerMetadata } from '@zadmin/zui/metadata';
import AxisDemo from './AxisDemo.svelte';
import axisSource from './AxisDemo.svelte?raw';
import ResponsiveDemo from './ResponsiveDemo.svelte';
import responsiveSource from './ResponsiveDemo.svelte?raw';
import { spacerApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const spacerDoc = defineComponentDoc(spacerMetadata, {
	profiles: ['primitive'],
	sourceApi: spacerApiFacts,
	teaching: {
		props: {
			inlineSize: {
				default: "'medium'",
				description: '逻辑内联留白：通用space token、非负px数字或会由CSS解析为长度的表达式。'
			},
			blockSize: {
				default: "'none'",
				description: '逻辑块留白；不改变父容器gap。'
			},
			query: { default: "'viewport'", description: '响应式轴尺寸的viewport或命名容器参照。' },
			ref: { default: 'null', description: '真实留白div引用。' }
		},
		summary:
			'一个固定逻辑尺寸的普通div。它表达某一处显式留白，不会修改父布局的gap、也不充当自动弹性填充物。'
	},
	demos: [
		{
			component: AxisDemo,
			covers: ['basic-render', 'composition', 'native-props', 'rtl'],
			description: 'inlineSize与blockSize独立表达横向/纵向留白，并使用通用space token。',
			id: 'spacer-axes',
			source: axisSource,
			title: '逻辑两轴尺寸'
		},
		{
			component: ResponsiveDemo,
			covers: ['composition', 'native-props', 'ssr'],
			description: '响应式尺寸只生成CSS断点规则，不读取视口或内容宽度。',
			id: 'spacer-responsive',
			source: responsiveSource,
			title: '响应式内联留白'
		}
	],
	accessibility: [
		'根保持空div语义，不增加role、焦点停靠点或可访问名称。Spacer只能用于确实需要空白盒子的布局位置。',
		'inlineSize/blockSize是逻辑轴，RTL与垂直书写模式由CSS处理；该元素不改变DOM阅读或Tab顺序。',
		'它不写父容器gap，也不隐藏相邻内容。要在一组所有项间保持一致间距，请使用Group或Stack的gap。'
	],
	keywords: ['spacer', 'space', 'inline size', 'block size', 'responsive', 'layout']
});
