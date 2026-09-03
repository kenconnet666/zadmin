<script lang="ts">
	import { ZButton, ZDataTable, ZProvider, ZStack, ZText, type DataTableColumn } from '@zadmin/zui';

	interface ServiceRow {
		id: string;
		name: string;
		status: string;
	}

	const rows: readonly ServiceRow[] = [
		{ id: 'docs', name: '文档站', status: '在线' },
		{ id: 'release', name: '发布门禁', status: '检查中' }
	];
	const columns: readonly DataTableColumn<ServiceRow>[] = [
		{ id: 'name', header: '服务', accessor: (row) => row.name },
		{ id: 'status', header: '状态', accessor: (row) => row.status }
	];
</script>

<ZProvider
	componentDefaults={{
		button: { size: 'small', variant: 'secondary' },
		dataTable: { density: 'compact', selectionMode: 'multiple', striped: true }
	}}
>
	<ZStack gap="medium">
		<ZStack direction="row" gap="small" wrap>
			<ZButton>继承small/secondary</ZButton>
			<ZButton variant="primary">显式primary优先</ZButton>
			<ZProvider componentDefaults={{ button: null }}>
				<ZButton>停止Button继承</ZButton>
			</ZProvider>
		</ZStack>
		<ZDataTable caption="Provider默认值服务清单" {columns} {rows} rowKey={(row) => row.id} />
		<ZText tone="muted">
			默认值只覆盖白名单行为；选择状态、回调、DOM、class/style与任意CSS仍由组件调用方拥有。
		</ZText>
	</ZStack>
</ZProvider>
