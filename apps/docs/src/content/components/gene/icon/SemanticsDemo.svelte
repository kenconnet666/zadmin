<script lang="ts">
	import { ZIcon, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack align="center" direction="row" gap="large" wrap>
	<ZStack align="center" direction="row" gap="small">
		<ZIcon aria-hidden="true" name="check" size="small" />
		<ZText>装饰图标由相邻文字命名</ZText>
	</ZStack>
	<ZIcon label="警告" name="warning" size="large" />
	<ZIcon label="用户" name="user" size={30} strokeWidth={1.5} />
</ZStack>
