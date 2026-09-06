<script lang="ts">
	import { ZNativeSelect, ZText } from '@zadmin/zui';
	const items = [
		{ label: 'TypeScript', value: 'ts' },
		{ label: 'Svelte', value: 'svelte' },
		{ label: 'CSS', value: 'css' }
	] as const;
	let value = $state<readonly string[]>(['ts']);
</script>

<ZNativeSelect
	aria-label="技术栈"
	multiple
	{items}
	bind:value
	nativeSize={3}
	onValueChange={(next) => (value = next)}
/>
<ZText>value: [{value.join(', ')}]（FormData仍按原生多值字段序列化）</ZText>
