<script lang="ts">
	import ZNavLink from '../src/components/navigation/ZNavLink.svelte';

	let anchor = $state<HTMLElement | null>(null);
	let anchorDisclosure = $state<HTMLButtonElement | null>(null);
	let anchorExpanded = $state(false);
	let button = $state<HTMLElement | null>(null);
	let buttonDisclosure = $state<HTMLButtonElement | null>(null);
	let buttonExpanded = $state(false);
	let rtlExpanded = $state(false);
	let disclosureChanges = $state<string[]>([]);
	let nativeClicks = $state<string[]>([]);

	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;

	function recordAnchorClick(event: MouseEvent): void {
		nativeClicks = [...nativeClicks, `${event.button}:${event.ctrlKey}:${event.metaKey}`];
		event.preventDefault();
	}

	function setAnchorExpanded(next: boolean): void {
		anchorExpanded = next;
		disclosureChanges = [...disclosureChanges, `anchor:${next}`];
	}

	function setButtonExpanded(next: boolean): void {
		buttonExpanded = next;
		disclosureChanges = [...disclosureChanges, `button:${next}`];
	}
</script>

{#snippet startIcon()}<span aria-hidden="true" data-testid="nav-start">S</span>{/snippet}
{#snippet endStatus()}<span data-testid="nav-end">4</span>{/snippet}
{#snippet richLabel()}<strong data-testid="rich-label">Project catalog</strong>{/snippet}

<ZNavLink
	bind:ref={anchor}
	bind:disclosureRef={anchorDisclosure}
	active
	class="consumer-nav-link"
	contentId="projects-panel"
	data-owner="consumer"
	description="Browse active delivery work"
	disclosureLabel="Toggle project sections"
	expanded={anchorExpanded}
	external
	href="#projects"
	label="Projects"
	labelContent={richLabel}
	onclick={recordAnchorClick}
	onExpandedChange={setAnchorExpanded}
	rel="help opener"
	style="--consumer-marker: ready;"
	target="_blank"
	tone="success"
	variant="outline"
	start={startIcon}
	end={endStatus}
/>

<ZNavLink
	bind:ref={button}
	bind:disclosureRef={buttonDisclosure}
	contentId="settings-panel"
	expanded={buttonExpanded}
	label="Settings"
	onExpandedChange={setButtonExpanded}
/>

<div dir="rtl">
	<ZNavLink
		contentId="rtl-panel"
		expanded={rtlExpanded}
		href="#rtl"
		label="RTL section"
		onExpandedChange={(next) => (rtlExpanded = next)}
	/>
</div>

<ZNavLink compact data-testid="compact-fallback" label="Analytics" />
<ZNavLink compact data-testid="compact-icon" label="Notifications" start={startIcon} />
<ZNavLink data-testid="passive" description="Section heading" label="Administration" />
<ZNavLink
	data-testid="disabled-link"
	disabled
	expanded={false}
	href="https://example.com/disabled"
	label="Disabled destination"
	onExpandedChange={() => undefined}
	target="_blank"
/>

<div data-testid="nav-link-sizes">
	{#each sizes as size (size)}
		<ZNavLink data-testid={`size-${size}`} href={`#${size}`} label={size} {size} />
		<ZNavLink
			data-testid={`description-${size}`}
			description="A complete second line that remains readable"
			label={size}
			{size}
		/>
		<ZNavLink compact data-testid={`compact-${size}`} label={size} {size} />
	{/each}
</div>

<output data-testid="nav-link-output">
	{disclosureChanges.join(',')}|{nativeClicks.join(',')}|{anchor?.tagName ??
		'none'}:{anchorDisclosure?.tagName ?? 'none'}|{button?.tagName ??
		'none'}:{buttonDisclosure?.tagName ?? 'none'}
</output>
