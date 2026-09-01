<script lang="ts">
	import { ZLink, ZStack } from '@zadmin/zui';
</script>

<ZStack direction="row" gap="large" wrap>
	<ZLink aria-current="page" href="#/components/link" underline="always">当前页面</ZLink>
	<ZLink href="#/components/button">相邻组件</ZLink>
	<ZLink href="#/" tone="muted">返回文档首页</ZLink>
</ZStack>
