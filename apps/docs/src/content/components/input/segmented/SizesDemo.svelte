<script lang="ts">
	import { ZField, ZSegmented, ZStack } from '@zadmin/zui';

	const sizes = ['small', 'medium', 'large'] as const;
	const options = [
		{ label: '列表', value: 'list' },
		{ label: '看板', value: 'board' },
		{ label: '日历', value: 'calendar' }
	];
</script>

<ZStack gap="large" align="start">
	{#each sizes as size (size)}
		<ZField label={`Field ${size}`} {size}>
			<ZSegmented {options} defaultValue="list" />
		</ZField>
	{/each}
	<ZField label="large Field，small Segmented" size="large">
		<ZSegmented {options} size="small" defaultValue="board" />
	</ZField>
</ZStack>
