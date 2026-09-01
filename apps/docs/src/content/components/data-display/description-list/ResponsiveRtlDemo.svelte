<script lang="ts">
	import { ZBox, ZDescriptionList, ZProvider } from '@zadmin/zui';
	const items = [
		{
			key: 'resource',
			term: 'معرّف المورد / 资源标识',
			description:
				'production-platform/services/reporting/deployments/2026-09-02/extremely-long-resource-identifier'
		},
		{ key: 'region', term: 'المنطقة / 区域', description: 'cn-east-1' },
		{ key: 'owner', term: 'المالك / 所有者', description: 'Platform Engineering' }
	];
</script>

<ZProvider direction="rtl">
	<ZBox style="max-width: 44rem;">
		<ZDescriptionList aria-label="RTL响应式元数据" {items} />
	</ZBox>
</ZProvider>
