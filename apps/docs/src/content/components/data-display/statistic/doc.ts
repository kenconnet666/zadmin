import { statisticMetadata } from '@zadmin/zui/metadata';
import AffixesDemo from './AffixesDemo.svelte';
import affixesSource from './AffixesDemo.svelte?raw';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import FormatterDemo from './FormatterDemo.svelte';
import formatterSource from './FormatterDemo.svelte?raw';
import PrecisionDemo from './PrecisionDemo.svelte';
import precisionSource from './PrecisionDemo.svelte?raw';
import StatesDemo from './StatesDemo.svelte';
import statesSource from './StatesDemo.svelte?raw';
import TrendDemo from './TrendDemo.svelte';
import trendSource from './TrendDemo.svelte?raw';
import { statisticApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const statisticDoc = defineComponentDoc(statisticMetadata, {
	profiles: ['data-view'],
	sourceApi: statisticApiFacts,
	teaching: {
		props: {
			formatOptions: {
				default: '{}',
				description: '直接传给Intl.NumberFormat；precision最后覆盖两个小数位选项。'
			},
			label: { default: '必填', description: '真实dt中的指标名称。' },
			locale: {
				default: 'Provider locale',
				description: '显式locale优先，确保服务端与客户端使用同一Intl格式合同。'
			},
			prefix: { default: '—', description: '值前Snippet，可组合Lucide图标或业务符号。' },
			ref: { default: 'null', description: '真实HTMLDListElement引用。' },
			suffix: { default: '—', description: '值后Snippet，用于单位等补充内容。' },
			trend: {
				default: 'undefined',
				description: '有限number百分比变化，例如12.4代表+12.4%。'
			},
			trendLabel: {
				default: '本地化百分比',
				description: '自定义具名趋势文字；不得只用颜色表达方向。'
			},
			value: {
				default: '必填',
				description:
					'有限number或任意精度bigint的静态值；Countdown和NumberAnimation是独立组件边界。'
			}
		},
		summary:
			'SSR稳定的静态指标：原生dl/data、Intl locale/precision、纯formatter、Snippet affix、有限tone、文字趋势与ZSkeleton loading。'
	},
	demos: [
		{
			component: FormDemo,
			covers: ['basic-render', 'locale', 'ssr', 'variants-and-states'],
			description: 'Provider locale驱动普通数字与货币，precision稳定财务小数位。',
			id: 'statistic-format',
			source,
			title: '数值、货币与趋势'
		},
		{
			component: AffixesDemo,
			covers: ['accessible-name', 'composition', 'native-props'],
			description: 'prefix和suffix组合Lucide与单位，机器值仍由data保留。',
			id: 'statistic-affixes',
			source: affixesSource,
			title: '前后缀与单位'
		},
		{
			component: PrecisionDemo,
			covers: ['basic-render', 'locale', 'variants-and-states'],
			description: 'precision用一个整数统一最小和最大小数位，避免显示位数漂移。',
			id: 'statistic-precision',
			source: precisionSource,
			title: '显式精度'
		},
		{
			component: FormatterDemo,
			covers: ['composition', 'locale', 'ssr'],
			description: '纯formatter消费解析后的locale，覆盖compact和bigint标识但不接管状态。',
			id: 'statistic-formatter',
			source: formatterSource,
			title: '自定义Formatter与BigInt'
		},
		{
			component: StatesDemo,
			covers: ['loading', 'native-props', 'variants-and-states'],
			description: 'loading复用ZSkeleton并保持dl结构；tone只表达有限业务语义。',
			id: 'statistic-states',
			source: statesSource,
			title: '加载与语义色调'
		},
		{
			component: TrendDemo,
			covers: ['accessible-name', 'locale', 'variants-and-states'],
			description: '上升、下降、中性与自定义trendLabel都保留可读符号和文字。',
			id: 'statistic-trend',
			source: trendSource,
			title: '本地化趋势'
		}
	],
	accessibility: [
		'dl/dt/dd表达指标名和值，data的value属性保留未格式化机器原值。',
		'趋势始终产生带正负号的文字；tone只作冗余视觉提示，不能替代trendLabel。',
		'loading在dl设置aria-busy并使用ZSkeleton稳定占位；实时监控公告由应用owner节流。',
		'显式locale可保证SSR与hydration使用同一Intl输出；使用Provider locale时服务端也必须注入相同值。',
		'参考Ant Design采用precision/formatter/prefix/suffix/loading，但遵循其最新拆分，不把Countdown或数字动画塞进Statistic状态机。'
	],
	keywords: ['statistic', 'intl', 'locale', 'precision', 'formatter', 'bigint', 'trend', 'loading']
});
