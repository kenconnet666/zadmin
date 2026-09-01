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

	let value = $state<SelectionKey | null>(1);
	let activeValue = $state<SelectionKey | null>(1);
	const identity = (key: SelectionKey | null) =>
		key === null ? 'null' : `${typeof key}:${String(key)}`;
</script>

<ZStack gap="medium">
	<ZTabs activationMode="manual" bind:activeValue bind:value>
		<ZTabsList aria-label="Typed controlled tabs">
			<ZTabsTrigger value={1}>number 1</ZTabsTrigger>
			<ZTabsTrigger value="1">string 1</ZTabsTrigger>
			<ZTabsTrigger value="last">last</ZTabsTrigger>
		</ZTabsList>
		<ZTabsPanel value={1}>Numeric-key panel</ZTabsPanel>
		<ZTabsPanel value="1">String-key panel</ZTabsPanel>
		<ZTabsPanel value="last">Last panel</ZTabsPanel>
	</ZTabs>
	<ZStack direction="row" gap="small" wrap>
		<ZButton onclick={() => (value = null)} variant="secondary">显式清为null</ZButton>
		<ZButton onclick={() => (value = '1')} variant="secondary">选择string 1</ZButton>
		<ZButton onclick={() => (activeValue = 'last')} variant="ghost">移动active owner</ZButton>
	</ZStack>
	<ZText tone="muted">value = {identity(value)} · active = {identity(activeValue)}</ZText>
</ZStack>
