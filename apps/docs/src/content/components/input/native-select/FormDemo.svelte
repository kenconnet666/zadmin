<script lang="ts">
	import { ZButton, ZNativeSelect, ZText } from '@zadmin/zui';
	let form = $state<HTMLFormElement | null>(null);
	let value = $state('north');
	let output = $state('');
	function inspect(): void {
		if (form) output = String(new FormData(form).get('region') ?? '');
	}
</script>

<form bind:this={form} onsubmit={(event) => event.preventDefault()}>
	<ZNativeSelect
		aria-label="区域"
		name="region"
		bind:value
		items={[
			{ label: '北方', value: 'north' },
			{ label: '南方', value: 'south' }
		]}
		defaultValue="north"
		readonly
	/>
	<ZButton type="button" variant="outline" onclick={() => (value = 'south')}>外部设为南方</ZButton>
	<ZButton type="button" variant="outline" onclick={inspect}>读取FormData</ZButton>
	<ZButton type="reset" variant="ghost">Reset</ZButton>
</form>
<ZText>当前值：{value}；readonly仍提交：{output || '—'}</ZText>
