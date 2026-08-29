<script lang="ts">
	import { useZui } from '../src/entrypoints/index.js';

	let { id }: { id: string } = $props();
	const zui = useZui();
</script>

<output data-testid={id}
	>{zui.locale}:{zui.direction}:{zui.colorScheme}:{zui.contrast}:{zui.density}:{zui.motion}:{zui.idPrefix}:{zui
		.translations.close ?? 'none'}</output
>
