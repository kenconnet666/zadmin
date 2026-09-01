<script lang="ts">
	import { ZAlert, ZDescriptionList, ZLink, ZStack, ZText } from '@zadmin/zui';

	const boundaries = [
		{
			id: 'core',
			term: 'ZDataTable核心',
			description:
				'原生表格语义、受控排序、行选择/展开、列可见性/调整/sticky、异步反馈与typed-key行虚拟化。'
		},
		{
			id: 'owner',
			term: '调用方所有权',
			description:
				'请求、筛选、分页、缓存和URL状态由页面或数据层组合；sortingMode=server避免当前页二次排序。'
		},
		{
			id: 'x',
			term: '独立DataGrid/X轨道',
			description:
				'单元格编辑、clipboard、pivot、聚合、列虚拟化、列/行拖拽和Excel式箭头导航不塞进原生Table核心。'
		}
	];
</script>

<ZStack gap="medium">
	<ZAlert live="off" title="边界优先于目录对齐" tone="info">
		ZUI参考成熟表格的场景覆盖和受控合同，但不复制React/Vue
		API；DataTable继续使用原生table与原生控件的Tab顺序， 需要cell roving
		focus或编辑时应选择未来独立DataGrid。
	</ZAlert>
	<ZDescriptionList aria-label="DataTable能力边界" items={boundaries} />
	<ZText tone="muted">
		对照：
		<ZLink external href="https://ant.design/components/table/">Ant Design Table</ZLink>、
		<ZLink external href="https://www.naiveui.com/en-US/os-theme/components/data-table"
			>Naive UI DataTable</ZLink
		>、
		<ZLink external href="https://mui.com/x/react-data-grid/">MUI X Data Grid</ZLink>。
		<ZLink external href="https://tanstack.com/table/latest/docs/overview">TanStack Table</ZLink>。
	</ZText>
</ZStack>
