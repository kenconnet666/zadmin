<script lang="ts">
	import { defaultTheme, defineTheme } from '@zadmin/zui/core';

	import {
		Box,
		Button,
		CapabilityGate,
		PhoneNumberButton,
		PrivacyConsent,
		Stack,
		Text,
		ZuiProvider
	} from '../src/index.ts';

	let count = $state(0);
	let alternate = $state(false);
	const alternateTheme = defineTheme({
		...defaultTheme,
		color: { ...defaultTheme.color, primary: '#7c3aed', surface: '#ede9fe' }
	});
	const theme = $derived(alternate ? alternateTheme : defaultTheme);
</script>

<ZuiProvider {theme}>
	<Box id="gallery" style={{ padding: '12px' }}>
		<Stack gap="small">
			<Text size="large" weight="bold">count:{count}</Text>
			<Button id="increment" onclick={() => (count += 1)}>increment</Button>
			<Button id="theme" variant="secondary" onclick={() => (alternate = !alternate)}>theme</Button>
			<CapabilityGate status="available"><Text>capability-ready</Text></CapabilityGate>
			<PrivacyConsent id="privacy">privacy</PrivacyConsent>
			<PhoneNumberButton id="phone">phone</PhoneNumberButton>
		</Stack>
	</Box>
</ZuiProvider>
