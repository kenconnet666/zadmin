<script lang="ts">
	import ZProvider from '../src/components/gene/ZProvider.svelte';
	import ZResizable, {
		type ZResizableCancelDetail,
		type ZResizableResizeDetail
	} from '../src/components/layout/ZResizable.svelte';
	import type { IcssRuntime } from '../src/icss/runtime.js';

	interface Props {
		onResize?: (detail: ZResizableResizeDetail) => void;
		onResizeCancel?: (detail: ZResizableCancelDetail) => void;
		runtime: IcssRuntime;
	}

	let { onResize, onResizeCancel, runtime }: Props = $props();
</script>

<ZProvider {runtime}>
	<ZResizable
		axis="inline"
		data-testid="resizable-owner-realm"
		height="100px"
		{onResize}
		{onResizeCancel}
		width="200px"
	/>
</ZProvider>
