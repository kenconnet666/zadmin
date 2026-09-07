<script lang="ts">
	import type { Snippet } from 'svelte';
	import ZBox from '../gene/ZBox.svelte';
	import { useZui } from '../../runtime/foundation/context.js';
	let { children, label, dir }: { children: Snippet; label: string; dir: 'ltr' | 'rtl' | 'auto' } =
		$props();
	const zui = useZui();
	const surfaceClass = $derived(
		zui.icss((s) => {
			s.width._full;
			s.minWidth.px(0);
			s.maxWidth._full;
			s.marginTop._small;
			s.padding._medium;
			s.borderWidth._hairline;
			s.borderStyle.solid;
			s.borderColor._border;
			s.borderRadius._large;
			s.backgroundColor._canvas;
		})
	);
</script>

<ZBox class={surfaceClass} data-slot="inline-panel" role="group" aria-label={label} {dir}>
	{@render children()}
</ZBox>
