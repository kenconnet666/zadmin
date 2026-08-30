<script lang="ts">
	import { ZCode, type ZCodeLanguage } from '../src/entrypoints/code.js';

	let code = $state('const first = 1;');
	let language = $state<ZCodeLanguage | 'missing'>('typescript');
</script>

<ZCode ariaLabel="Racing code" {code} lang={language as ZCodeLanguage}>
	{#snippet loading()}<span data-testid="code-loading">Highlighting</span>{/snippet}
</ZCode>
<button
	type="button"
	data-testid="code-invalid"
	onclick={() => {
		code = 'invalid';
		language = 'missing';
	}}>Invalid</button
>
<button
	type="button"
	data-testid="code-valid"
	onclick={() => {
		code = 'const recovered = true;';
		language = 'typescript';
	}}>Valid</button
>
