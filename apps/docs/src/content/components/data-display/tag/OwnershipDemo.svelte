<script lang="ts">
	import { ZStack, ZTag, ZTagsInput, ZText } from '@zadmin/zui';

	let standaloneVisible = $state(true);
</script>

<ZStack gap="medium">
	<ZStack align="center" direction="row" gap="small" wrap>
		{#if standaloneVisible}
			<ZTag onRemove={() => (standaloneVisible = false)} removable textValue="standalone">
				standalone
			</ZTag>
		{/if}
		<ZText tone="muted">独立remove按钮保持tabindex=0。</ZText>
	</ZStack>
	<ZTagsInput aria-label="复合标签owner" defaultValue={['production', 'stable']} />
	<ZText tone="muted">
		TagsInput把内部Tag removeTabIndex设为-1，并自行拥有方向键、删除后的焦点恢复和集合状态。
	</ZText>
</ZStack>
