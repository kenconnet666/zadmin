<script module lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import Copy from '@lucide/svelte/icons/copy';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import type { ClipboardStatus } from '../../runtime/clipboard.svelte.js';
	import type { ZControlSize } from '../../runtime/foundation/control-size.js';
	import { defineRecipe } from '../../recipes/define.js';
	import { indicatorSizeStyles } from './indicator-size.js';
	const recipe = defineRecipe(
		{ base: (s) => s.flexShrink(0), variants: { size: indicatorSizeStyles } },
		import.meta
	);
</script>

<script lang="ts">
	import { useZui } from '../../runtime/foundation/context.js';
	let { status, size = 'small' }: { status: ClipboardStatus; size?: ZControlSize } = $props();
	const zui = useZui();
	const rootClass = $derived(zui.recipe(recipe, { size }));
	const Glyph = $derived(status === 'copied' ? Check : status === 'failed' ? TriangleAlert : Copy);
</script>

<Glyph
	class={rootClass}
	aria-hidden="true"
	data-slot="copy-icon"
	data-copy-icon={status === 'copied' ? 'check' : status === 'failed' ? 'error' : 'copy'}
/>
