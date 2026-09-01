<script lang="ts">
	import CircleDollarSign from '@lucide/svelte/icons/circle-dollar-sign';
	import { ZStack, ZStatistic } from '@zadmin/zui';
</script>

<ZStack direction="row" gap="xlarge" wrap>
	<ZStatistic label="可用率" value={99.97} formatOptions={{ minimumFractionDigits: 2 }}>
		{#snippet suffix()}%{/snippet}
	</ZStatistic>
	<ZStatistic label="节省成本" value={18420} trend={0}>
		{#snippet prefix()}<CircleDollarSign aria-hidden="true" size={20} />{/snippet}
		{#snippet suffix()}
			/ 月{/snippet}
	</ZStatistic>
</ZStack>
