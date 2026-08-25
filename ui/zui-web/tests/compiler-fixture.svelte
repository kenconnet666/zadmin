<script lang="ts">
	import { defaultTheme, icss } from '@zadmin/zui-web';

	let width = $state(320);
	const panelClass = $derived(
		icss(defaultTheme, (style) => {
			style.width.px(width);
			style.padding._medium;
		})
	);
</script>

<div class={panelClass}>Compiler fixture</div>
