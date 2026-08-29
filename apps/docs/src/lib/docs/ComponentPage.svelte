<script lang="ts">
	import { ZIcon, ZStack, ZText } from '@zadmin/zui';
	import type { ComponentDoc } from '../catalog/index.js';
	import ApiTable from './ApiTable.svelte';
	import DemoBlock from './DemoBlock.svelte';

	let { doc }: { doc: ComponentDoc } = $props();

	function scrollTo(id: string) {
		document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}
</script>

<div class="component-layout">
	<article class="component-article">
		<header class="component-header">
			<p class="eyebrow">ZUI FOUNDATION</p>
			<div class="title-line">
				<h1>{doc.name}</h1>
				<span class="status">stable</span>
			</div>
			<ZText class="lead" tone="muted">{doc.summary}</ZText>
			<div class="import-line"><code>{doc.importStatement}</code></div>
			<a
				class="source-link"
				href={`https://github.com/kenconnet666/zadmin/blob/master/${doc.source}`}
			>
				<ZIcon name="plus" size={16} /> 查看组件源码
			</a>
		</header>

		<section id="demos" class="page-section">
			<h2>实时演示</h2>
			<ZStack gap="large">
				{#each doc.demos as demo (demo.id)}
					<DemoBlock {demo} />
				{/each}
			</ZStack>
		</section>

		<section id="api" class="page-section">
			{#each doc.api as section (section.title)}
				<ApiTable {section} />
			{/each}
		</section>

		<section id="accessibility" class="page-section accessibility">
			<h2>可访问性</h2>
			<ul>
				{#each doc.accessibility as item (item)}<li>{item}</li>{/each}
			</ul>
		</section>
	</article>

	<aside class="page-toc" aria-label="当前页目录">
		<strong>当前页面</strong>
		<button type="button" onclick={() => scrollTo('demos')}>实时演示</button>
		{#each doc.demos as demo (demo.id)}
			<button class="nested" type="button" onclick={() => scrollTo(demo.id)}>{demo.title}</button>
		{/each}
		<button type="button" onclick={() => scrollTo('api')}>API</button>
		<button type="button" onclick={() => scrollTo('accessibility')}>可访问性</button>
	</aside>
</div>
