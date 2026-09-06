<script lang="ts">
	import Heart from '@lucide/svelte/icons/heart';
	import { ZProvider, ZRating, ZStack, ZText } from '@zadmin/zui';

	const examples = [
		{ size: 'xsmall', tone: 'neutral' },
		{ size: 'small', tone: 'info' },
		{ size: 'medium', tone: 'success' },
		{ size: 'large', tone: 'warning' },
		{ size: 'xlarge', tone: 'danger' }
	] as const;
</script>

<ZStack gap="medium">
	{#each examples as example (example.size)}
		<ZRating
			label={`${example.size}自定义爱心评分`}
			itemLabel={(value) => `${value}颗爱心`}
			defaultValue={3}
			size={example.size}
			tone={example.tone}
		>
			{#snippet item(context)}
				<Heart aria-hidden="true" fill={context.state === 'filled' ? 'currentColor' : 'none'} />
			{/snippet}
		</ZRating>
	{/each}
	<ZProvider direction="rtl">
		<ZText>RTL方向键按视觉方向移动：</ZText>
		<ZRating label="RTL评分" itemLabel={(value) => `${value}星`} defaultValue={2} />
	</ZProvider>
</ZStack>
