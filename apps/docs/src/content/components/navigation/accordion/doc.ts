import {
	accordionContentMetadata,
	accordionItemMetadata,
	accordionMetadata,
	accordionTriggerMetadata
} from '@zadmin/zui/metadata';
import { accordionApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';
import ControlledDynamicDemo from './ControlledDynamicDemo.svelte';
import controlledDynamicSource from './ControlledDynamicDemo.svelte?raw';
import InteractiveDemo from './InteractiveDemo.svelte';
import interactiveSource from './InteractiveDemo.svelte?raw';
import InlineAppearanceDemo from './InlineAppearanceDemo.svelte';
import inlineAppearanceSource from './InlineAppearanceDemo.svelte?raw';
import MotionDemo from './MotionDemo.svelte';
import motionSource from './MotionDemo.svelte?raw';
import MultipleDemo from './MultipleDemo.svelte';
import multipleSource from './MultipleDemo.svelte?raw';
import NestedDemo from './NestedDemo.svelte';
import nestedSource from './NestedDemo.svelte?raw';
import RuntimeModeDemo from './RuntimeModeDemo.svelte';
import runtimeModeSource from './RuntimeModeDemo.svelte?raw';

export const accordionDoc = defineComponentDoc(accordionMetadata, {
	members: [accordionItemMetadata, accordionTriggerMetadata, accordionContentMetadata],
	profiles: ['collection', 'animated'],
	sourceApi: accordionApiFacts,
	teaching: {
		props: {
			appearance: {
				default: "'block'",
				description:
					'Trigger布局；inline适合卡片工具栏或行内disclosure，保留open/disabled和主题色状态。'
			},
			activeValue: {
				default: 'selected key或第一enabled key',
				description: '与展开selection分离的roving焦点owner；动态恢复不触发用户回调。'
			},
			collapsible: {
				default: 'true（仅single）',
				description: 'false时已展开Trigger使用aria-disabled并拒绝关闭，但仍能参与焦点导航。'
			},
			defaultActiveValue: {
				default: 'null',
				description: '非受控初始active typed key。'
			},
			defaultValue: {
				default: 'single: null；multiple: []',
				description:
					'扁平组件prop接受AccordionValue；运行时严格按type校验，静态配置可用single/multiple helper收窄。'
			},
			disabled: { default: 'false', description: '禁用根与全部Trigger，不改变已展开内容值。' },
			loop: { default: 'true', description: 'CollectionNavigation到边界时是否循环。' },
			onActiveValueChange: {
				default: 'undefined',
				description: '真实用户/键盘active变化时调用；collection恢复不调用。'
			},
			onValueChange: {
				default: 'undefined',
				description:
					'真实用户toggle后按当前运行时mode调用一次；扁平组件签名避免Svelte ComponentProps分发联合。'
			},
			type: {
				default: "'single'",
				description:
					'选择single/null或multiple/array运行时合同；不再把整个Svelte组件声明为判别联合。'
			},
			value: {
				default: 'single: null；multiple: []',
				description:
					'扁平AccordionValue owner；number 1与string 1保持严格身份，错误shape在运行时早失败。'
			}
		},
		summary:
			'生产Accordion compound collection：组件props保持扁平以服务Svelte绑定和ComponentProps，严格single/multiple helper服务静态配置，运行时仍校验值shape并保留LogicalCollection、active焦点、nested与Presence。'
	},
	demos: [
		{
			component: InlineAppearanceDemo,
			covers: ['basic-render', 'composition', 'variants-and-states'],
			description:
				'inline让Trigger适合工具栏或行内disclosure，仍由真实button和Accordion关系管理状态。',
			id: 'accordion-inline-appearance',
			source: inlineAppearanceSource,
			title: 'Inline Trigger外观'
		},
		{
			component: InteractiveDemo,
			covers: ['basic-render', 'controlled', 'focus', 'keyboard', 'variants-and-states'],
			description:
				'single nullable状态、enabled roving焦点、disabled跳过和Content Presence共享一份typed Item合同。',
			id: 'accordion-interactive',
			source: interactiveSource,
			title: 'Single展开、焦点与生命周期'
		},
		{
			component: MultipleDemo,
			covers: ['controlled', 'keyboard', 'uncontrolled'],
			description:
				'multiple只接受去重readonly typed-key数组；各Panel独立展开，loop=false夹紧active焦点。',
			id: 'accordion-multiple',
			source: multipleSource,
			title: 'Multiple展开与导航边界'
		},
		{
			component: ControlledDynamicDemo,
			covers: ['controlled', 'external-clear', 'focus', 'resource-cleanup'],
			description:
				'number 1/string 1、独立active owner、外部null、动态删除和重排验证nearest enabled恢复。',
			id: 'accordion-controlled-dynamic',
			source: controlledDynamicSource,
			title: 'Typed key与动态集合恢复'
		},
		{
			component: NestedDemo,
			covers: ['accessible-name', 'composition', 'native-props', 'rtl'],
			description:
				'nested Accordion拥有独立Context，headingLevel递增；轻量内部Panel可关闭region避免landmark泛滥。',
			id: 'accordion-nested',
			source: nestedSource,
			title: '嵌套、Heading与Region策略'
		},
		{
			component: MotionDemo,
			covers: ['full-motion', 'reduced-motion', 'resource-cleanup'],
			description:
				'full motion保留退出DOM至transitionend；reduced motion立即完成并释放Presence资源。',
			id: 'accordion-motion',
			source: motionSource,
			title: 'Presence与动画偏好'
		},
		{
			component: RuntimeModeDemo,
			covers: ['controlled', 'external-clear', 'native-props', 'variants-and-states'],
			description:
				'一个AccordionValue owner可在同一批Svelte更新中原子切换single/multiple；组件props无需分发联合，运行时仍拒绝错误shape。',
			id: 'accordion-runtime-mode',
			source: runtimeModeSource,
			title: '扁平Props与动态运行时Mode'
		}
	],
	accessibility: [
		'Trigger是heading中唯一的原生button，headingLevel由页面信息架构决定；button和Panel通过aria-controls/labelledby关联。',
		'ArrowUp/Down、Home/End只移动active焦点，不改变展开selection；IME composing和keyCode 229不接管导航。',
		'single collapsible=false时已展开button使用aria-disabled而非native disabled，保持箭头导航并阻止关闭。',
		'动态删除或禁用active Trigger时，CollectionNavigation优先恢复原位置之后的enabled key，再尝试之前；若真实焦点被删除则恢复DOM焦点。',
		'关闭Panel先把内部焦点恢复到Trigger，退出阶段只设置inert并保留DOM至结束；不叠加会隐藏当前焦点的aria-hidden，reduced motion立即完成退出。',
		'默认region适合含结构化内容或嵌套Accordion；大量同时展开的轻量Panel可用region=false避免landmark泛滥。',
		'ZAccordionProps是扁平Svelte组件合同；ZAccordionSingleProps/ZAccordionMultipleProps只用于需要编译期严格mode的配置对象，错误动态组合仍由相同运行时校验拒绝。'
	],
	keywords: [
		'accordion',
		'logical collection',
		'typed key',
		'roving focus',
		'presence',
		'nested',
		'flat props',
		'single helper',
		'multiple helper'
	]
});
