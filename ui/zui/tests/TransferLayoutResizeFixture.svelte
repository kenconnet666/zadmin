<script lang="ts">
	import { onDestroy } from 'svelte';
	import {
		ZProvider,
		ZTransfer,
		defaultTheme,
		extendTheme,
		type SelectionKey,
		type TransferItem,
		type TransferMoveEnd,
		type TransferMoveRequest
	} from '../src/entrypoints/index.js';

	const theme = extendTheme(defaultTheme, {
		duration: { normal: 1_000 },
		easing: { standard: 'linear' }
	});
	const items: readonly TransferItem[] = [
		{ key: 'alpha', label: 'Alpha' },
		{ key: 'beta', label: 'Beta' },
		{ key: 'target', label: 'Target' }
	];
	let containerWidth = $state(760);
	let value = $state<readonly SelectionKey[]>(['target']);
	let request = $state<TransferMoveRequest | null>(null);
	let ends = $state<readonly TransferMoveEnd[]>([]);
	let settleRequest: ((accepted: boolean) => void) | undefined;

	function onMoveRequest(next: TransferMoveRequest): Promise<boolean> {
		request = next;
		return new Promise<boolean>((resolve) => {
			const settle = (accepted: boolean): void => {
				next.signal.removeEventListener('abort', onAbort);
				if (settleRequest === settle) settleRequest = undefined;
				resolve(accepted);
			};
			const onAbort = (): void => settle(false);
			settleRequest = settle;
			next.signal.addEventListener('abort', onAbort, { once: true });
			if (next.signal.aborted) settle(false);
		});
	}

	export function acceptRequest(): void {
		if (!request) throw new Error('No pending Transfer request.');
		value = request.nextValue;
		settleRequest?.(true);
	}

	export function resizeContainer(width: number): void {
		containerWidth = width;
	}

	export function lastEnd(): TransferMoveEnd | null {
		return ends.at(-1) ?? null;
	}

	onDestroy(() => settleRequest?.(false));
</script>

<div data-testid="transfer-layout-resize-container" style={`inline-size: ${containerWidth}px;`}>
	<ZProvider {theme} motion="full">
		<ZTransfer
			data-testid="transfer-layout-resize"
			filterable={false}
			{items}
			moveMode="request"
			onMoveEnd={(detail) => (ends = [...ends, detail])}
			{onMoveRequest}
			sourceTitle="Resize source"
			targetTitle="Resize target"
			{value}
		/>
	</ZProvider>
</div>
