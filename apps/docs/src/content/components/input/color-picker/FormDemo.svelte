<script lang="ts">
	import { ZButton, ZColorPicker, ZStack, ZText } from '@zadmin/zui';

	let value = $state('#2563ebcc');
</script>

<form>
	<ZStack gap="medium">
		<ZColorPicker
			allowAlpha
			alphaLabel="透明度"
			bind:value
			colorInputLabel="选择基础颜色"
			defaultValue="#2563ebcc"
			hexInputLabel="Hex颜色"
			name="accent"
			triggerLabel={(current) => `主题强调色 ${current}`}
		/>
		<ZButton type="reset" variant="secondary">重置</ZButton>
		<ZText tone="muted">value = {value}</ZText>
	</ZStack>
</form>
