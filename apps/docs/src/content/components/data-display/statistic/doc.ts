import { statisticMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import AffixesDemo from './AffixesDemo.svelte';
import affixesSource from './AffixesDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const statisticDoc = defineComponentDoc(statisticMetadata, {
	demos: [
		{
			component: FormDemo,
			description: 'Provider locale驱动普通数字与货币格式。',
			id: 'statistic-format',
			source,
			title: '数值与趋势'
		},
		{
			component: AffixesDemo,
			description: 'prefix和suffix补充单位，数值本体仍由Intl格式化。',
			id: 'statistic-affixes',
			source: affixesSource,
			title: '前后缀与单位'
		}
	],
	accessibility: [
		'dl/dt/dd表达指标名和值，data保留机器可读原值。',
		'趋势必须包含正负文字，不只依赖颜色；trendLabel可本地化。',
		'Statistic不自行公告变化，实时监控由应用选择合适live region节流。'
	],
	keywords: ['statistic', 'intl', 'number', 'trend', 'currency']
});
