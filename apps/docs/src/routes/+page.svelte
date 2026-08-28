<script lang="ts">
	import { resolve } from '$app/paths';
	import { Stack, Text } from '@zadmin/zui';
</script>

<svelte:head>
	<title>ZUI · Svelte 强类型运行时样式与组件</title>
	<meta
		name="description"
		content="单一 class API、Svelte 响应式 CSS 变量快路径和生产级 SSR/HMR。"
	/>
</svelte:head>

<section class="hero">
	<p class="eyebrow">ZAdmin UI Foundation</p>
	<h1 class="page-title">直接写 TypeScript。<br />只绑定一个 class。</h1>
	<p class="page-lead">
		ZUI 把强类型 DSL、Emotion 风格运行时 CSS 和 Svelte
		编译优化组合在一起。结构样式只生成一次，高频值由 Svelte 精确更新元素上的私有 CSS 变量。
	</p>
	<div class="actions">
		<Stack direction="row" gap="medium">
			<a class="action primary" href={resolve('/icss')}>查看实时 ICSS</a>
			<a class="action secondary" href={resolve('/components')}>浏览组件</a>
		</Stack>
	</div>
</section>

<section class="principles" aria-label="核心原则">
	<article class="surface">
		<span>01</span>
		<h2>Class-only</h2>
		<Text color="textMuted">源码中不暴露 style 对象、action 或绑定协议。</Text>
	</article>
	<article class="surface">
		<span>02</span>
		<h2>Runtime-first</h2>
		<Text color="textMuted">普通 TypeScript 和未编译环境仍能完整生成 class rule。</Text>
	</article>
	<article class="surface">
		<span>03</span>
		<h2>Svelte-fast</h2>
		<Text color="textMuted">可追踪动态值编译成原生 inline custom property 更新。</Text>
	</article>
</section>

<section class="code-section">
	<div>
		<p class="eyebrow">Public API</p>
		<h2 class="section-title">表面保持足够简单</h2>
		<p>响应式、单位、状态和主题都留在同一个 TypeScript 回调中。</p>
	</div>
	<pre><code
			>{`const panelClass = $derived(
  icss(theme, s => {
    s.display.flex
    s.width.px(panelWidth)
    s.padding._medium
    s._hover(h => h.opacity(opacity))
  })
)

<div class={panelClass} />`}</code
		></pre>
</section>

<style>
	.hero {
		padding: 3rem 0 5rem;
	}

	.actions {
		margin-top: 2rem;
		flex-wrap: wrap;
	}

	.actions a {
		padding: 0.75rem 1.25rem;
		border: 1px solid #2563eb;
		border-radius: 0.65rem;
		font-weight: 700;
		text-decoration: none;
	}

	.actions .primary {
		color: white;
		background: #2563eb;
	}

	.actions .secondary {
		color: #1d4ed8;
		background: white;
	}

	.principles {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
	}

	.principles article > span {
		color: #2563eb;
		font-family: 'Fira Mono', monospace;
		font-size: 0.75rem;
	}

	.principles h2 {
		margin: 1.25rem 0 0.5rem;
	}

	.code-section {
		display: grid;
		grid-template-columns: 0.75fr 1.25fr;
		gap: 3rem;
		align-items: center;
		padding-top: 6rem;
	}

	.code-section p:not(.eyebrow) {
		color: #64748b;
		line-height: 1.7;
	}

	@media (max-width: 48rem) {
		.principles,
		.code-section {
			grid-template-columns: 1fr;
		}
	}
</style>
