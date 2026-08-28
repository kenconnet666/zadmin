<script lang="ts">
	import {
		MBox,
		MButton,
		MIcon,
		MProvider,
		MStack,
		MText,
		defaultMiniappTheme,
		extendMiniappTheme,
		rpx
	} from '@zadmin/miniapp';
	import { getWeChatPlatform } from '@zadmin/miniapp/platform';

	let count = $state(0);
	let alternate = $state(false);
	let details = $state(true);
	let items = $state([1, 2, 3]);
	const platform = getWeChatPlatform();
	const alternateTheme = extendMiniappTheme(defaultMiniappTheme, {
		color: {
			canvas: '#faf5ff',
			primary: '#7c3aed',
			primaryActive: '#6d28d9',
			surface: '#ede9fe'
		}
	});
	const theme = $derived(alternate ? alternateTheme : defaultMiniappTheme);
	const statusStyle = $derived({
		opacity: count % 2 === 0 ? theme.opacity.active : theme.opacity.opaque,
		width: rpx(480 + count * 8)
	});

	function rotateItems(): void {
		items = items.length < 5 ? [...items, items.length + 1] : [...items.slice(1), items[0]];
	}

	function openCapabilityLab(): void {
		void platform.navigation.navigateTo({ url: '/pages/capabilities/index' });
	}
</script>

<MProvider {theme}>
	<MBox style={{ backgroundColor: theme.color.canvas, minHeight: '100vh', padding: '48rpx 32rpx' }}>
		<MStack gap="large">
			<MText size="xlarge" weight="bold">Svelte → Miniapp → WeChat</MText>
			<MBox id="dynamic-style" style={statusStyle}>
				<MText id="status" tone="muted">runtime ready · count {count}</MText>
			</MBox>

			<MStack direction="row" gap="small" wrap>
				<MButton id="counter" onclick={() => (count += 1)}>Increment</MButton>
				<MButton id="theme" variant="secondary" onclick={() => (alternate = !alternate)}>
					Theme
				</MButton>
				<MButton id="details" variant="ghost" onclick={() => (details = !details)}>Details</MButton>
			</MStack>

			{#if details}<MText id="details-text">Conditional content is active.</MText>{/if}

			<MStack direction="row" gap="small" align="center">
				<MIcon name="menu" label="Items" />
				{#each items as item (item)}<MText>#{item}</MText>{/each}
				<MButton id="items" size="small" variant="secondary" onclick={rotateItems}>
					Update list
				</MButton>
			</MStack>

			<MText tone="muted">
				Sensitive authorization and payment remain explicit server-coordinated business flows.
			</MText>
			<MButton id="capability-lab" variant="secondary" onclick={openCapabilityLab}>
				Open capability lab
			</MButton>
		</MStack>
	</MBox>
</MProvider>
