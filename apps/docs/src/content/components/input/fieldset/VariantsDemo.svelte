<script lang="ts">
	import { ZFieldset, ZText } from '@zadmin/zui';

	const variants = ['outlined', 'filled', 'plain'] as const;
</script>

<div style="inline-size: min(100%, 18rem); display: grid; gap: 1rem;">
	{#each variants as variant (variant)}
		<ZFieldset
			legend={`这是可换行的很长分组名称 · ${variant}`}
			description="窄容器中legend与说明正常换行，不扩大页面宽度。"
			{variant}
		>
			<ZText>内容保持在真实fieldset布局中。</ZText>
		</ZFieldset>
	{/each}
</div>
