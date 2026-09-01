<script lang="ts">
	import { ZLink, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack gap="medium" style="max-width: 20rem;">
	<ZLink
		external
		href="https://example.com/organizations/production-platform/deployments/2026/09/02/extremely-long-resource-identifier"
	>
		https://example.com/organizations/production-platform/deployments/2026/09/02/extremely-long-resource-identifier
	</ZLink>
	<ZText tone="muted">长URL使用overflow-wrap:anywhere，外链图标保持在逻辑末端。</ZText>
</ZStack>
