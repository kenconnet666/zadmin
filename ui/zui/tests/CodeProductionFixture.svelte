<script lang="ts">
	import { ZProvider } from '../src/entrypoints/index.js';
	import { ZCode, type ZCodeCopyDetail } from '../src/entrypoints/code.js';

	let events = $state(0);
	let result = $state<'copied' | 'failed' | 'idle'>('idle');
</script>

<ZProvider
	localePack={{
		code: { copied: 'Artifact copied', copy: 'Copy artifact', copyFailed: 'Artifact copy failed' }
	}}
>
	<ZCode
		ariaLabel="Production command"
		code="pnpm deploy"
		copyable
		data-testid="code-production"
		lang="bash"
		onCopy={(detail: ZCodeCopyDetail) => {
			events += 1;
			result = detail.status;
		}}
	/>
</ZProvider>
<output data-testid="code-production-output">{result}:{events}</output>
