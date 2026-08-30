<script lang="ts">
	import { ZStack, ZTag, ZText } from '@zadmin/zui';
	let visible = $state(true);
</script>

<ZStack direction="row" gap="medium" align="center"
	>{#if visible}<ZTag removable removeLabel="移除 production" onRemove={() => (visible = false)}
			>production</ZTag
		>{/if}<ZTag tone="success">已验证</ZTag><ZText tone="muted">visible = {visible}</ZText></ZStack
>
