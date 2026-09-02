<script lang="ts">
	import { ZPinInput, ZStack, ZText } from '@zadmin/zui';

	let value = $state<string | null>('你A🙂');
</script>

<ZStack gap="small">
	<ZPinInput
		bind:value
		autocomplete="off"
		inputLabel={(index, length) => `Unicode码第${index + 1}位，共${length}位`}
		length={4}
		mode="text"
	/>
	<ZText tone="muted">
		text模式按grapheme分格；拼音、日文等IME
		composition结束后一次提交，composition期间方向键不会被劫持。
	</ZText>
	<ZText tabularNumbers>当前值：{value ?? 'null'}</ZText>
</ZStack>
