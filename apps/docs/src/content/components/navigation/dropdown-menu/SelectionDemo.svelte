<script lang="ts">
	import {
		ZDropdownMenu,
		ZDropdownMenuContent,
		ZDropdownMenuTrigger,
		ZMenuCheckboxItem,
		ZMenuLabel,
		ZMenuRadioGroup,
		ZMenuRadioItem,
		ZMenuSeparator,
		ZText
	} from '@zadmin/zui';
	let sidebar = $state(true);
	let density = $state('comfortable');
</script>

<ZDropdownMenu>
	<ZDropdownMenuTrigger variant="secondary">视图</ZDropdownMenuTrigger>
	<ZDropdownMenuContent>
		<ZMenuLabel>面板</ZMenuLabel>
		<ZMenuCheckboxItem bind:checked={sidebar} value="sidebar">侧栏</ZMenuCheckboxItem>
		<ZMenuCheckboxItem defaultChecked value="console">控制台</ZMenuCheckboxItem>
		<ZMenuSeparator />
		<ZMenuRadioGroup aria-label="密度" bind:value={density}>
			<ZMenuRadioItem value="comfortable">舒适</ZMenuRadioItem>
			<ZMenuRadioItem value="compact">紧凑</ZMenuRadioItem>
		</ZMenuRadioGroup>
	</ZDropdownMenuContent>
</ZDropdownMenu>
<ZText tone="muted">sidebar = {sidebar} · density = {density}</ZText>
