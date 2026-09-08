<script lang="ts">
	import { Time } from '@internationalized/date';
	import { ZButton, ZStack, ZText, ZTimeField, type TimeGranularity } from '@zadmin/zui';

	let hourCycle = $state<12 | 24>(12);
	let granularity = $state<TimeGranularity>('minute');
	let readonly = $state(false);
	let disabled = $state(false);
	let value = $state<Time | null>(new Time(14, 30, 20));
</script>

<ZStack gap="medium">
	<ZStack direction="row" gap="small" wrap>
		<ZButton
			aria-pressed={hourCycle === 24}
			data-testid="time-field-hour-cycle"
			size="small"
			variant="outline"
			onclick={() => (hourCycle = hourCycle === 12 ? 24 : 12)}>hourCycle={hourCycle}</ZButton
		>
		<ZButton
			aria-pressed={granularity === 'second'}
			data-testid="time-field-granularity"
			size="small"
			variant="outline"
			onclick={() => (granularity = granularity === 'minute' ? 'second' : 'minute')}
			>granularity={granularity}</ZButton
		>
		<ZButton
			aria-pressed={readonly}
			data-testid="time-field-readonly"
			size="small"
			variant="outline"
			onclick={() => (readonly = !readonly)}>readonly={readonly}</ZButton
		>
		<ZButton
			aria-pressed={disabled}
			data-testid="time-field-disabled"
			size="small"
			variant="outline"
			onclick={() => (disabled = !disabled)}>disabled={disabled}</ZButton
		>
	</ZStack>
	<ZTimeField
		aria-label="可操作时间"
		bind:value
		data-testid="time-field-modes-interactive"
		{disabled}
		{granularity}
		{hourCycle}
		minuteStep={15}
		{readonly}
		secondStep={10}
	/>
	<ZText data-testid="time-field-modes-state" tone="muted">
		value={value?.toString() ?? 'null'}
	</ZText>
</ZStack>
