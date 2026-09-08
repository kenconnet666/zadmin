<script lang="ts">
	import { ZTransfer, type SelectionKey, type TransferItem } from '../src/entrypoints/index.js';

	const items: readonly TransferItem[] = Array.from({ length: 24 }, (_, index) => ({
		key: `item-${index + 1}`,
		label: `Touch item ${index + 1}`
	}));
	let immediateValue = $state<readonly SelectionKey[]>(['item-24']);
	let readonlyValue = $state<readonly SelectionKey[]>(['item-24']);
	let disabledValue = $state<readonly SelectionKey[]>(['item-24']);
	let immediateChanges = $state(0);
	let touchStream = $state<readonly string[]>([]);
	let {
		scenario = 'immediate',
		virtual = false
	}: {
		scenario?: 'disabled' | 'immediate' | 'readonly';
		virtual?: boolean;
	} = $props();

	function recordTouchPointer(event: PointerEvent): void {
		if (event.pointerType !== 'touch') return;
		const target = event.target;
		const role = target instanceof Element ? target.closest('[role]')?.getAttribute('role') : null;
		queueMicrotask(() => {
			const dragging = document.querySelector(
				'[data-testid="transfer-touch-immediate"] [data-dragging="true"]'
			);
			touchStream = [
				...touchStream,
				`${event.type}:${event.isTrusted}:${role ?? 'none'}:${dragging ? 'dragging' : 'idle'}`
			];
		});
	}

	function recordTouchCancel(event: TouchEvent): void {
		touchStream = [...touchStream, `${event.type}:${event.isTrusted}:touch`];
	}
</script>

{#if scenario === 'immediate'}
	<div
		aria-label="Touch transfer scroll area"
		data-testid="transfer-touch-scroll"
		role="region"
		style="block-size: 18rem; overflow-y: auto; touch-action: pan-y;"
		ontouchcancel={recordTouchCancel}
		onpointercancel={recordTouchPointer}
		onpointerdown={recordTouchPointer}
		onpointermove={recordTouchPointer}
	>
		<ZTransfer
			data-testid="transfer-touch-immediate"
			dragDrop
			filterable={false}
			{items}
			{virtual}
			onValueChange={(next) => {
				immediateValue = next;
				immediateChanges += 1;
			}}
			sourceTitle="Touch source"
			targetTitle="Touch target"
			value={immediateValue}
		/>
	</div>
	<output data-testid="transfer-touch-immediate-output"
		>{immediateValue.join(',')}|{immediateChanges}</output
	>
	<output data-testid="transfer-touch-stream">{touchStream.join('|')}</output>
{:else if scenario === 'readonly'}
	<ZTransfer
		data-testid="transfer-touch-readonly"
		dragDrop
		filterable={false}
		{items}
		{virtual}
		readonly
		sourceTitle="Readonly touch source"
		targetTitle="Readonly touch target"
		value={readonlyValue}
		onValueChange={(next) => (readonlyValue = next)}
	/>
	<output data-testid="transfer-touch-readonly-output">{readonlyValue.join(',')}</output>
{:else}
	<ZTransfer
		data-testid="transfer-touch-disabled"
		disabled
		dragDrop
		filterable={false}
		{items}
		{virtual}
		sourceTitle="Disabled touch source"
		targetTitle="Disabled touch target"
		value={disabledValue}
		onValueChange={(next) => (disabledValue = next)}
	/>
	<output data-testid="transfer-touch-disabled-output">{disabledValue.join(',')}</output>
{/if}
