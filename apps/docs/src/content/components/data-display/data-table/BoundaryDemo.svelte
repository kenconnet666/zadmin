<script lang="ts">
	import { ZAlert, ZDescriptionList, ZLink, ZStack, ZText } from '@zadmin/zui';

	const boundaries = [
		{
			id: 'core',
			term: 'ZDataTable核心',
			description: '原生表格语义、稳定排序、行选择、固定行高虚拟化与自定义cell。'
		},
		{
			id: 'owner',
			term: '调用方所有权',
			description: '请求、筛选、分页、loading、error、缓存和URL状态由页面或数据层组合。'
		},
		{
			id: 'x',
			term: '独立DataGrid/X轨道',
			description: '列固定/拖拽/分组、树数据、编辑、聚合、导出等重能力不塞进轻量核心。'
		}
	];
</script>

<ZStack gap="medium">
	<ZAlert live="off" title="边界优先于目录对齐" tone="info">
		ZUI参考成熟表格的场景覆盖和受控合同，但不复制React/Vue API，也不把远程数据状态伪装成表格内建能力。
	</ZAlert>
	<ZDescriptionList aria-label="DataTable能力边界" items={boundaries} />
	<ZText tone="muted">
		对照：
		<ZLink href="https://ant.design/components/table/">Ant Design Table</ZLink>、
		<ZLink href="https://www.naiveui.com/en-US/os-theme/components/data-table"
			>Naive UI DataTable</ZLink
		>、
		<ZLink href="https://mui.com/x/react-data-grid/">MUI X Data Grid</ZLink>。
	</ZText>
</ZStack>
