<script module lang="ts">
	export interface SortableFixtureItem {
		readonly key: string | number;
		readonly label: string;
		readonly locked?: boolean;
	}

	export type SortableFixturePolicy = 'accept' | 'reject' | 'delay' | 'error';
</script>

<script lang="ts">
	import {
		ZProvider,
		ZSortable,
		type SortableMoveEnd,
		type SortableMoveRequest
	} from '../src/entrypoints/index.js';

	const initialItems: readonly SortableFixtureItem[] = Object.freeze([
		{ key: 0, label: 'Numeric zero' },
		{ key: '0', label: 'String zero' },
		{ key: 'locked', label: 'Locked row', locked: true },
		{ key: 'tail', label: 'Tail row' }
	]);
	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;
	const scaleItem = Object.freeze([{ key: 'scale', label: 'Scale row' }]);
	const pointerInitial: readonly SortableFixtureItem[] = Object.freeze([
		{ key: 'pointer-a', label: 'Pointer A' },
		{ key: 'pointer-b', label: 'Pointer B' },
		{ key: 'pointer-c', label: 'Pointer C' }
	]);
	const rtlInitial: readonly SortableFixtureItem[] = Object.freeze([
		{ key: 'rtl-a', label: 'RTL A' },
		{ key: 'rtl-b', label: 'RTL B' },
		{ key: 'rtl-c', label: 'RTL C' }
	]);

	let items = $state<readonly SortableFixtureItem[]>(initialItems);
	let pointerItems = $state<readonly SortableFixtureItem[]>(pointerInitial);
	let rtlItems = $state<readonly SortableFixtureItem[]>(rtlInitial);
	let pointerSource = $state<SortableMoveRequest<SortableFixtureItem>['source'] | 'none'>('none');
	let policy = $state<SortableFixturePolicy>('accept');
	let readonly = $state(false);
	let disabled = $state(false);
	let reduced = $state(false);
	let requests: SortableMoveRequest<SortableFixtureItem, string | number>[] = [];
	let ends: SortableMoveEnd<SortableFixtureItem, string | number>[] = [];
	let delayed:
		| {
				request: SortableMoveRequest<SortableFixtureItem, string | number>;
				resolve: (accepted: boolean) => void;
		  }
		| undefined;

	function apply(request: SortableMoveRequest<SortableFixtureItem, string | number>): void {
		items = request.nextItems;
	}

	function requestMove(
		request: SortableMoveRequest<SortableFixtureItem, string | number>
	): boolean | Promise<boolean> {
		requests = [...requests, request];
		if (policy === 'reject') return false;
		if (policy === 'error') throw new Error('sortable fixture rejection');
		if (policy === 'accept') {
			apply(request);
			return true;
		}
		return new Promise<boolean>((resolve) => {
			const settle = (accepted: boolean) => {
				if (delayed?.request === request) delayed = undefined;
				resolve(accepted);
			};
			delayed = { request, resolve: settle };
			request.signal.addEventListener('abort', () => settle(false), { once: true });
		});
	}

	function moveEnded(detail: SortableMoveEnd<SortableFixtureItem, string | number>): void {
		ends = [...ends, detail];
	}

	export function setPolicy(next: SortableFixturePolicy): void {
		policy = next;
	}
	export function settleDelayed(accepted: boolean): void {
		const entry = delayed;
		if (!entry) return;
		if (accepted) apply(entry.request);
		entry.resolve(accepted);
	}
	export function setReadonly(next: boolean): void {
		readonly = next;
	}
	export function setDisabled(next: boolean): void {
		disabled = next;
	}
	export function setReduced(next: boolean): void {
		reduced = next;
	}
	export function deleteItem(key: string | number): void {
		items = items.filter((item) => !Object.is(item.key, key));
	}
	export function lockItem(key: string | number): void {
		items = items.map((item) => (Object.is(item.key, key) ? { ...item, locked: true } : item));
	}
	export function reverseItems(): void {
		items = [...items].reverse();
	}
	export function resetFixture(): void {
		items = initialItems;
		policy = 'accept';
		readonly = false;
		disabled = false;
		requests = [];
		ends = [];
		delayed = undefined;
	}
	export function getItems(): readonly SortableFixtureItem[] {
		return items;
	}
	export function getRequests(): readonly SortableMoveRequest<
		SortableFixtureItem,
		string | number
	>[] {
		return requests;
	}
	export function getEnds(): readonly SortableMoveEnd<SortableFixtureItem, string | number>[] {
		return ends;
	}
	export function getPointerItems(): readonly SortableFixtureItem[] {
		return pointerItems;
	}
	export function getPointerSource(): SortableMoveRequest<SortableFixtureItem>['source'] | 'none' {
		return pointerSource;
	}
	export function getRtlItems(): readonly SortableFixtureItem[] {
		return rtlItems;
	}
</script>

<ZProvider motion={reduced ? 'reduced' : 'full'}>
	<ZSortable
		{items}
		itemKey={(item) => item.key}
		itemLabel={(item) => item.label}
		itemDisabled={(item) => item.locked === true}
		onMoveRequest={requestMove}
		onMoveEnd={moveEnded}
		{readonly}
		{disabled}
		aria-label="Production sortable"
		data-testid="sortable-production"
	>
		{#snippet item(entry, context)}
			<span data-item-key={`${typeof entry.key}:${entry.key}`} data-context-index={context.index}
				>{entry.label}</span
			>
		{/snippet}
	</ZSortable>
</ZProvider>

<output data-testid="sortable-order"
	>{items.map((item) => `${typeof item.key}:${item.key}`).join(',')}</output
>

<ZProvider motion="reduced">
	<ZSortable
		items={pointerItems}
		itemKey={(item) => item.key}
		itemLabel={(item) => item.label}
		onMoveRequest={(request) => {
			pointerSource = request.source;
			pointerItems = request.nextItems;
			return true;
		}}
		orientation="horizontal"
		aria-label="Pointer sortable"
		data-testid="sortable-pointer"
	/>
</ZProvider>

<ZProvider direction="rtl" motion="reduced">
	<ZSortable
		items={rtlItems}
		itemKey={(item) => item.key}
		itemLabel={(item) => item.label}
		onMoveRequest={(request) => {
			rtlItems = request.nextItems;
			return true;
		}}
		orientation="horizontal"
		aria-label="RTL sortable"
		data-testid="sortable-rtl"
	/>
</ZProvider>

<ZProvider motion="reduced">
	{#each sizes as size (size)}
		<ZSortable
			items={scaleItem}
			itemKey={(item) => item.key}
			itemLabel={(item) => item.label}
			onMoveRequest={() => false}
			{size}
			aria-label={`${size} sortable`}
			data-testid={`sortable-scale-${size}`}
		/>
	{/each}
</ZProvider>
