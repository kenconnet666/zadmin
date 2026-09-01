<script lang="ts">
	import { ZLink, ZProvider } from '../src/entrypoints/index.js';

	let anchor = $state<HTMLAnchorElement | null>(null);
	let disabledActivations = $state(0);
	let enabledActivations = $state(0);
	let parentClicks = $state(0);

	function countOwnerClicks(node: HTMLDivElement): { destroy(): void } {
		function handleClick(): void {
			parentClicks += 1;
		}

		node.addEventListener('click', handleClick);
		return {
			destroy(): void {
				node.removeEventListener('click', handleClick);
			}
		};
	}
</script>

<div data-testid="link-click-owner" use:countOwnerClicks>
	<ZLink
		data-testid="link-external-blank"
		external
		href="https://example.com/docs"
		rel="nofollow license opener"
		target="_blank"
	>
		External docs
	</ZLink>
	<ZLink data-testid="link-external-same" external href="https://example.com/status">
		External same window
	</ZLink>
	<ZLink
		data-testid="link-disabled"
		disabled
		external
		href="https://example.com/disabled"
		rel="author"
		target="_blank"
		onclick={() => (disabledActivations += 1)}
	>
		Disabled resource
	</ZLink>
	<ZLink
		bind:ref={anchor}
		data-testid="link-enabled"
		href="#link-ready"
		onclick={(event) => {
			event.preventDefault();
			enabledActivations += 1;
		}}
	>
		Enabled resource
	</ZLink>
</div>

<ZLink
	aria-current="page"
	data-testid="link-native"
	download="link-example.txt"
	href="data:text/plain,Link%20example"
>
	Download current resource
</ZLink>

<div data-testid="link-long-owner" style="inline-size: 10rem;">
	<ZLink
		data-testid="link-long"
		external
		href="https://example.com/organizations/production-platform/extremely-long-resource-identifier"
	>
		https://example.com/organizations/production-platform/extremely-long-resource-identifier
	</ZLink>
</div>

<ZProvider localePack={{ link: { opensInNewWindow: 'opens in another workspace' } }}>
	<ZLink
		aria-label="Localized target"
		data-testid="link-localized"
		href="https://example.com/localized"
		target="_blank"
	>
		Localized target
	</ZLink>
</ZProvider>

<output data-testid="link-output">
	{disabledActivations}:{enabledActivations}:{parentClicks}:{anchor?.tagName ?? 'none'}
</output>
