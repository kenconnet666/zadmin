<script lang="ts">
	import { ZButton, ZLink } from '../src/entrypoints/index.js';
</script>

<div>
	<ZButton data-testid="button-enabled" variant="primary">Enabled button</ZButton>
	<ZButton data-testid="button-disabled" disabled variant="primary">Disabled button</ZButton>
	<ZButton data-testid="button-loading" loading variant="primary">Loading button</ZButton>
	<ZButton aria-disabled="true" data-testid="button-aria-disabled" variant="primary">
		ARIA-disabled button
	</ZButton>

	<ZLink
		appearance="button"
		data-testid="link-button-enabled"
		href="#enabled-button"
		variant="primary"
	>
		Enabled button link
	</ZLink>
	<ZLink
		appearance="button"
		data-testid="link-button-disabled"
		disabled
		href="#disabled-button"
		variant="primary"
	>
		Disabled button link
	</ZLink>

	<ZLink appearance="navigation" data-testid="link-nav-enabled" href="#enabled-nav">
		Enabled navigation link
	</ZLink>
	<ZLink appearance="navigation" data-testid="link-nav-disabled" disabled href="#disabled-nav">
		Disabled navigation link
	</ZLink>

	<ZLink appearance="text" data-testid="link-text-enabled" href="#enabled-text" underline="hover">
		Enabled text link
	</ZLink>
	<ZLink
		appearance="text"
		data-testid="link-text-disabled"
		disabled
		href="#disabled-text"
		underline="hover"
	>
		Disabled text link
	</ZLink>
</div>
