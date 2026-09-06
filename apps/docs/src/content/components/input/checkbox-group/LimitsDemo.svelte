<script lang="ts">
	import { ZCheckboxGroup, ZText, type SelectionKey } from '@zadmin/zui';

	let value = $state<readonly SelectionKey[]>([]);
	const options = [
		{ label: 'Lint', value: 'lint' },
		{ label: 'Unit', value: 'unit' },
		{ label: 'Browser', value: 'browser' },
		{ label: 'Release', value: 'release' }
	] as const;
</script>

<ZCheckboxGroup
	aria-label="质量门槛"
	bind:value
	minSelected={2}
	maxSelected={3}
	required
	validationMessage="请选择2到3个质量门槛"
	{options}
	orientation="horizontal"
	tone="success"
/>
<ZText tone="muted">至少2项、最多3项；达到上限后仍可取消。value={value.join(', ') || '空'}</ZText>
