<script lang="ts">
	import { ZLink, ZStack } from '@zadmin/zui';
</script>

<ZStack direction="row" gap="large" wrap>
	<ZLink href="#/components/link">默认链接</ZLink>
	<ZLink href="#/components/button" tone="muted" underline="hover">弱化链接</ZLink>
	<ZLink href="#/components/alert-dialog" tone="danger">危险操作说明</ZLink>
	<ZLink href="#/components/text" underline="none">无下划线导航</ZLink>
</ZStack>
