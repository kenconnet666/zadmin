<script lang="ts">
	import { Time } from '@internationalized/date';
	import { ZStack, ZText, ZTimeGrid, ZTimeValue, type TimeGridSlot } from '@zadmin/zui';

	const slots = Object.freeze<readonly TimeGridSlot[]>([
		Object.freeze({ value: new Time(8, 30) }),
		Object.freeze({ label: '晨会', value: new Time(9) }),
		Object.freeze({ label: '午间窗口', value: new Time(12, 30) }),
		Object.freeze({ value: new Time(15) }),
		Object.freeze({ value: new Time(17, 30) })
	]);
	let value = $state<Time | null>(new Time(9));
</script>

<ZStack gap="medium">
	<ZTimeGrid bind:value allowDeselect columns={3} gridLabel="会议时隙" hourCycle={24} {slots} />
	<ZText tone="muted">
		{#if value}
			当前值：
			<ZTimeValue {value} hourCycle={24} weight="semibold" />
		{:else}
			当前值：空
		{/if}
	</ZText>
</ZStack>
