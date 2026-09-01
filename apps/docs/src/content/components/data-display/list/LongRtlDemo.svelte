<script lang="ts">
	import { ZBox, ZLink, ZList, ZProvider } from '@zadmin/zui';
	const items = [
		{
			key: 'release',
			label: 'معرّف نشر طويل / 超长部署标识',
			description:
				'production-platform/services/reporting/deployments/2026-09-02/extremely-long-resource-identifier'
		}
	];
</script>

<ZProvider direction="rtl">
	<ZBox style="max-width: 22rem;">
		<ZList {items}>
			{#snippet action()}<ZLink href="#/components/list">打开</ZLink>{/snippet}
		</ZList>
	</ZBox>
</ZProvider>
