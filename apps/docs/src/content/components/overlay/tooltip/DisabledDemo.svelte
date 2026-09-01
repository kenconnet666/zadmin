<script lang="ts">
	import { ZStack, ZText, ZTooltip, ZTooltipContent, ZTooltipTrigger } from '@zadmin/zui';
</script>

<ZStack gap="medium">
	<ZTooltip delay={0}>
		<ZTooltipTrigger disabled tone="danger">删除生产环境</ZTooltipTrigger>
		<ZTooltipContent>当前账号没有删除权限</ZTooltipContent>
	</ZTooltip>
	<ZText tone="muted">
		禁用原生按钮由非Tab wrapper承接pointer hover；键盘用户通过这段常驻说明获知原因。
	</ZText>
</ZStack>
