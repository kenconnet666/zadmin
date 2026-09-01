<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';

	export interface ZTooltipGroupProps {
		readonly children?: Snippet;
		readonly closeDelay?: number;
		readonly delay?: number;
		readonly skipDelayDuration?: number;
	}

	export const zuiMetadata = {
		category: 'overlay',
		id: 'tooltip-group',
		importStatement:
			"import { ZTooltipGroup, ZTooltip, ZTooltipTrigger, ZTooltipContent } from '@zadmin/zui';",
		name: 'ZTooltipGroup',
		bindings: [],
		dependencies: ['TooltipGroupCoordinator', 'owner Window timers'],
		events: [],
		keyboard: [],
		parts: [],
		props: [
			{
				default: '500',
				description: '组内首次pointer hover打开延迟ms。',
				name: 'delay',
				type: 'number'
			},
			{
				default: '100',
				description: '组内pointer离开后的关闭延迟ms。',
				name: 'closeDelay',
				type: 'number'
			},
			{
				default: '300',
				description: '一个Tooltip关闭后继续免warmup的时间ms。',
				name: 'skipDelayDuration',
				type: 'number'
			}
		],
		since: 'unreleased',
		snippets: [
			{ description: '共享warmup/cooldown的Tooltip集合。', name: 'children', type: 'Snippet' }
		],
		source: 'ui/zui/src/components/compound/tooltip/ZTooltipGroup.svelte',
		states: [],
		status: 'experimental',
		summary:
			'以作用域coordinator保证组内唯一active、首次warmup与短期即时切换，并把cooldown timer归属到真实owner Window。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { onDestroy } from 'svelte';
	import {
		provideZTooltipGroup,
		TooltipGroupCoordinator,
		type ZTooltipGroupContext
	} from './context.svelte.js';

	let {
		children,
		closeDelay = 100,
		delay = 500,
		skipDelayDuration = 300
	}: ZTooltipGroupProps = $props();
	const coordinator = new TooltipGroupCoordinator();
	const duration = (value: number, name: string): number => {
		if (!Number.isFinite(value) || value < 0) {
			throw new TypeError(`ZTooltipGroup ${name} must be a non-negative finite number.`);
		}
		return value;
	};
	const context: ZTooltipGroupContext = {
		get closeDelay() {
			return duration(closeDelay, 'closeDelay');
		},
		coordinator,
		get delay() {
			return duration(delay, 'delay');
		},
		get skipDelayDuration() {
			return duration(skipDelayDuration, 'skipDelayDuration');
		}
	};
	provideZTooltipGroup(context);
	onDestroy(() => coordinator.destroy());
</script>

{@render children?.()}
