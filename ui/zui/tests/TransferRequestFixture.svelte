<script lang="ts">
	import {
		ZButton,
		ZProvider,
		ZStack,
		ZText,
		ZTransfer,
		type TransferItem,
		type TransferMoveEnd,
		type TransferMoveRequest
	} from '../src/entrypoints/index.js';

	const initialItems: readonly TransferItem[] = [
		{ key: 'alpha', label: 'Alpha' },
		{ key: 'beta', label: 'Beta' },
		{ key: 'target', label: 'Target' },
		{ disabled: true, key: 'locked', label: 'Locked' }
	];
	const virtualItems: readonly TransferItem[] = Array.from({ length: 80 }, (_, index) => ({
		key: `virtual-${index}`,
		label: `Virtual ${index}`
	}));
	let items = $state<TransferItem[]>(initialItems.map((item) => ({ ...item })));
	let value = $state<readonly string[]>(['target']);
	let immediateValue = $state<readonly string[]>(['target']);
	let ends = $state<readonly TransferMoveEnd[]>([]);
	let requests = $state(0);
	let request: TransferMoveRequest | null = null;
	let resolvePending: ((accepted: boolean) => void) | undefined;
	let rejectPending: ((reason: unknown) => void) | undefined;
	let reenterEnd = $state(false);
	let requestRoot = $state<HTMLDivElement | null>(null);
	let requestDisabled = $state(false);
	let requestReadonly = $state(false);
	let requestMode = $state<'immediate' | 'request'>('request');
	const requestModeProps = $derived(
		requestMode === 'request'
			? { moveMode: 'request' as const, onMoveRequest }
			: { moveMode: 'immediate' as const }
	);

	function onMoveRequest(next: TransferMoveRequest): Promise<boolean> {
		request = next;
		requests += 1;
		return new Promise<boolean>((resolve, reject) => {
			resolvePending = resolve;
			rejectPending = reject;
			next.signal.addEventListener(
				'abort',
				() => reject(next.signal.reason ?? new Error('Transfer request aborted.')),
				{ once: true }
			);
		});
	}

	function onMoveEnd(detail: TransferMoveEnd): void {
		ends = [...ends, detail];
		if (reenterEnd && detail.result === 'accepted')
			queueMicrotask(() =>
				requestRoot
					?.querySelector<HTMLButtonElement>('[aria-label="Request move to source"]')
					?.click()
			);
	}

	export function resolveRequest(accepted: boolean): void {
		resolvePending?.(accepted);
		resolvePending = undefined;
	}

	export function rejectRequest(reason = new Error('Owner failed.')): void {
		rejectPending?.(reason);
		rejectPending = undefined;
	}

	export function echoNextValue(): void {
		if (request) value = request.nextValue as readonly string[];
	}

	export function echoDuplicateNextValue(): void {
		if (request)
			value = [...(request.nextValue as readonly string[]), request.nextValue[0] as string];
	}

	export function replaceValue(): void {
		value = ['beta'];
	}

	export function replaceItems(): void {
		items = initialItems.filter((item) => item.key !== 'alpha');
	}

	export function renameAlpha(): void {
		const index = items.findIndex((item) => item.key === 'alpha');
		if (index >= 0) items[index] = { ...items[index]!, label: 'Alpha renamed' };
	}

	export function disableAlpha(): void {
		const index = items.findIndex((item) => item.key === 'alpha');
		if (index >= 0) (items[index] as { disabled?: boolean }).disabled = true;
	}

	export function changeAlphaKey(): void {
		const index = items.findIndex((item) => item.key === 'alpha');
		if (index >= 0) (items[index] as { key: string | number }).key = 'alpha-next';
	}

	export function reorderItems(): void {
		items.reverse();
	}

	export function setReentrantEnd(value: boolean): void {
		reenterEnd = value;
	}

	export function setRequestDisabled(value: boolean): void {
		requestDisabled = value;
	}

	export function setRequestReadonly(value: boolean): void {
		requestReadonly = value;
	}

	export function setRequestMoveMode(value: 'immediate' | 'request'): void {
		requestMode = value;
	}

	export function endResults(): readonly string[] {
		return ends.map((detail) => detail.result);
	}

	export function lastRequest(): TransferMoveRequest | null {
		return request;
	}

	export function lastEnd(): TransferMoveEnd | null {
		return ends.at(-1) ?? null;
	}
</script>

<form data-testid="transfer-request-form">
	<ZStack gap="small">
		<ZTransfer
			{...requestModeProps}
			bind:ref={requestRoot}
			data-testid="transfer-request"
			defaultValue={['target']}
			disabled={requestDisabled}
			{items}
			moveToSourceLabel="Request move to source"
			moveToTargetLabel="Request move to target"
			name="request"
			{onMoveEnd}
			readonly={requestReadonly}
			sourceTitle="Request source"
			targetTitle="Request target"
			{value}
		/>
		<ZButton type="reset" variant="outline">Reset request</ZButton>
	</ZStack>
</form>
<button data-testid="request-user-focus" type="button">Keep user focus</button>
<ZText data-testid="transfer-request-state" tone="muted"
	>requests={requests} · value={value.join(',')} · ends={ends
		.map((detail) => detail.result)
		.join(',') || 'none'}</ZText
>

<form data-testid="transfer-immediate-form">
	<ZTransfer
		data-testid="transfer-immediate"
		defaultValue={['target']}
		{items}
		moveToSourceLabel="Immediate move to source"
		moveToTargetLabel="Immediate move to target"
		name="immediate"
		onValueChange={(next) => (immediateValue = next as readonly string[])}
		sourceTitle="Immediate source"
		targetTitle="Immediate target"
		value={immediateValue}
	/>
	<ZButton type="reset" variant="outline">Reset immediate</ZButton>
</form>

<ZTransfer
	data-testid="transfer-disabled"
	disabled
	{items}
	sourceTitle="Disabled source"
	targetTitle="Disabled target"
	value={['target']}
/>
<ZTransfer
	data-testid="transfer-readonly"
	{items}
	readonly
	sourceTitle="Readonly source"
	targetTitle="Readonly target"
	value={['target']}
/>
<ZProvider direction="rtl">
	<ZTransfer
		data-testid="transfer-rtl-virtual"
		filterable={false}
		items={virtualItems}
		moveToSourceLabel="RTL move to source"
		moveToTargetLabel="RTL move to target"
		sourceTitle="RTL source"
		targetTitle="RTL target"
		virtual
		value={[]}
	/>
</ZProvider>
