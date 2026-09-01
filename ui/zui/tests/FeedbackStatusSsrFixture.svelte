<script lang="ts">
	import { ZAlert, ZLoadingBar, ZSpinner } from '../src/entrypoints/index.js';
</script>

<ZAlert data-testid="ssr-alert-off" live="off" title="Static" tone="info">Guidance.</ZAlert>
<ZAlert data-testid="ssr-alert-polite" title="Saved" tone="success">Ready.</ZAlert>
<ZAlert data-testid="ssr-alert-assertive" live="assertive" title="Failed" tone="danger">
	Retry.
</ZAlert>
<ZSpinner data-testid="ssr-spinner" label="Loading record" />
<ZSpinner aria-hidden="true" data-testid="ssr-spinner-hidden" />
<ZLoadingBar data-testid="ssr-loading-value" label="Import" value={40} />
<ZLoadingBar data-testid="ssr-loading-indeterminate" label="Connecting" />
<ZLoadingBar data-testid="ssr-loading-page" label="Navigation" mode="page" state="success" />
<ZLoadingBar active={false} data-testid="ssr-loading-idle" label="Idle" state="idle" />
