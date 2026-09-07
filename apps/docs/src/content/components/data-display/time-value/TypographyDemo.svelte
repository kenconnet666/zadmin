<script lang="ts">
	import { Time } from '@internationalized/date';
	import {
		ZGroup,
		ZStack,
		ZText,
		ZTimeValue,
		type TimeValueSize,
		type TimeValueTone
	} from '@zadmin/zui';

	const statuses = [
		{ label: '常规 08:00', tone: 'neutral', value: new Time(8) },
		{ label: '信息 09:30', tone: 'info', value: new Time(9, 30) },
		{ label: '成功 12:05', tone: 'success', value: new Time(12, 5) },
		{ label: '警告 17:45', tone: 'warning', value: new Time(17, 45) },
		{ label: '危险 23:15', tone: 'danger', value: new Time(23, 15) }
	] as const satisfies readonly {
		readonly label: string;
		readonly tone: TimeValueTone;
		readonly value: Time;
	}[];
	const sizes = [
		'xsmall',
		'small',
		'medium',
		'large',
		'xlarge',
		'xxlarge',
		'xxxlarge',
		'xxxxlarge'
	] as const satisfies readonly TimeValueSize[];
</script>

<ZStack gap="large">
	<ZStack gap="small">
		<ZText weight="semibold">当日运行状态</ZText>
		<ZText size="small" tone="muted">常规 · 信息 · 成功 · 警告 · 危险</ZText>
		<ZGroup gap="small" itemSizing="equal">
			{#each statuses as status (status.label)}
				<ZTimeValue
					aria-label={status.label}
					title={status.label}
					value={status.value}
					hourCycle={24}
					tabularNumbers
					tone={status.tone}
					truncate
					weight="semibold"
				/>
			{/each}
		</ZGroup>
		<ZText size="small" tone="muted"
			>等宽时间列在窄容器中允许收缩，并通过title与可访问名称保留被截断的状态信息。</ZText
		>
	</ZStack>

	<ZStack gap="small">
		<ZText weight="semibold">八档文字层级</ZText>
		<ZGroup align="baseline" gap="medium" wrap>
			{#each sizes as size (size)}
				<ZTimeValue value={new Time(10, 8)} hourCycle={24} {size} title={size} />
			{/each}
		</ZGroup>
		<ZText size="small" tone="muted"
			>从xsmall到xxxxlarge沿用ZText的Theme字号，并在空间不足时按Group规则换行。</ZText
		>
	</ZStack>
</ZStack>
