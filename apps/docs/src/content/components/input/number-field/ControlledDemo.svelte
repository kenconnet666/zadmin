<script lang="ts">
	import { ZButton, ZNumberField, ZStack, ZText } from '@zadmin/zui';

	let value = $state<number | undefined>(12.5);
</script>

<ZStack gap="medium">
	<ZNumberField bind:value inputLabel="受控金额" precision={2} />
	<ZStack direction="row" gap="small" wrap>
		<ZButton type="button" variant="secondary" onclick={() => (value = undefined)}>
			外部清空
		</ZButton>
		<ZButton type="button" variant="secondary" onclick={() => (value = 7.25)}>
			外部写入 7.25
		</ZButton>
	</ZStack>
	<ZText tone="muted">value = {value ?? 'undefined'}</ZText>
</ZStack>
