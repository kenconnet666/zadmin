<script lang="ts">
	import {
		ZAspectRatio,
		ZBox,
		ZButton,
		ZCard,
		ZIcon,
		ZStack,
		ZText,
		defaultTheme,
		icss
	} from '@zadmin/zui';

	const mediaClass = icss(defaultTheme, (s) => {
		s.backgroundColor._surface;
		s.color._primary;
		s.display.grid;
		s.height._full;
		s.placeItems.center;
	});
</script>

<ZCard variant="outlined">
	{#snippet media()}
		<ZAspectRatio ratio="16 / 5">
			<ZBox class={mediaClass}><ZIcon label="团队资料封面" name="user" size="large" /></ZBox>
		</ZAspectRatio>
	{/snippet}
	{#snippet header()}
		<ZStack gap="small"><strong>生产团队</strong><ZText tone="muted">12名成员</ZText></ZStack>
	{/snippet}
	<ZText>media不带Card内边距，正文、footer和actions保持独立DOM区域。</ZText>
	{#snippet actions()}
		<ZButton size="small" variant="secondary">查看成员</ZButton>
		<ZButton size="small">邀请</ZButton>
	{/snippet}
</ZCard>
