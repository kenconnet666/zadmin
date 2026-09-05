<script lang="ts">
	import { ZButton, ZStack, ZTag, ZText, type TagSize, type TagTone } from '@zadmin/zui';
	let visible = $state(true);
	let size = $state<TagSize>('medium');
	let tone = $state<TagTone>('default');
	const sizes: readonly TagSize[] = ['medium', 'small'];
	const tones: readonly TagTone[] = ['default', 'accent', 'success', 'warning', 'danger'];

	function cycleSize(): void {
		size = sizes[(sizes.indexOf(size) + 1) % sizes.length]!;
	}

	function cycleTone(): void {
		tone = tones[(tones.indexOf(tone) + 1) % tones.length]!;
	}
</script>

<ZStack gap="medium">
	<ZStack direction="row" gap="medium" align="center" wrap>
		{#if visible}<ZTag
				{size}
				{tone}
				removable
				removeLabel="移除 production"
				onRemove={() => (visible = false)}>production</ZTag
			>{/if}<ZTag tone="success">已验证</ZTag><ZText tone="muted">visible = {visible}</ZText>
	</ZStack>
	<ZStack direction="row" gap="small" wrap>
		<ZButton size="small" variant="secondary" onclick={cycleSize}>切换 size（{size}）</ZButton>
		<ZButton size="small" variant="secondary" onclick={cycleTone}>切换 tone（{tone}）</ZButton>
		<ZButton size="small" variant="ghost" onclick={() => (visible = !visible)}>
			{visible ? '隐藏' : '显示'}可移除Tag
		</ZButton>
	</ZStack>
</ZStack>
