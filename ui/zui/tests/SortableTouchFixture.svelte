<script lang="ts">
	import {
		ZSortable,
		type SelectionKey,
		type SortableMoveEnd,
		type SortableMoveRequest
	} from '../src/entrypoints/index.js';

	type Scenario = 'accept' | 'disabled' | 'readonly' | 'reject';
	interface SortableTouchItem {
		readonly disabled?: boolean;
		readonly key: SelectionKey;
		readonly label: string;
	}

	const initialItems: readonly SortableTouchItem[] = Array.from({ length: 12 }, (_, index) => ({
		disabled: index === 5,
		key: `row-${index + 1}`,
		label: index === 5 ? 'Locked row 6' : `Sortable row ${index + 1}`
	}));
	let {
		scenario = 'accept'
	}: {
		scenario?: Scenario;
	} = $props();
	let items = $state<readonly SortableTouchItem[]>(initialItems);
	let ends = $state<readonly SortableMoveEnd<SortableTouchItem>[]>([]);
	let pointerStream = $state<readonly string[]>([]);

	function requestMove(request: SortableMoveRequest<SortableTouchItem>): boolean {
		if (scenario === 'reject') return false;
		items = request.nextItems;
		return true;
	}

	function recordPointer(event: PointerEvent): void {
		if (event.pointerType !== 'touch') return;
		pointerStream = [...pointerStream, `${event.type}:${event.isTrusted}`];
	}
</script>

<div
	aria-label="Sortable touch scroll area"
	data-testid="sortable-touch-scroll"
	role="region"
	style="block-size: 12rem; overflow-y: auto;"
	onpointercancel={recordPointer}
	onpointerdown={recordPointer}
	onpointermove={recordPointer}
>
	<ZSortable
		aria-label="Sortable touch rows"
		data-testid={`sortable-touch-${scenario}`}
		disabled={scenario === 'disabled'}
		itemDisabled={(item) => item.disabled ?? false}
		itemKey={(item) => item.key}
		itemLabel={(item) => item.label}
		{items}
		onMoveEnd={(detail) => (ends = [...ends, detail])}
		onMoveRequest={requestMove}
		readonly={scenario === 'readonly'}
	>
		{#snippet item(item, context)}
			<span data-dragging={context.dragging || undefined}>{item.label}</span>
		{/snippet}
	</ZSortable>
</div>
<output data-testid="sortable-touch-order">{items.map((item) => item.key).join(',')}</output>
<output data-testid="sortable-touch-ends">{ends.map((detail) => detail.result).join(',')}</output>
<output data-testid="sortable-touch-stream">{pointerStream.join('|')}</output>
