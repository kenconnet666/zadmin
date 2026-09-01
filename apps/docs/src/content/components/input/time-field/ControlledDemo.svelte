<script lang="ts">
	import { Time } from '@internationalized/date';
	import { ZButton, ZField, ZStack, ZText, ZTimeField } from '@zadmin/zui';

	let value = $state<Time | null>(null);
</script>

<ZStack gap="medium">
	<ZField label="受控执行时间"><ZTimeField bind:value granularity="second" /></ZField>
	<ZStack align="center" direction="row" gap="small" wrap>
		<ZButton onclick={() => (value = new Time(18, 30, 15))}>写入 18:30:15</ZButton>
		<ZButton onclick={() => (value = null)} variant="secondary">显式写入 null</ZButton>
		<ZText tone="muted">owner = {value?.toString() ?? 'null'}</ZText>
	</ZStack>
</ZStack>
