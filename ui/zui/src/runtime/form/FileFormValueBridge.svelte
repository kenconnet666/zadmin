<script module lang="ts">
	import type { FileUploadItem } from '../file.js';

	export interface FileFormValueBridgeProps {
		readonly disabled?: boolean;
		readonly files: readonly FileUploadItem[];
		readonly form?: string;
		readonly name?: string;
		readonly onReset: () => void;
	}
</script>

<script lang="ts">
	import { formReset } from './form-control.svelte.js';

	interface BridgeOptions {
		readonly association?: string;
		readonly disabled: boolean;
		readonly files: readonly FileUploadItem[];
		readonly name?: string;
		readonly reset: () => void;
	}

	let { disabled = false, files, form, name, onReset }: FileFormValueBridgeProps = $props();

	const resolvedName = $derived.by(() => {
		if (name === '') throw new TypeError('File form field name must not be empty.');
		return name;
	});

	function bridgeFiles(
		control: HTMLInputElement,
		initial: BridgeOptions
	): { destroy(): void; update(options: BridgeOptions): void } {
		let active = true;
		let current = initial;
		let associatedForm: HTMLFormElement | null = null;
		let observer: MutationObserver | undefined;
		const resetAction = formReset(control, () => current.reset());

		const appendFiles = (event: Event) => {
			if (current.disabled || !current.name) return;
			const formData = (event as Event & { readonly formData?: FormData }).formData;
			if (!formData) return;
			for (const item of current.files) {
				formData.append(current.name, item.file, item.file.name);
			}
		};
		const connect = () => {
			if (!active) return;
			const next = control.form;
			if (associatedForm === next) return;
			associatedForm?.removeEventListener('formdata', appendFiles);
			associatedForm = next;
			associatedForm?.addEventListener('formdata', appendFiles);
		};

		const observeOwner = () => {
			observer?.disconnect();
			observer = undefined;
			if (!current.association) return;
			const MutationObserverConstructor = control.ownerDocument.defaultView?.MutationObserver;
			if (!MutationObserverConstructor) return;
			observer = new MutationObserverConstructor(() => queueMicrotask(connect));
			observer.observe(control.ownerDocument, {
				attributeFilter: ['form', 'id'],
				attributes: true,
				childList: true,
				subtree: true
			});
		};
		observeOwner();
		queueMicrotask(connect);

		return {
			destroy() {
				active = false;
				observer?.disconnect();
				associatedForm?.removeEventListener('formdata', appendFiles);
				resetAction.destroy();
			},
			update(next) {
				const associationChanged = current.association !== next.association;
				current = next;
				if (associationChanged) observeOwner();
				resetAction.update(() => current.reset());
				queueMicrotask(connect);
			}
		};
	}
</script>

<!--
	A file input's FileList cannot be portably constructed in every realm. This stable, disabled
	association anchor appends the authoritative queue during the native `formdata` event instead,
	so removals, retries and controlled replacement stay exact without inventing a transport.
-->
<input
	aria-hidden="true"
	tabindex={-1}
	type="hidden"
	hidden
	disabled
	{form}
	data-zui-file-form-value=""
	use:bridgeFiles={{ association: form, disabled, files, name: resolvedName, reset: onReset }}
/>
