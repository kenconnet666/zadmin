<script lang="ts">
	import { ZCard, ZProvider, ZSimpleGrid, ZText } from '@zadmin/zui';

	const items = [
		'华东区域合作伙伴结算与对账中心（2026年第三季度）',
		'معالجة طلبات الشراكات والموافقات المؤسسية',
		'workspace-production-release-with-an-intentionally-long-unbroken-identifier'
	];
</script>

<ZProvider direction="rtl" locale="ar-EG">
	<ZSimpleGrid minItemWidth="14rem">
		{#each items as item (item)}
			<ZCard><ZText style="overflow-wrap: anywhere">{item}</ZText></ZCard>
		{/each}
	</ZSimpleGrid>
</ZProvider>
