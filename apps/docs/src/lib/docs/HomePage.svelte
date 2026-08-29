<script lang="ts">
	import { ZBox, ZIcon, ZStack, ZText } from '@zadmin/zui';
	import type { ComponentDoc } from '../catalog/index.js';

	let { docs }: { docs: readonly ComponentDoc[] } = $props();
</script>

<section class="hero">
	<p class="eyebrow">ZADMIN UI SYSTEM</p>
	<h1>看见组件，运行组件，复制真实源码。</h1>
	<p class="hero-copy">
		ZUI是面向浏览器与WebView的Svelte
		5组件库。展示站直接运行工作区组件，每个示例的源码来自同一个Svelte文件。
	</p>
	<ZStack direction="row" gap="small" wrap>
		<a class="primary-action" href="#/components/button">开始浏览组件</a>
		<a class="secondary-action" href="https://github.com/kenconnet666/zadmin/tree/master/ui/zui"
			>GitHub源码</a
		>
	</ZStack>
</section>

<section class="principles" aria-label="设计原则">
	<article>
		<strong>8</strong><span>基础组件</span>
		<p>只展示当前已经实现并通过验收的公开组件。</p>
	</article>
	<article>
		<strong>1:1</strong><span>Demo与源码</span>
		<p>页面运行的Svelte文件就是复制按钮提供的源码。</p>
	</article>
	<article>
		<strong>Typed</strong><span>API合同</span>
		<p>Props、callbacks与可访问性说明由TypeScript registry统一管理。</p>
	</article>
</section>

<section class="catalog-section">
	<header>
		<p class="eyebrow">FOUNDATIONS</p>
		<h2>基础组件</h2>
	</header>
	<div class="component-grid">
		{#each docs as doc (doc.id)}
			<a class="component-card" href={`#/components/${doc.id}`}>
				<ZBox>
					<div class="card-icon"><ZIcon name="plus" size={18} /></div>
					<h3>{doc.name}</h3>
					<ZText tone="muted">{doc.summary}</ZText>
					<span class="learn-more">查看Demo与API →</span>
				</ZBox>
			</a>
		{/each}
	</div>
</section>
