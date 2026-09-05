<script lang="ts">
	import { useZui } from '../src/entrypoints/index.js';

	let { id }: { id: string } = $props();
	const zui = useZui();
</script>

<output data-testid={id}
	>{zui.locale}:{zui.direction}:{zui.colorScheme}:{zui.contrast}:{zui.density}:{zui.motion}:{zui.idPrefix}:{zui
		.localePack.common.close}:{zui.timeZone}:{zui.localePack.date.calendarLabel}:{zui.localePack
		.time.hourCycle}:{zui.portalContainer === null ? 'default-portal' : 'custom-portal'}</output
>
