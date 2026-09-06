<script lang="ts">
	import { ZCard, ZSimpleGrid, ZText } from '@zadmin/zui';

	const services = ['账户', '项目', '通知', '审计', '账单', '集成'];
</script>

<ZSimpleGrid columns={3} gap="medium">
	{#each services as service (service)}
		<ZCard><ZText weight="semibold">{service}</ZText></ZCard>
	{/each}
</ZSimpleGrid>
