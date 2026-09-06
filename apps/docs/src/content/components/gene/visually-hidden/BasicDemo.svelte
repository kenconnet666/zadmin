<script lang="ts">
	import Search from '@lucide/svelte/icons/search';
	import { ZButton, ZVisuallyHidden } from '@zadmin/zui';
</script>

<ZButton size="small" variant="outline">
	<Search aria-hidden="true" size={16} />
	<ZVisuallyHidden>搜索文档</ZVisuallyHidden>
</ZButton>
