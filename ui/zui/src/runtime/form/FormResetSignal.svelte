<script module lang="ts">
	export interface FormResetSignalProps {
		readonly form?: string;
		readonly onReset: () => void;
	}
</script>

<script lang="ts">
	import { listenForFormReset } from './form-control.svelte.js';

	const armedValue = 'zui-reset-armed';
	const resetValue = 'zui-reset-fired';
	let { form, onReset }: FormResetSignalProps = $props();
	let ref = $state<HTMLInputElement | null>(null);
	let marker = $state(armedValue);

	$effect(() => {
		if (ref) ref.defaultValue = resetValue;
	});

	function updateMarker(next: string): void {
		if (next === resetValue) onReset();
		else marker = next;
	}

	function shadowFormReset(
		control: HTMLInputElement,
		reset: () => void
	): { destroy(): void; update(reset: () => void): void } {
		let active = true;
		let currentReset = reset;
		let disconnect = () => undefined;
		let listening = false;
		const connect = () => {
			if (!active || listening) return;
			const root = control.getRootNode();
			const ShadowRootConstructor = control.ownerDocument.defaultView?.ShadowRoot;
			if (!ShadowRootConstructor || !(root instanceof ShadowRootConstructor)) return;
			listening = true;
			disconnect = listenForFormReset(control, () => currentReset());
		};
		connect();
		queueMicrotask(connect);
		return {
			destroy() {
				active = false;
				disconnect();
			},
			update(nextReset) {
				currentReset = nextReset;
				connect();
			}
		};
	}
</script>

<input
	bind:this={ref}
	aria-hidden="true"
	tabindex="-1"
	type="text"
	hidden
	disabled
	data-zui-form-reset-signal=""
	{form}
	use:shadowFormReset={onReset}
	bind:value={() => marker, updateMarker}
/>
