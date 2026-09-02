<script lang="ts">
	import { ZPinInput, ZStack } from '@zadmin/zui';
</script>

<ZStack gap="large">
	<ZPinInput
		inputLabel={(index, length) => `遮罩安全码第${index + 1}位，共${length}位`}
		length={4}
		mask
		mode="numeric"
	/>
	<ZPinInput
		defaultValue="AB12"
		inputLabel={(index, length) => `文本码第${index + 1}位，共${length}位`}
		length={4}
		mode="text"
		validateCharacter={(character) => /^[A-Z0-9]$/u.test(character)}
	/>
	<ZPinInput
		disabled
		defaultValue="1234"
		inputLabel={(index, length) => `禁用码第${index + 1}位，共${length}位`}
		length={4}
	/>
</ZStack>
