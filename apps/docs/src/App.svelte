<script lang="ts">
	import { ZProvider } from '@zadmin/zui';
	import { docsTheme } from './lib/docs-theme.js';
	import AppShell from './lib/shell/AppShell.svelte';
</script>

<ZProvider theme={docsTheme} locale="zh-CN">
	<AppShell />
</ZProvider>
