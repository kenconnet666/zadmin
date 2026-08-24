<script lang="ts">
	import Button from './Button.svelte';
	import type { PhoneNumberButtonProps, PhoneNumberCode, PhoneNumberCodeEvent } from './types.ts';

	let { children, onCode, onFailure, ...rest }: PhoneNumberButtonProps = $props();

	function handlePhoneNumber(event: PhoneNumberCodeEvent['rawEvent']): void {
		const detail = event.detail;
		if (typeof detail?.code !== 'string' || detail.code.length === 0) {
			onFailure?.(event);
			return;
		}
		onCode?.({ code: detail.code as PhoneNumberCode, rawEvent: event });
	}
</script>

<Button {...rest} openType="getPhoneNumber" onGetPhoneNumber={handlePhoneNumber}>
	{@render children?.()}
</Button>
