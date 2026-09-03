import { tagMetadata } from '@zadmin/zui/metadata';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import StatesDemo from './StatesDemo.svelte';
import statesSource from './StatesDemo.svelte?raw';
import LocaleDemo from './LocaleDemo.svelte';
import localeSource from './LocaleDemo.svelte?raw';
import LongRtlDemo from './LongRtlDemo.svelte';
import longRtlSource from './LongRtlDemo.svelte?raw';
import OwnershipDemo from './OwnershipDemo.svelte';
import ownershipSource from './OwnershipDemo.svelte?raw';
import SizeDemo from './SizeDemo.svelte';
import sizeSource from './SizeDemo.svelte?raw';
import { tagApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
export const tagDoc = defineComponentDoc(tagMetadata, {
	profiles: ['data-view'],
	sourceApi: tagApiFacts,
	teaching: {
		props: {
			children: { default: 'undefined', description: '静态分类正文；支持文本和有限装饰内容。' },
			disabled: {
				default: 'false',
				description: '只禁用remove按钮，不把静态Tag伪装成disabled控件。'
			},
			onRemove: {
				description: '发送移除请求且阻止冒泡到父级卡片/行；可见性和集合状态仍由调用方拥有。'
			},
			removeLabel: {
				default: 'localePack.tag.removeTag(textValue)',
				description: '显式名称优先；默认typed locale可结合可读textValue生成上下文名称。'
			},
			removeTabIndex: {
				default: '0',
				description: '仅允许0/-1；独立Tag用0，拥有方向键/焦点恢复的TagsInput用-1。'
			},
			removable: {
				default: 'false',
				description: '只增加真实button；不会自动删除Tag或创建TagGroup。'
			},
			size: {
				default: 'componentDefaults.tag.size或Provider density',
				description: '显式small/medium优先；否则使用严格Provider组件默认，最后由density解析。'
			},
			tone: {
				default: "componentDefaults.tag.tone或'default'",
				description:
					'显式语义tone优先于严格Provider组件默认；文字、边框和currentColor混合背景在高对比时仍保留边界。'
			}
		},
		summary:
			'Tag是静态分类标签与可选remove动作；集合编辑、方向键和删除后焦点属于TagsInput，count/dot overlay属于Badge。'
	},
	demos: [
		{
			component: FormDemo,
			covers: ['accessible-name', 'controlled', 'keyboard'],
			description: '可移除Tag把状态所有权留给调用方并提供具名按钮。',
			id: 'tag-remove',
			source,
			title: '可移除Tag'
		},
		{
			component: StatesDemo,
			covers: ['disabled', 'variants-and-states'],
			description: '语义tone与禁用移除状态保持正交。',
			id: 'tag-states',
			source: statesSource,
			title: '语义与禁用状态'
		},
		{
			component: SizeDemo,
			covers: ['composition', 'density', 'variants-and-states'],
			description: 'small/medium有限尺寸与Provider density继承，显式size优先。',
			id: 'tag-sizes-density',
			source: sizeSource,
			title: '尺寸与Density'
		},
		{
			component: LongRtlDemo,
			covers: ['composition', 'rtl', 'variants-and-states'],
			description: '高对比RTL窄容器中的长标识符、CJK和阿拉伯文安全换行。',
			id: 'tag-long-rtl',
			source: longRtlSource,
			title: '长内容、高对比与RTL'
		},
		{
			component: OwnershipDemo,
			covers: ['composition', 'focus', 'keyboard'],
			description: '独立Tag保持remove Tab入口；TagsInput拥有内部roving、集合变更和焦点恢复。',
			id: 'tag-focus-owner',
			source: ownershipSource,
			title: 'Standalone与TagsInput所有权'
		},
		{
			component: LocaleDemo,
			covers: ['accessible-name', 'controlled', 'locale'],
			description: '默认tag.removeTag、Provider override和显式removeLabel的优先级。',
			id: 'tag-locale-remove',
			source: localeSource,
			title: 'Typed Locale移除名称'
		}
	],
	accessibility: [
		'静态Tag根保持span且不加入Tab顺序；不要用Tag替代button、link、checkbox或选择控件。',
		'remove是真实button；默认名称来自typed locale，可用textValue补上下文，显式removeLabel优先。',
		'remove click固定停止冒泡，避免同时触发父Card/List row操作；组件只通知onRemove，不自动卸载。',
		'独立Tag的removeTabIndex为0；仅拥有方向键与删除后focus恢复的TagsInput等复合owner可传-1。',
		'disabled只禁用remove按钮；Tag的分类文本仍可被阅读，删除后的焦点目标由集合owner决定。',
		'语义tone同时使用文字、边框和相对currentColor背景；长文本允许安全换行，高对比不只依赖填充色。',
		'参考Ant Design Tag的content/close/status表面和MUI Chip的small/medium与delete action，但拒绝href/clickable/checkable、TagGroup、任意颜色和内部数组状态。'
	],
	keywords: ['tag', 'remove', 'label', 'locale', 'chip', 'long content', 'focus owner']
});
