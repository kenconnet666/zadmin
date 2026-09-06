<script lang="ts">
	import { ZNativeSelect, ZText } from '@zadmin/zui';
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
	<button type="button" onclick={() => (value = 'south')}>外部设为南方</button>
	<button type="button" onclick={inspect}>读取FormData</button>
	<button type="reset">Reset</button>
</form>
<ZText>当前值：{value}；readonly仍提交：{output || '—'}</ZText>
