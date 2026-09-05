<script lang="ts">
	import { ZInput, ZInputGroup, ZProvider, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack gap="medium">
	<ZProvider componentDefaults={{ input: { size: 'large' } }}>
		<ZInputGroup aria-label="Provider默认尺寸组合">
			{#snippet prefix()}https://{/snippet}
			<ZInput aria-label="默认尺寸资源" placeholder="resource-id" />
			{#snippet suffix()}.internal{/snippet}
		</ZInputGroup>
		<ZText tone="muted">Group、affix与直接文本control共享Provider的input默认尺寸。</ZText>
	</ZProvider>
	<ZInputGroup aria-label="小尺寸必填组合" required size="small">
		{#snippet prefix()}ID{/snippet}
		<ZInput aria-label="小尺寸值" />
	</ZInputGroup>
	<ZInputGroup aria-label="只读组合" readonly>
		{#snippet prefix()}env/{/snippet}
		<ZInput aria-label="只读值" value="production" />
	</ZInputGroup>
	<ZInputGroup aria-label="禁用且无效组合" disabled invalid size="large">
		<ZInput aria-label="禁用值" value="locked" />
	</ZInputGroup>
</ZStack>
