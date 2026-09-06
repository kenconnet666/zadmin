<script lang="ts">
	import { ZButton, ZStack, ZText, ZToggleGroup } from '@zadmin/zui';

	const items = [
		{ value: 'all', label: '全部' },
		{ value: 'open', label: '进行中' },
		{ value: 'closed', label: '已完成' }
	] as const;
	let allowEmpty = $state(true);
	let value = $state<readonly (typeof items)[number]['value'][]>([]);
</script>

<ZStack gap="small">
	<ZStack direction="row" gap="small" wrap>
		<ZButton size="small" variant="outline" onclick={() => (allowEmpty = !allowEmpty)}>
			allowEmpty={allowEmpty}
		</ZButton>
		<ZText tone="muted">value = [{value.join(', ')}]</ZText>
	</ZStack>
	<ZToggleGroup bind:value {items} {allowEmpty} aria-label="任务状态" />
</ZStack>
