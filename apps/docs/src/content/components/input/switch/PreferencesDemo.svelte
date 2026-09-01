<script lang="ts">
	import { ZProvider, ZStack, ZSwitch, ZText } from '@zadmin/zui';
</script>

<ZProvider direction="rtl" motion="reduced">
	<ZStack gap="medium">
		<ZStack align="center" direction="row" gap="medium">
			<ZSwitch defaultChecked id="switch-rtl-motion" />
			<ZText as="label" for="switch-rtl-motion">RTL已开启且无过渡动画</ZText>
		</ZStack>
		<ZStack align="center" direction="row" gap="medium">
			<ZSwitch id="switch-rtl-invalid" invalid />
			<ZText as="label" for="switch-rtl-invalid" tone="danger">必须启用审计日志</ZText>
		</ZStack>
	</ZStack>
</ZProvider>
