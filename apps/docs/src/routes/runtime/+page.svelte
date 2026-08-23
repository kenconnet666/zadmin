<svelte:head>
	<title>运行时、SSR 与 CSP · ZUI</title>
</svelte:head>

<header>
	<p class="eyebrow">Production Runtime</p>
	<h1 class="page-title">正确路径永远存在，优化路径尽可能快。</h1>
	<p class="page-lead">
		编译器不是运行前提。普通 TypeScript、SSR、严格 CSP 和不透明组件都有明确回退。
	</p>
</header>

<section class="matrix surface">
	<table>
		<thead><tr><th>场景</th><th>执行路径</th><th>更新成本</th></tr></thead>
		<tbody>
			<tr><td>Svelte 本地 class</td><td>inline custom property</td><td>只 setProperty</td></tr>
			<tr><td>普通 TypeScript</td><td>完整运行时 class rule</td><td>值变化可切换 class</td></tr>
			<tr><td>未知组件边界</td><td>class-rule fallback</td><td>不猜 DOM 落点</td></tr>
			<tr><td>严格 style-src-attr</td><td>class-rules 模式</td><td>正确但不适合每帧变化</td></tr>
			<tr><td>SvelteKit SSR</td><td>请求级 Registry</td><td>critical CSS + hydration 接管</td></tr>
		</tbody>
	</table>
</section>

<section class="details">
	<article>
		<h2>SSR 隔离</h2>
		<p>
			Node AsyncLocalStorage 将默认 icss() 解析到当前请求 Registry。并发请求不会共享主题或 critical
			CSS。
		</p>
	</article>
	<article>
		<h2>CSP</h2>
		<p>inline-vars 模式需要允许 style-src-attr。style element 继续使用 nonce 或 SHA-256 hash。</p>
	</article>
	<article>
		<h2>HMR</h2>
		<p>规则所有权细化到模块与 callsite。替换时只删除没有共享、没有持久引用的旧规则。</p>
	</article>
	<article>
		<h2>结构上限</h2>
		<p>每个编译 callsite 默认最多 128 个结构变体，防止把任意数据意外变成无限 CSS。</p>
	</article>
</section>

<style>
	header {
		padding-bottom: 3rem;
	}

	.matrix {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th,
	td {
		padding: 0.85rem 1rem;
		border-bottom: 1px solid #e2e8f0;
		text-align: left;
	}

	th {
		color: #475569;
		font-size: 0.78rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.details {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 2rem;
		padding-top: 4rem;
	}

	.details h2 {
		margin-bottom: 0.5rem;
	}

	.details p {
		color: #64748b;
		line-height: 1.75;
	}

	@media (max-width: 42rem) {
		.details {
			grid-template-columns: 1fr;
		}
	}
</style>
