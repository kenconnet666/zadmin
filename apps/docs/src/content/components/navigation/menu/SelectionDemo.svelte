<script lang="ts">
	import {
		ZMenu,
		ZMenuCheckboxItem,
		ZMenuLabel,
		ZMenuRadioGroup,
		ZMenuRadioItem,
		ZMenuSeparator,
		ZText
	} from '@zadmin/zui';
	let grid = $state<boolean | 'mixed'>('mixed');
	let density = $state<string | number>('comfortable');
</script>

<ZMenu aria-label="视图设置">
	<ZMenuLabel>显示</ZMenuLabel>
	<ZMenuCheckboxItem bind:checked={grid} value="grid">网格线</ZMenuCheckboxItem>
	<ZMenuCheckboxItem defaultChecked value="rulers">标尺</ZMenuCheckboxItem>
	<ZMenuSeparator />
	<ZMenuLabel>密度</ZMenuLabel>
	<ZMenuRadioGroup aria-label="密度" bind:value={density}>
		<ZMenuRadioItem value="comfortable">舒适</ZMenuRadioItem>
		<ZMenuRadioItem value={1}>紧凑（number 1）</ZMenuRadioItem>
		<ZMenuRadioItem value="1">紧凑（string 1）</ZMenuRadioItem>
	</ZMenuRadioGroup>
</ZMenu>
<ZText tone="muted">grid = {String(grid)} · density = {String(density)}</ZText>
