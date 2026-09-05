<script lang="ts">
	import { ZLink, ZStack } from '@zadmin/zui';
</script>

<ZStack direction="row" gap="medium" wrap>
	<ZLink appearance="text" href="#/components/text">正文链接</ZLink>
	<ZLink appearance="button" href="#/components/button" size="small" variant="secondary"
		>链接按钮</ZLink
	>
	<ZLink appearance="navigation" aria-current="page" href="#/components/link">当前导航</ZLink>
	<ZLink appearance="navigation" href="#/components/card">其他导航</ZLink>
</ZStack>
