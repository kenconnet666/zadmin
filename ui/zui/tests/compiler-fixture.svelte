<script lang="ts">
	import { defaultTheme, icss } from '@zadmin/zui';

	let width = $state(320);
	const panelClass = $derived(
		icss(defaultTheme, (s) => {
			s.width.px(width);
			s.padding._medium;
		})
	);
</script>

<div class={panelClass}>Compiler fixture</div>
