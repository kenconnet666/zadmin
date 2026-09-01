<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { SelectionKey } from '../../../runtime/collection/selection.js';

	export interface ZMenuRadioGroupProps extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'children' | 'role'
	> {
		readonly children?: Snippet;
		readonly defaultValue?: SelectionKey;
		readonly onValueChange?: (value: SelectionKey) => void;
		ref?: HTMLDivElement | null;
		value?: SelectionKey;
	}

	export const zuiMetadata = {
		category: 'navigation',
		id: 'menu-radio-group',
		importStatement: "import { ZMenuRadioGroup, ZMenuRadioItem } from '@zadmin/zui';",
		name: 'ZMenuRadioGroup',
		bindings: [
			{ description: '当前typed radio值。', name: 'value', type: 'SelectionKey | undefined' },
			{ description: '真实group引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: ['ZMenu', 'ControllableState'],
		events: [
			{
				description: '用户选择新值后调用。',
				name: 'onValueChange',
				type: '(value: SelectionKey) => void'
			}
		],
		keyboard: [],
		parts: [],
		props: [
			{
				default: 'undefined',
				description: '受控或bindable typed值。',
				name: 'value',
				type: 'SelectionKey'
			},
			{
				default: 'undefined',
				description: '非受控初始值。',
				name: 'defaultValue',
				type: 'SelectionKey'
			},
			{
				bindable: true,
				default: 'null',
				description: '真实group引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: 'unreleased',
		snippets: [{ description: 'ZMenuRadioItem集合。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/menu/ZMenuRadioGroup.svelte',
		states: [],
		status: 'experimental',
		summary: '在同一Menu内提供string/number严格区分的受控或非受控radio选择域。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { ControllableState } from '../../../runtime/foundation/controllable-state.svelte.js';
	import { provideZMenuRadioGroup } from './context.svelte.js';

	let {
		children,
		defaultValue,
		onValueChange,
		ref = $bindable(null),
		value = $bindable(),
		...rest
	}: ZMenuRadioGroupProps = $props();
	const valueState = new ControllableState<SelectionKey | undefined>({
		defaultValue: () => defaultValue,
		onChange: () => (next) => {
			if (next !== undefined) onValueChange?.(next);
		},
		read: () => value,
		undefinedIsValue: true,
		write: (next) => (value = next)
	});
	provideZMenuRadioGroup({
		select(next) {
			valueState.setFromUser(next);
		},
		get value() {
			return valueState.current;
		}
	});
</script>

<div {...rest} bind:this={ref} role="group">{@render children?.()}</div>
