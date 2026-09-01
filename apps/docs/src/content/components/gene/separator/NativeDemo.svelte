<script lang="ts">
	import { ZSeparator, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack gap="medium">
	<ZSeparator data-separator-owner="native" id="native-separator" />
	<ZStack align="stretch" direction="row" gap="medium">
		<ZText>左侧</ZText>
		<ZSeparator data-separator-owner="vertical" orientation="vertical" />
		<ZText>右侧</ZText>
	</ZStack>
	<ZText tone="muted"
		>currentColor线条保留Theme颜色，也允许forced-colors映射；原生id/data属性不丢失。</ZText
	>
</ZStack>
