<script lang="ts">
	import { onDestroy } from 'svelte';
	import {
		ZProvider,
		ZTransfer,
		defaultTheme,
		extendTheme,
		type TransferItem,
		type TransferMoveEnd,
		type TransferMoveRequest
	} from '../src/entrypoints/index.js';
	const motionTheme = extendTheme(defaultTheme, {
		duration: { normal: 1_000 },
		easing: { standard: 'linear' }
	});

	let items = $state<TransferItem[]>([
		{ key: 1, label: 'Number one' },
		{ key: '1', label: 'String one' },
		{ key: 'beta', label: 'Beta' },
		{ key: 'target', label: 'Target' }
	]);
	let immediateValue = $state<readonly (string | number)[]>(['target']);
	let rtlValue = $state<readonly (string | number)[]>(['target']);
	let requestValue = $state<readonly (string | number)[]>(['target']);
	let requestReadonly = $state(false);
	let immediateEnds = $state<readonly TransferMoveEnd[]>([]);
	let rtlEnds = $state<readonly TransferMoveEnd[]>([]);
	let requestEnds = $state<readonly TransferMoveEnd[]>([]);
	let request = $state<TransferMoveRequest | null>(null);
	let resolveRequest: ((accepted: boolean) => void) | undefined;
	let gestureObserved = $state(false);
	let reduced = $state(false);
	let {
		cancelShortcut = false,
		scenario,
		virtual = false
	}: {
		cancelShortcut?: boolean;
		scenario: 'immediate' | 'request' | 'rtl';
		virtual?: boolean;
	} = $props();

	function onRequest(next: TransferMoveRequest): Promise<boolean> {
		request = next;
		return new Promise<boolean>((resolve) => {
			const finish = (accepted: boolean): void => {
				next.signal.removeEventListener('abort', onAbort);
				if (resolveRequest === finish) resolveRequest = undefined;
				resolve(accepted);
			};
			const onAbort = (): void => finish(false);
			resolveRequest = finish;
			next.signal.addEventListener('abort', onAbort, { once: true });
			if (next.signal.aborted) finish(false);
		});
	}

	onDestroy(() => resolveRequest?.(false));

	function recordGesture(): void {
		gestureObserved = Boolean(
			document.querySelector('[data-testid="transfer-drag-request"] [data-dragging="true"]')
		);
	}

	function cloneRequestSnapshot(): void {
		recordGesture();
		items = items.map((item) => ({
			...item,
			label: item.key === 1 ? 'Number one renamed' : item.label
		}));
		requestValue = [...requestValue];
	}

	function changeRequestValue(): void {
		recordGesture();
		requestValue = [1, ...requestValue];
	}

	function makeRequestReadonly(): void {
		recordGesture();
		requestReadonly = true;
	}

	export function echoAndResolveRequest(): void {
		echoRequest();
		resolveOwnerRequest(true);
	}

	export function echoRequest(): void {
		if (!request) return;
		requestValue = request.nextValue;
	}

	export function resolveOwnerRequest(accepted: boolean): void {
		resolveRequest?.(accepted);
		resolveRequest = undefined;
	}

	export function setReduced(value: boolean): void {
		reduced = value;
	}

	export function lastRequest(): TransferMoveRequest | null {
		return request;
	}

	export function lastImmediateEnd(): TransferMoveEnd | null {
		return immediateEnds.at(-1) ?? null;
	}

	export function lastRtlEnd(): TransferMoveEnd | null {
		return rtlEnds.at(-1) ?? null;
	}

	export function lastRequestEnd(): TransferMoveEnd | null {
		return requestEnds.at(-1) ?? null;
	}

	export function wasGestureObserved(): boolean {
		return gestureObserved;
	}
</script>

<ZProvider motion={reduced ? 'reduced' : 'full'} theme={motionTheme}>
	{#if scenario === 'immediate'}
		<ZTransfer
			data-testid="transfer-drag-immediate"
			dragDrop
			filterable={false}
			{items}
			onMoveEnd={(detail) => (immediateEnds = [...immediateEnds, detail])}
			onValueChange={(next) => (immediateValue = next)}
			sourceTitle="Pointer source"
			targetTitle="Pointer target"
			value={immediateValue}
			{virtual}
		/>
	{:else if scenario === 'rtl'}
		<form data-testid="transfer-drag-rtl-form">
			<ZTransfer
				data-testid="transfer-drag-rtl"
				dir="rtl"
				dragDrop
				filterable={false}
				{items}
				name="rtl-transfer"
				onkeydowncapture={(event) => {
					if (cancelShortcut && event.altKey) event.preventDefault();
				}}
				onMoveEnd={(detail) => (rtlEnds = [...rtlEnds, detail])}
				onValueChange={(next) => (rtlValue = next)}
				sourceTitle="RTL source"
				targetTitle="RTL target"
				value={rtlValue}
				{virtual}
			/>
		</form>
	{:else}
		<ZTransfer
			data-testid="transfer-drag-request"
			dragDrop
			filterable={false}
			{items}
			moveMode="request"
			onMoveEnd={(detail) => (requestEnds = [...requestEnds, detail])}
			onMoveRequest={onRequest}
			readonly={requestReadonly}
			sourceTitle="Request source"
			targetTitle="Request target"
			value={requestValue}
			{virtual}
		/>
		<button data-testid="clone-transfer-snapshot" onclick={cloneRequestSnapshot} type="button">
			Clone snapshot
		</button>
		<button data-testid="change-transfer-value" onclick={changeRequestValue} type="button">
			Change value
		</button>
		<button data-testid="make-transfer-readonly" onclick={makeRequestReadonly} type="button">
			Make readonly
		</button>
	{/if}
</ZProvider>
