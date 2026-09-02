<script lang="ts">
	import { ZButton, ZIcon, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack gap="medium">
	<ZStack align="center" direction="row" gap="small" wrap>
		<ZButton size="small">
			{#snippet start()}<ZIcon aria-hidden="true" name="check" />{/snippet}
			确认发布
		</ZButton>
		<ZButton aria-label="搜索发布" shape="circle" size="small" variant="secondary">
			<ZIcon aria-hidden="true" name="search" />
		</ZButton>
	</ZStack>
	<ZText tone="muted">
		带文字操作由Button内容命名；icon-only Button由Button的aria-label命名，内部图标保持decorative。
	</ZText>
</ZStack>
