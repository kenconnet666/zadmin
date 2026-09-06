import { stepsMetadata } from '@zadmin/zui/metadata';
import BasicDemo from './BasicDemo.svelte';
import basicSource from './BasicDemo.svelte?raw';
import RequestDemo from './RequestDemo.svelte';
import requestSource from './RequestDemo.svelte?raw';
import SizesDemo from './SizesDemo.svelte';
import sizesSource from './SizesDemo.svelte?raw';
import LayoutsDemo from './LayoutsDemo.svelte';
import layoutsSource from './LayoutsDemo.svelte?raw';
import { stepsApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const stepsDoc = defineComponentDoc(stepsMetadata, {
	profiles: ['collection'],
	sourceApi: stepsApiFacts,
	additionalApi: [
		{
			id: 'steps-instance',
			title: 'Steps 实例方法',
			description: '通过bind:this获得当前组件实例；该方法只管理本实例的当前位置。',
			rows: [
				{
					name: 'reset',
					type: '() => void',
					feature: 'instance',
					description:
						'恢复初始化时提供的currentKey，未提供时恢复defaultCurrentKey或null；同步绑定，但不触发onStepRequest/onCurrentKeyChange，不修改items.status或业务表单。'
				}
			]
		}
	],
	teaching: {
		summary:
			'流程导航保留真实ol/li和原生按钮/链接。currentKey表达当前位置，items.status表达业务完成或错误；请求与完成时机由调用方决定。',
		props: {
			currentKey: {
				default: 'defaultCurrentKey → null',
				description:
					'支持bind:currentKey；null只表示无当前步骤，未开始和全部完成应通过业务数据区分，完成由items.status表达。外部写入不发用户变更事件。'
			},
			defaultCurrentKey: {
				default: 'null',
				description:
					'一次性初始值；后续修改不会重置用户进度。实例reset()恢复初始化时currentKey或defaultCurrentKey，不触发用户事件；本组件不订阅form.reset。'
			},
			items: {
				default: '必填',
				description:
					'key保留字符串/数字身份，重排不改变当前项；移除当前key时保留业务值且不选择其他项。status默认pending，不按当前位置推断完成。StepsItem在类型和运行时都区分链接与按钮/被动分支：链接必须有href且禁止clickable，非链接禁止href/target/rel，clickable为true时才渲染按钮。'
			},
			orientation: {
				default: 'horizontal',
				description: 'horizontal均分可用宽度并在窄容器中换行；vertical保持纵向步骤和逻辑连接线。'
			},
			size: {
				default: 'Provider density',
				description:
					'五档marker高度24/28/32/40/48；文字和内部图标沿共享control/indicator比例，主题长度保持CSS单位。'
			}
		}
	},
	demos: [
		{
			id: 'steps-basic',
			title: '被动流程进度',
			component: BasicDemo,
			source: basicSource,
			description: '明确完成状态和当前key；被动步骤不伪装为可点击导航。',
			covers: ['basic-render', 'accessible-name', 'ssr', 'variants-and-states']
		},
		{
			id: 'steps-request',
			title: '可取消与延后确认',
			component: RequestDemo,
			source: requestSource,
			description:
				'点击只提出请求；消费者先取消自动切换，再明确接受或放弃。reset恢复本实例初始位置。',
			covers: ['controlled', 'keyboard', 'composition']
		},
		{
			id: 'steps-sizes',
			title: '五档尺寸与加载',
			component: SizesDemo,
			source: sizesSource,
			description: '完整五档比例与加载/禁用状态；加载时保持步骤业务状态并禁止再次激活。',
			covers: ['density', 'variants-and-states', 'full-motion', 'reduced-motion']
		},
		{
			id: 'steps-layouts',
			title: '方向、长描述与定制内容',
			component: LayoutsDemo,
			source: layoutsSource,
			description: 'RTL、纵向连接线、自然断行、原生href以及组件拥有语义的内容snippet。',
			covers: ['rtl', 'locale', 'native-props', 'composition', 'variants-and-states']
		}
	],
	accessibility: [
		'根是带可覆盖aria-label的真实ol，步骤是li；最多一个aria-current="step"，完成/错误有辅助技术可读文案。',
		'未配置href/clickable时显示被动内容。真实button使用Tab、Enter与Space，真实anchor保持Enter、修饰键、上下文菜单和目标窗口；没有tablist/tabpanel或方向键拦截。',
		'禁用/加载步骤不会发请求或改变位置；禁用链接没有可导航href且退出Tab顺序。loading通过aria-busy和状态文案表达，减少动画时Spinner停止循环。',
		'同步onStepRequest.preventDefault()取消切换和原生链接导航；异步处理必须在await之前取消，然后由调用方写currentKey。',
		'indicator是装饰区且aria-hidden。title和description snippet只提供内容，不应放交互控件或重新声明步骤ARIA角色。',
		'长文本自然断行；连接线是装饰伪元素，RTL使用逻辑定位，不通过镜像文字或改变DOM顺序实现。'
	],
	keywords: ['steps', 'stepper', 'workflow', 'aria-current', 'request', 'typed key', 'rtl']
});
