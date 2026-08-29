<script lang="ts">
	import { useZui } from '../src/lib/index.js';
	let { id }: { id: string } = $props();
	const zui = useZui();
</script>

<output data-testid={id}>{zui.locale}:{zui.direction}</output>
