<script lang="ts">
	import Search from '@lucide/svelte/icons/search';
	import { ZButton, ZInput, ZInputGroup, ZStack } from '@zadmin/zui';
</script>

<ZStack gap="medium">
	<ZInputGroup aria-label="带操作的仓库搜索">
		{#snippet prefix()}<Search aria-hidden="true" size={16} />{/snippet}
		<ZInput aria-label="仓库名" placeholder="owner/repository" />
		{#snippet suffixAction()}<ZButton size="small" variant="ghost">搜索</ZButton>{/snippet}
	</ZInputGroup>
	<ZInputGroup aria-label="无效组合输入" invalid
		><ZInput aria-label="无效值" value="bad value" /></ZInputGroup
	>
	<ZInputGroup aria-label="禁用组合输入" disabled
		><ZInput aria-label="禁用值" value="locked" /></ZInputGroup
	>
</ZStack>
