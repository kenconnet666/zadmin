<script lang="ts">
	import {
		ZButton,
		ZCard,
		ZDataTable,
		ZInput,
		ZInputGroup,
		ZPagination,
		ZProvider,
		ZStack,
		ZTag,
		ZText,
		ZTextarea,
		type DataTableColumn
	} from '@zadmin/zui';

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
		card: { variant: 'outlined' },
		dataTable: { density: 'compact', selectionMode: 'multiple', striped: true },
		input: { size: 'large' },
		pagination: { mode: 'simple' },
		tag: { size: 'small', tone: 'accent' }
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
		<ZInput aria-label="Provider默认大尺寸输入框" placeholder="继承large" />
		<ZInputGroup>
			{#snippet prefix()}https://{/snippet}
			<ZInput aria-label="Provider默认大尺寸组合输入框" placeholder="组合输入也继承large" />
		</ZInputGroup>
		<ZTextarea aria-label="Provider默认大尺寸多行输入框" placeholder="多行输入继承large" rows={2} />
		<ZTextarea
			aria-label="显式小尺寸多行输入框"
			placeholder="显式small优先"
			rows={2}
			size="small"
		/>
		<ZStack direction="row" gap="small" wrap>
			<ZTag>继承small/accent</ZTag>
			<ZCard><ZText>继承outlined Card</ZText></ZCard>
		</ZStack>
		<ZDataTable caption="Provider默认值服务清单" {columns} {rows} rowKey={(row) => row.id} />
		<ZPagination aria-label="Provider默认简单分页" page={2} totalPages={5} />
		<ZText tone="muted">
			默认值只有六个配置分组；input.size统一覆盖Input、InputGroup和Textarea，显式属性及最近上下文优先。值、页码、选择状态、回调、DOM、class/style与任意CSS仍由组件调用方拥有。
		</ZText>
	</ZStack>
</ZProvider>
