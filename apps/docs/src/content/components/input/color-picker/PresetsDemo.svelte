<script lang="ts">
	import { ZColorPicker, ZStack, ZText } from '@zadmin/zui';

	let value = $state<string | null>('#2563ebff');
	const presets = [
		{ label: '主色', value: '#2563eb' },
		{ label: '成功', value: '#16a34a' },
		{ label: '警告半透明', value: '#d9770680' },
		{ label: '危险', value: '#dc2626' }
	];
</script>

<ZStack gap="medium">
	<ZColorPicker allowAlpha bind:value {presets} />
	<ZText tone="muted">preset value = {value}</ZText>
</ZStack>
