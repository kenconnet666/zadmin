<script lang="ts">
	import { ZBreadcrumb, ZButton, ZStack, ZText, type BreadcrumbCollapseOptions } from '@zadmin/zui';

	type CollapseMode = false | true | BreadcrumbCollapseOptions;

	const items = [
		{ href: '/workspace', key: 'workspace', label: '工作台' },
		{ href: '/workspace/operations', key: 'operations', label: '运营中心' },
		{ href: '/workspace/operations/settlement', key: 'settlement', label: '结算与对账中心' },
		{
			href: '/workspace/operations/settlement/quarterly',
			key: 'quarterly',
			label: '2026年第三季度交付审核'
		},
		{
			href: '/workspace/operations/settlement/quarterly/partners',
			key: 'partners',
			label: '华东区域合作伙伴清单'
		},
		{
			current: true,
			href: '/workspace/operations/settlement/quarterly/partners/review',
			key: 'review',
			label: '待复核账单'
		}
	] as const;

	let mode = $state<CollapseMode>(true);
</script>

<ZStack gap="small">
	<ZText tone="muted">拖动容器宽度；省略入口打开真实Popover后仍可访问被隐藏的祖先链接。</ZText>
	<ZStack direction="row" gap="small" wrap>
		<ZButton
			size="small"
			variant={mode === false ? 'solid' : 'outline'}
			onclick={() => (mode = false)}
		>
			完整路径
		</ZButton>
		<ZButton
			size="small"
			variant={mode === true ? 'solid' : 'outline'}
			onclick={() => (mode = true)}
		>
			collapse=true
		</ZButton>
		<ZButton
			size="small"
			variant={typeof mode === 'object' ? 'solid' : 'outline'}
			onclick={() => (mode = { maxItems: 5, maxRows: 1, keepFirst: true })}
		>
			maxItems=5
		</ZButton>
	</ZStack>
	<div style="resize: horizontal; overflow: auto; max-width: 100%; min-width: 16rem;">
		<ZBreadcrumb aria-label="交付审核路径" {items} collapse={mode} />
	</div>
</ZStack>
