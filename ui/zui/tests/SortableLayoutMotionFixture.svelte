<script lang="ts">
	import { onDestroy } from 'svelte';
	import {
		ZProvider,
		ZSortable,
		defaultTheme,
		extendTheme,
		type SortableMoveEnd,
		type SortableMoveRequest
	} from '../src/entrypoints/index.js';

	interface Item {
		readonly key: string;
		readonly label: string;
	}
	interface PendingOwner {
		readonly request: SortableMoveRequest<Item, string>;
		readonly resolve: (accepted: boolean) => void;
	}

	const initialItems: readonly Item[] = Array.from({ length: 12 }, (_, index) => ({
		key: `row-${index + 1}`,
		label: `Layout row ${index + 1}`
	}));
	const motionTheme = extendTheme(defaultTheme, {
		duration: { normal: 1_000 },
		easing: { standard: 'linear' }
	});
	let items = $state<readonly Item[]>(initialItems);
	let ends = $state<readonly SortableMoveEnd<Item, string>[]>([]);
	let pendingOwner = $state<PendingOwner | null>(null);
	let reduced = $state(false);
	let width = $state(560);

	function onMoveRequest(request: SortableMoveRequest<Item, string>): Promise<boolean> {
		return new Promise<boolean>((resolve) => {
			const settle = (accepted: boolean): void => {
				request.signal.removeEventListener('abort', abort);
				if (pendingOwner?.request === request) pendingOwner = null;
				resolve(accepted);
			};
			const abort = (): void => settle(false);
			pendingOwner = { request, resolve: settle };
			request.signal.addEventListener('abort', abort, { once: true });
			if (request.signal.aborted) abort();
		});
	}

	export function echo(): void {
		if (!pendingOwner) throw new Error('No pending Sortable owner request.');
		items = pendingOwner.request.nextItems;
	}

	export function echoAndResolve(): void {
		echo();
		pendingOwner?.resolve(true);
	}

	export function resolve(accepted: boolean): void {
		pendingOwner?.resolve(accepted);
	}

	export function resize(nextWidth: number): void {
		width = nextWidth;
	}

	export function setReduced(value: boolean): void {
		reduced = value;
	}

	export function lastEnd(): SortableMoveEnd<Item, string> | null {
		return ends.at(-1) ?? null;
	}

	onDestroy(() => pendingOwner?.resolve(false));
</script>

<div data-testid="sortable-layout-container" style={`inline-size: ${width}px;`}>
	<ZProvider motion={reduced ? 'reduced' : 'full'} theme={motionTheme}>
		<ZSortable
			aria-label="Sortable layout rows"
			data-testid="sortable-layout-motion"
			{items}
			itemKey={(item) => item.key}
			itemLabel={(item) => item.label}
			onMoveEnd={(detail) => (ends = [...ends, detail])}
			{onMoveRequest}
			style="block-size: 10rem; overflow-y: auto;"
		/>
	</ZProvider>
</div>
<output data-testid="sortable-layout-order">{items.map((item) => item.key).join(',')}</output>
