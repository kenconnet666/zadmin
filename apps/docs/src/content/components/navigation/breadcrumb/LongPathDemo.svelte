<script lang="ts">
	import { ZBreadcrumb, ZStack, ZText } from '@zadmin/zui';

	const items = [
		{ href: '/operations', key: 'operations', label: '运营工作台' },
		{
			href: '/operations/settlement',
			key: 'settlement',
			label: '华东区域合作伙伴结算与对账中心（2026年第三季度）'
		},
		{ current: true, key: 'review', label: '待复核账单' }
	] as const;
</script>

<ZStack gap="small" style="max-width: 22rem">
	<ZText tone="muted">窄容器保留完整路径，长标签在自身可用宽度内换行。</ZText>
	<ZBreadcrumb aria-label="账单位置" {items} />
</ZStack>
