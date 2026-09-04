<script lang="ts">
	import {
		ZAccordion,
		ZAccordionContent,
		ZAccordionItem,
		ZAccordionTrigger,
		ZProvider,
		ZTabs,
		ZTabsList,
		ZTabsPanel,
		ZTabsTrigger,
		type AccordionSingleValue,
		type SelectionKey
	} from '../src/entrypoints/index.js';

	interface Item {
		disabled?: boolean;
		key: SelectionKey;
		label: string;
	}

	let accordionItems = $state<Item[]>([
		{ key: 1, label: 'Numeric one' },
		{ key: '1', label: 'String one' },
		{ disabled: true, key: 'disabled', label: 'Disabled' },
		{ key: 'last', label: 'Last' }
	]);
	let accordionValue = $state<AccordionSingleValue>(1);
	let accordionActive = $state<SelectionKey | null>(1);
	let accordionChanges = $state(0);

	let tabsItems = $state<Item[]>([
		{ key: 1, label: 'Numeric one' },
		{ key: '1', label: 'String one' },
		{ disabled: true, key: 'disabled', label: 'Disabled' },
		{ key: 'last', label: 'Last' }
	]);
	let tabsValue = $state<SelectionKey | null>(1);
	let tabsActive = $state<SelectionKey | null>(1);
	let tabChanges = $state(0);

	let lazyValue = $state<SelectionKey | null>('a');
	let activeOnlyValue = $state<SelectionKey | null>('a');
	let rtlValue = $state<SelectionKey | null>('left');
	let rtlActive = $state<SelectionKey | null>('left');

	const identity = (value: SelectionKey | null) =>
		value === null ? 'null' : `${typeof value}:${String(value)}`;
</script>

<section data-testid="production-accordion">
	<ZProvider motion="full">
		<ZAccordion
			bind:activeValue={accordionActive}
			bind:value={accordionValue}
			data-testid="production-accordion-root"
			onValueChange={() => (accordionChanges += 1)}
		>
			{#each accordionItems as item (item.key)}
				<ZAccordionItem
					data-testid={Object.is(item.key, 1) ? 'production-accordion-item-active' : undefined}
					disabled={item.disabled}
					value={item.key}
				>
					<ZAccordionTrigger headingLevel={3} textValue={item.label}>
						{item.label}
					</ZAccordionTrigger>
					<ZAccordionContent>
						{item.label} content
						{#if Object.is(item.key, 1)}<input
								data-testid="accordion-panel-input"
								value="draft"
							/>{/if}
					</ZAccordionContent>
				</ZAccordionItem>
			{/each}
			<ZAccordionItem value="nested">
				<ZAccordionTrigger headingLevel={3}>Nested group</ZAccordionTrigger>
				<ZAccordionContent>
					<ZAccordion defaultValue={null}>
						<ZAccordionItem value="child">
							<ZAccordionTrigger headingLevel={4}>Nested child</ZAccordionTrigger>
							<ZAccordionContent region={false}>Nested content</ZAccordionContent>
						</ZAccordionItem>
					</ZAccordion>
				</ZAccordionContent>
			</ZAccordionItem>
		</ZAccordion>
	</ZProvider>
	<button type="button" data-testid="clear-accordion-value" onclick={() => (accordionValue = null)}>
		Clear accordion value
	</button>
	<button
		type="button"
		data-testid="remove-accordion-active"
		onclick={() => (accordionItems = accordionItems.filter(({ key }) => key !== accordionActive))}
	>
		Remove active accordion
	</button>
	<button
		type="button"
		data-testid="reorder-accordion"
		onclick={() => (accordionItems = [...accordionItems].reverse())}
	>
		Reorder accordion
	</button>
	<output data-testid="production-accordion-output">
		{identity(accordionValue)}|{identity(accordionActive)}|{accordionChanges}
	</output>
</section>

<section data-testid="rtl-tabs">
	<ZProvider direction="rtl">
		<ZTabs activationMode="manual" bind:activeValue={rtlActive} bind:value={rtlValue}>
			<ZTabsList aria-label="RTL manual tabs">
				<ZTabsTrigger data-testid="rtl-tab-left" value="left">Left</ZTabsTrigger>
				<ZTabsTrigger data-testid="rtl-tab-middle" value="middle">Middle</ZTabsTrigger>
				<ZTabsTrigger data-testid="rtl-tab-right" value="right">Right</ZTabsTrigger>
			</ZTabsList>
			<ZTabsPanel value="left">Left panel</ZTabsPanel>
			<ZTabsPanel value="middle">Middle panel</ZTabsPanel>
			<ZTabsPanel value="right">Right panel</ZTabsPanel>
		</ZTabs>
	</ZProvider>
	<output data-testid="rtl-tabs-output">{identity(rtlValue)}|{identity(rtlActive)}</output>
</section>

<section data-testid="production-tabs">
	<ZTabs
		bind:activeValue={tabsActive}
		bind:value={tabsValue}
		data-testid="production-tabs-root"
		onValueChange={() => (tabChanges += 1)}
	>
		<ZTabsList aria-label="Typed dynamic tabs" data-testid="production-tabs-list">
			{#each tabsItems as item (item.key)}
				<ZTabsTrigger disabled={item.disabled} textValue={item.label} value={item.key}>
					{item.label}
				</ZTabsTrigger>
			{/each}
		</ZTabsList>
		{#each tabsItems as item (item.key)}
			<ZTabsPanel data-key={identity(item.key)} value={item.key}>{item.label} panel</ZTabsPanel>
		{/each}
	</ZTabs>
	<button
		type="button"
		data-testid="remove-tabs-selected"
		onclick={() => (tabsItems = tabsItems.filter(({ key }) => key !== tabsValue))}
	>
		Remove selected tab
	</button>
	<button
		type="button"
		data-testid="reorder-tabs"
		onclick={() => (tabsItems = [...tabsItems].reverse())}
	>
		Reorder tabs
	</button>
	<output data-testid="production-tabs-output">
		{identity(tabsValue)}|{identity(tabsActive)}|{tabChanges}
	</output>
</section>

<section data-testid="lazy-tabs">
	<ZTabs bind:value={lazyValue} panelMount="lazy">
		<ZTabsList aria-label="Lazy tabs">
			<ZTabsTrigger data-testid="lazy-trigger-a" value="a">A</ZTabsTrigger>
			<ZTabsTrigger data-testid="lazy-trigger-b" value="b">B</ZTabsTrigger>
		</ZTabsList>
		<ZTabsPanel data-testid="lazy-panel-a" value="a"><input value="state-a" /></ZTabsPanel>
		<ZTabsPanel data-testid="lazy-panel-b" value="b"><input value="state-b" /></ZTabsPanel>
	</ZTabs>
	<button type="button" data-testid="lazy-select-a" onclick={() => (lazyValue = 'a')}>A</button>
	<button type="button" data-testid="lazy-select-b" onclick={() => (lazyValue = 'b')}>B</button>
</section>

<section data-testid="active-only-tabs">
	<ZTabs bind:value={activeOnlyValue} panelMount="active-only">
		<ZTabsList aria-label="Active-only tabs">
			<ZTabsTrigger data-testid="active-trigger-a" value="a">A</ZTabsTrigger>
			<ZTabsTrigger data-testid="active-trigger-b" value="b">B</ZTabsTrigger>
		</ZTabsList>
		<ZTabsPanel data-testid="active-panel-a" value="a"><input value="state-a" /></ZTabsPanel>
		<ZTabsPanel data-testid="active-panel-b" value="b"><input value="state-b" /></ZTabsPanel>
	</ZTabs>
	<button type="button" data-testid="active-select-a" onclick={() => (activeOnlyValue = 'a')}
		>A</button
	>
	<button type="button" data-testid="active-select-b" onclick={() => (activeOnlyValue = 'b')}
		>B</button
	>
</section>
