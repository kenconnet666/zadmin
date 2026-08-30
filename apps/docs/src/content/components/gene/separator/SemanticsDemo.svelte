<script lang="ts">
	import { ZSeparator, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack gap="large">
	<ZText>装饰分隔线不会进入可访问树。</ZText>
	<ZSeparator decorative />
	<ZText>有语义的分隔线保留separator角色。</ZText>
	<ZSeparator />
</ZStack>
