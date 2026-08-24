<script lang="ts">
	import {
		Box,
		Button,
		CapabilityGate,
		bindTaroIcss,
		createIcssSlot,
		defaultTheme,
		defaultIcss,
		defineTheme,
		PhoneNumberButton,
		PrivacyConsent,
		Stack,
		slotValues,
		Text,
		ZuiProvider
	} from '@zadmin/zui-taro';
	import { getWeChatPlatform } from '@zadmin/svelte-taro/platform';

	let count = $state(0);
	let alternate = $state(false);
	let details = $state(true);
	let items = $state([1, 2, 3]);
	const alternateTheme = defineTheme({
		...defaultTheme,
		color: {
			...defaultTheme.color,
			canvas: '#faf5ff',
			primary: '#7c3aed',
			primaryHover: '#6d28d9',
			surface: '#ede9fe'
		}
	});
	const theme = $derived(alternate ? alternateTheme : defaultTheme);
	const statusWidth = createIcssSlot('status-width', 'statusWidth');
	const statusOpacity = createIcssSlot('status-opacity', 'statusOpacity');
	const statusIcss = defaultIcss((css) => {
		css.width.px(statusWidth);
		css.opacity(statusOpacity);
	});
	const statusStyle = $derived(
		bindTaroIcss(
			statusIcss,
			slotValues([
				[statusWidth, 240 + count * 4],
				[statusOpacity, count % 2 === 0 ? 0.72 : 1]
			])
		)
	);

	function rotateItems(): void {
		items = items.length < 5 ? [...items, items.length + 1] : [...items.slice(1), items[0]];
	}

	function openCapabilityLab(): void {
		void getWeChatPlatform().raw.navigateTo({ url: '/pages/capabilities/index' });
	}
</script>

<ZuiProvider {theme}>
	<Box style={{ backgroundColor: theme.color.canvas, minHeight: '100vh', padding: '24px 16px' }}>
		<Stack gap="large">
			<Text size="xlarge" weight="bold">Svelte → Taro → ZUI</Text>
			<Box id="dynamic-style" class={statusIcss.className} style={statusStyle}>
				<Text id="status" color="textMuted">runtime ready · count {count}</Text>
			</Box>

			<Stack direction="row" gap="small">
				<Button id="counter" onclick={() => (count += 1)}>Increment</Button>
				<Button id="theme" variant="secondary" onclick={() => (alternate = !alternate)}>
					Theme
				</Button>
				<Button id="details" variant="ghost" onclick={() => (details = !details)}>Details</Button>
			</Stack>

			{#if details}<Text id="details-text">Conditional content is active.</Text>{/if}

			<Stack direction="row" gap="small">
				{#each items as item (item)}<Text>#{item}</Text>{/each}
				<Button id="items" size="small" variant="secondary" onclick={rotateItems}
					>Update list</Button
				>
			</Stack>

			<CapabilityGate status="available">
				<Text color="textMuted"
					>Platform flow components are wired; sensitive actions stay manual.</Text
				>
			</CapabilityGate>
			<Button id="capability-lab" variant="secondary" onclick={openCapabilityLab}>
				Open capability lab
			</Button>
			<Stack direction="row" gap="small">
				<PrivacyConsent id="privacy" size="small" variant="ghost">Privacy flow</PrivacyConsent>
				<PhoneNumberButton id="phone" size="small" variant="ghost">Phone flow</PhoneNumberButton>
			</Stack>
		</Stack>
	</Box>
</ZuiProvider>
