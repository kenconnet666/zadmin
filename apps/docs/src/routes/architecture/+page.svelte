<svelte:head>
	<title>架构决策 · ZUI</title>
</svelte:head>

<header>
	<p class="eyebrow">Architecture</p>
	<h1 class="page-title">编译器负责关联，运行时负责语义。</h1>
	<p class="page-lead">ZUI 不执行用户模块来提取 CSS，也不把正确性绑在编译器上。</p>
</header>

<section class="flow" aria-label="ICSS 执行流程">
	<div class="surface"><strong>1 · Source</strong><span>icss(theme, factory) → class</span></div>
	<div class="arrow">→</div>
	<div class="surface"><strong>2 · Compiler</strong><span>动态叶子 → style:--slot</span></div>
	<div class="arrow">→</div>
	<div class="surface"><strong>3 · Runtime</strong><span>结构 → canonical CSS rule</span></div>
	<div class="arrow">→</div>
	<div class="surface"><strong>4 · Browser</strong><span>setProperty → layout/paint</span></div>
</section>

<section class="decisions">
	<h2 class="section-title">已经冻结的选择</h2>
	<ul>
		<li>公开 API 永远是单一 class 字符串。</li>
		<li>主题 token 默认进入结构 CSS，不把所有主题强制变量化。</li>
		<li>直接标识符生成可读 slot 名；复杂表达式使用匿名 slot。</li>
		<li>普通 if、switch 和表达式就是第一版 variants。</li>
		<li>未知 selector 继承边界或第三方组件时优先正确回退。</li>
		<li>Stylis 是唯一 CSS 运行时底层依赖，不复制完整 Emotion。</li>
	</ul>
	<p>完整工程合同位于 <code>apps/docs/content/zui-icss.md</code>。</p>
</section>

<style>
	header {
		padding-bottom: 4rem;
	}

	.flow {
		display: grid;
		grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr;
		align-items: center;
		gap: 0.75rem;
	}

	.flow div:not(.arrow) {
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
	}

	.flow span,
	.decisions p,
	.decisions li {
		color: #64748b;
		line-height: 1.7;
	}

	.arrow {
		color: #2563eb;
		font-size: 1.4rem;
	}

	.decisions {
		max-width: 48rem;
		padding-top: 5rem;
	}

	.decisions li + li {
		margin-top: 0.5rem;
	}

	@media (max-width: 64rem) {
		.flow {
			grid-template-columns: 1fr;
		}

		.arrow {
			transform: rotate(90deg);
			text-align: center;
		}
	}
</style>
