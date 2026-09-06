<script lang="ts">
	import {
		ZCheckboxGroup,
		ZCheckboxGroupItem,
		ZCheckboxGroupSelectAll,
		ZField,
		ZText,
		type SelectionKey
	} from '@zadmin/zui';

	let value = $state<readonly SelectionKey[]>(['read', 'legacy']);
</script>

<ZField label="权限" description="全选忽略禁用项，并复用组内同一selection。" name="permissions">
	<ZCheckboxGroup bind:value maxSelected={4}>
		<ZCheckboxGroupSelectAll>选择当前容量允许的权限</ZCheckboxGroupSelectAll>
		<ZCheckboxGroupItem value="read">读取</ZCheckboxGroupItem>
		<ZCheckboxGroupItem value="write">写入</ZCheckboxGroupItem>
		<ZCheckboxGroupItem value="deploy">部署</ZCheckboxGroupItem>
		<ZCheckboxGroupItem value="legacy" disabled>旧版权限（禁用但保留选择）</ZCheckboxGroupItem>
	</ZCheckboxGroup>
</ZField>
<ZText tone="muted">部分选择时SelectAll为mixed；value={value.join(', ')}</ZText>
