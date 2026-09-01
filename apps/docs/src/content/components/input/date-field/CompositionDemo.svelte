<script lang="ts">
	import { CalendarDate } from '@internationalized/date';
	import { ZButton, ZDateField, ZInputGroup, ZStack, ZText } from '@zadmin/zui';

	let value = $state<CalendarDate | null>(new CalendarDate(2026, 9, 16));
</script>

{#snippet actions()}
	<ZButton aria-label="清空组合日期" onclick={() => (value = null)} variant="ghost">清空</ZButton>
{/snippet}

<ZStack gap="small">
	<ZInputGroup suffix={actions}>
		<ZDateField
			appearance="bare"
			formParticipation="none"
			onValueChange={(next) => (value = next)}
			{value}
		/>
	</ZInputGroup>
	<ZText tone="muted">bare外观供复合输入复用；外层拥有清空操作与业务状态。</ZText>
</ZStack>
