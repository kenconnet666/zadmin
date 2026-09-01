import { containerMetadata } from '@zadmin/zui/metadata';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import SizesDemo from './SizesDemo.svelte';
import sizesSource from './SizesDemo.svelte?raw';
import NestedDemo from './NestedDemo.svelte';
import nestedSource from './NestedDemo.svelte?raw';
import ResponsiveDemo from './ResponsiveDemo.svelte';
import responsiveSource from './ResponsiveDemo.svelte?raw';
import { containerApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const containerDoc = defineComponentDoc(containerMetadata, {
	profiles: ['primitive'],
	sourceApi: containerApiFacts,
	teaching: {
		props: {
			gutter: { default: "'medium'", description: '逻辑padding-inline token；none显式关闭。' },
			ref: { default: 'null', description: '真实容器div引用。' },
			size: { default: "'medium'", description: 'small/medium/large最大宽度或full流体边界。' }
		},
		summary: '用box-sizing安全的居中typed max-width和逻辑gutter建立内容边界，不承担Stack/Grid职责。'
	},
	demos: [
		{
			component: BasicDemo,
			covers: ['basic-render', 'native-props', 'rtl'],
			description: '最大宽度与gutter正交，使用margin-inline:auto和padding-inline。',
			id: 'container-basic',
			source: basicSource,
			title: '居中内容边界'
		},
		{
			component: SizesDemo,
			covers: ['density', 'variants-and-states'],
			description: '三种最大宽度与gutter组合覆盖内容密度需求。',
			id: 'container-sizes',
			source: sizesSource,
			title: '尺寸与Gutter'
		},
		{
			component: NestedDemo,
			covers: ['composition', 'native-props', 'variants-and-states'],
			description: '嵌套容器各自拥有明确max-width/gutter；不会隐式取消或合并父级padding。',
			id: 'container-nested',
			source: nestedSource,
			title: '嵌套内容边界'
		},
		{
			component: ResponsiveDemo,
			covers: ['composition', 'native-props', 'ssr'],
			description: 'full、窄屏、长内容和显式gutter使用border-box，不把100%宽度撑出视口。',
			id: 'container-responsive',
			source: responsiveSource,
			title: 'Full、窄屏与长内容'
		}
	],
	accessibility: [
		'不增加landmark或role；需要main、section等语义时由调用方在外层使用原生元素。',
		'padding-inline自动遵循RTL；box-sizing:border-box确保gutter计入100%宽度。',
		'size=full只关闭max-width限制，不隐式关闭gutter；嵌套容器不会猜测父级。',
		'参考MUI Container的maxWidth/gutter职责，但不采用breakpoint fixed、任意component、sx或Grid API。'
	]
});
