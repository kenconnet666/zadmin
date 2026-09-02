<script lang="ts">
	import Globe2 from '@lucide/svelte/icons/globe-2';
	import { ZInput, ZInputGroup, ZProvider, ZStack, ZText } from '@zadmin/zui';
</script>

<ZProvider direction="rtl">
	<ZStack gap="small" style="inline-size: min(100%, 22rem);">
		<ZInputGroup aria-label="RTL资源地址">
			{#snippet prefix()}
				<Globe2 aria-hidden="true" size={16} />
				production-platform-service
			{/snippet}
			<ZInput aria-label="资源标识" placeholder="resource-id" />
			{#snippet suffix()}.internal.example{/snippet}
		</ZInputGroup>
		<ZText tone="muted"
			>逻辑prefix位于RTL起始侧；长affix在窄容器内截断，control保留可输入宽度。</ZText
		>
	</ZStack>
</ZProvider>
