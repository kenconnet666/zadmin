<script lang="ts">
	import { ZInput, ZStack } from '@zadmin/zui';
</script>

<ZStack gap="medium">
	<ZInput aria-label="小尺寸搜索" placeholder="搜索组件" size="small" type="search" />
	<ZInput aria-label="邮箱" autocomplete="email" placeholder="name@example.com" type="email" />
	<ZInput
		aria-label="大尺寸密码"
		autocomplete="current-password"
		placeholder="密码"
		size="large"
		type="password"
	/>
	<ZInput aria-label="禁用输入" disabled value="不可编辑" />
</ZStack>
