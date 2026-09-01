<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	export interface ZMenuGroupProps extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'children' | 'role'
	> {
		readonly children?: Snippet;
		readonly value?: string;
		ref?: HTMLDivElement | null;
	}
	export const zuiMetadata = {
		category: 'navigation',
		id: 'menu-group',
		importStatement: "import { ZMenuGroup } from '@zadmin/zui';",
		name: 'ZMenuGroup',
		bindings: [{ description: '真实group引用。', name: 'ref', type: 'HTMLDivElement | null' }],
		dependencies: ['ZMenu'],
		events: [],
		keyboard: [],
		parts: [],
		props: [
			{
				default: '自动生成',
				description: 'Item逻辑分组key；不改变完整Menu的DOM顺序。',
				name: 'value',
				type: 'string'
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
		snippets: [{ description: 'Label和Items。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/menu/ZMenuGroup.svelte',
		states: [],
		status: 'experimental',
		summary: '使用原生ARIA group组织相关Menu Item。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import { useZui } from '../../../runtime/foundation/context.js';
	import { createZuiId } from '../../../runtime/foundation/ids.js';
	import { provideZMenuGroup } from './context.svelte.js';

	let { children, ref = $bindable(null), value, ...rest }: ZMenuGroupProps = $props();
	const zui = useZui();
	const uid = $props.id();
	const generatedKey = $derived(createZuiId(zui.idPrefix, uid, 'menu-group'));
	const key = $derived(value ?? generatedKey);
	const labelId = $derived(`${generatedKey}-label`);
	let registeredLabelId = $state<string>();
	provideZMenuGroup({
		get key() {
			return key;
		},
		get labelId() {
			return labelId;
		},
		registerLabel(id) {
			return untrack(() => {
				if (registeredLabelId !== undefined) {
					throw new Error('ZMenuGroup accepts at most one ZMenuLabel.');
				}
				registeredLabelId = id;
				let active = true;
				return () => {
					if (!active) return;
					active = false;
					registeredLabelId = undefined;
				};
			});
		}
	});
</script>

<div
	{...rest}
	bind:this={ref}
	role="group"
	aria-labelledby={rest['aria-labelledby'] ?? registeredLabelId}
>
	{@render children?.()}
</div>
