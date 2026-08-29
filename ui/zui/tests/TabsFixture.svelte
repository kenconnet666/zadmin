<script lang="ts">
	import ZTabs from '../src/components/compound/tabs/ZTabs.svelte';
	import ZTabsList from '../src/components/compound/tabs/ZTabsList.svelte';
	import ZTabsPanel from '../src/components/compound/tabs/ZTabsPanel.svelte';
	import ZTabsTrigger from '../src/components/compound/tabs/ZTabsTrigger.svelte';

	let automatic = $state('b');
	let automaticChanges = $state(0);
	let manual = $state('one');
	let manualChanges = $state(0);
</script>

<ZTabs bind:value={automatic} defaultValue="b" onValueChange={() => (automaticChanges += 1)}>
	<ZTabsList aria-label="Automatic tabs">
		<ZTabsTrigger data-testid="tab-a" value="a">Alpha</ZTabsTrigger>
		<ZTabsTrigger data-testid="tab-b" value="b">Beta</ZTabsTrigger>
		<ZTabsTrigger data-testid="tab-c" disabled value="c">Disabled</ZTabsTrigger>
		<ZTabsTrigger data-testid="tab-d" value="d">Delta</ZTabsTrigger>
	</ZTabsList>
	<ZTabsPanel data-testid="panel-a" value="a">Alpha panel</ZTabsPanel>
	<ZTabsPanel data-testid="panel-b" value="b">Beta panel</ZTabsPanel>
	<ZTabsPanel data-testid="panel-c" value="c">Disabled panel</ZTabsPanel>
	<ZTabsPanel data-testid="panel-d" value="d">Delta panel</ZTabsPanel>
</ZTabs>
<output data-testid="tabs-output">{automatic}:{automaticChanges}</output>

<ZTabs
	bind:value={manual}
	activationMode="manual"
	defaultValue="one"
	onValueChange={() => (manualChanges += 1)}
>
	<ZTabsList aria-label="Manual tabs">
		<ZTabsTrigger data-testid="manual-one" value="one">One</ZTabsTrigger>
		<ZTabsTrigger data-testid="manual-two" value="two">Two</ZTabsTrigger>
	</ZTabsList>
	<ZTabsPanel value="one">One panel</ZTabsPanel>
	<ZTabsPanel value="two">Two panel</ZTabsPanel>
</ZTabs>
<output data-testid="manual-tabs-output">{manual}:{manualChanges}</output>
