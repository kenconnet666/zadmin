<script lang="ts">
	import { ZProvider, ZTable, ZTag, zhCNLocalePack } from '../src/entrypoints/index.js';
</script>

<ZProvider locale="zh-CN" localePack={zhCNLocalePack}>
	<ZTag data-testid="ssr-tag" removable textValue="生产" tone="warning">生产</ZTag>
</ZProvider>
<ZTag data-testid="ssr-tag-static" size="small">static</ZTag>
<ZTable caption="SSR deployments" data-native="true" data-testid="ssr-table">
	{#snippet header()}<tr><th scope="col">Service</th><th scope="col">Version</th></tr>{/snippet}
	<tr><th scope="row">Docs</th><td>v2.4.0</td></tr>
</ZTable>
<ZTable caption="Hidden SSR caption" captionHidden data-testid="ssr-table-hidden">
	<tr><td>Ready</td></tr>
</ZTable>
