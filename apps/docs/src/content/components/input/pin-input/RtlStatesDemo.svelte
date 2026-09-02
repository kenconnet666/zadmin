<script lang="ts">
	import { ZPinInput, ZProvider, ZStack, ZText } from '@zadmin/zui';
</script>

<ZProvider direction="rtl">
	<ZStack gap="medium">
		<ZText>RTL方向键按视觉方向移动，字符串身份仍保持逻辑顺序。</ZText>
		<ZPinInput
			defaultValue="1234"
			inputLabel={(index, length) => `رمز ${index + 1} من ${length}`}
			length={4}
			readonly
			size="large"
		/>
		<ZPinInput
			inputLabel={(index, length) => `خطأ ${index + 1} من ${length}`}
			invalid
			length={4}
			size="small"
		/>
	</ZStack>
</ZProvider>
