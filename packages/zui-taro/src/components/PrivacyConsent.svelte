<script lang="ts">
	import Button from './Button.svelte';
	import type { PrivacyConsentProps } from './types.ts';

	let { children, onAgree, ...rest }: PrivacyConsentProps = $props();
</script>

<Button {...rest} openType="agreePrivacyAuthorization" onAgreePrivacyAuthorization={onAgree}>
	{@render children?.()}
</Button>
