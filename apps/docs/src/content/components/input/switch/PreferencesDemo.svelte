<script lang="ts">
	import { ZProvider, ZStack, ZSwitch, ZText } from '@zadmin/zui';
</script>

<ZProvider direction="rtl" motion="reduced">
	<ZStack gap="medium">
		<label
			><ZStack align="center" direction="row" gap="medium"
				><ZSwitch defaultChecked /><ZText>RTL已开启且无过渡动画</ZText></ZStack
			></label
		>
		<label
			><ZStack align="center" direction="row" gap="medium"
				><ZSwitch invalid /><ZText tone="danger">必须启用审计日志</ZText></ZStack
			></label
		>
	</ZStack>
</ZProvider>
