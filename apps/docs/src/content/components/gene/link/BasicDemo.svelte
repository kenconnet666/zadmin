<script lang="ts">
	import { ZLink, ZStack } from '@zadmin/zui';
</script>

<ZStack direction="row" gap="large" wrap>
	<ZLink href="#/components/link">默认链接</ZLink>
	<ZLink href="https://github.com/kenconnet666/zadmin" target="_blank">外部链接</ZLink>
	<ZLink href="#danger" tone="danger" underline="always">危险操作说明</ZLink>
	<ZLink disabled href="#disabled">禁用链接</ZLink>
</ZStack>
