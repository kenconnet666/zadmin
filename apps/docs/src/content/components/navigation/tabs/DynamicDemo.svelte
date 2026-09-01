<script lang="ts">
	import {
		ZButton,
		ZStack,
		ZTabs,
		ZTabsList,
		ZTabsPanel,
		ZTabsTrigger,
		ZText,
		type SelectionKey
	} from '@zadmin/zui';

	let items = $state<SelectionKey[]>(['overview', 'metrics', 'events']);
	let value = $state<SelectionKey | null>('metrics');
	let activeValue = $state<SelectionKey | null>('metrics');
</script>

<ZStack gap="medium">
	<ZTabs bind:activeValue bind:value>
		<ZTabsList aria-label="Dynamic tabs">
			{#each items as key (key)}<ZTabsTrigger value={key}>{key}</ZTabsTrigger>{/each}
		</ZTabsList>
		{#each items as key (key)}<ZTabsPanel value={key}>{key} panel</ZTabsPanel>{/each}
	</ZTabs>
	<ZStack direction="row" gap="small" wrap>
		<ZButton onclick={() => (items = items.filter((key) => key !== value))}>删除selected</ZButton>
		<ZButton onclick={() => (items = [...items].reverse())} variant="secondary">反转顺序</ZButton>
	</ZStack>
	<ZText tone="muted">selected = {value ?? 'null'} · active = {activeValue ?? 'null'}</ZText>
</ZStack>
