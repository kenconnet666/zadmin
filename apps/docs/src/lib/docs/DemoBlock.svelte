<script lang="ts">
	import { ZButton, ZIcon, ZStack, ZText } from '@zadmin/zui';
	import type { DemoDefinition } from '../catalog/index.js';

	let { demo }: { demo: DemoDefinition } = $props();
	let expanded = $state(false);
	let copyState = $state<'copied' | 'failed' | 'idle'>('idle');
	const source = $derived(demo.source.trim());
	const Demo = $derived(demo.component);

	async function copySource() {
		try {
			await navigator.clipboard.writeText(source);
			copyState = 'copied';
		} catch {
			copyState = 'failed';
		}
		setTimeout(() => (copyState = 'idle'), 1200);
	}
</script>

<section class="demo-block" id={demo.id}>
	<header>
		<div>
			<h3>{demo.title}</h3>
			<ZText tone="muted">{demo.description}</ZText>
		</div>
		<ZStack direction="row" gap="small">
			<ZButton size="small" variant="ghost" onclick={() => (expanded = !expanded)}>
				<ZIcon name="chevronDown" size={16} />
				{expanded ? '收起源码' : '查看源码'}
			</ZButton>
			<ZButton size="small" variant="secondary" onclick={copySource}>
				{copyState === 'copied' ? '已复制' : copyState === 'failed' ? '复制失败' : '复制'}
			</ZButton>
		</ZStack>
	</header>
	<div class="preview" data-testid={`demo-${demo.id}`}>
		<Demo />
	</div>
	{#if expanded}
		<pre data-testid={`source-${demo.id}`}><code>{source}</code></pre>
	{/if}
</section>
