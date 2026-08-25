<script lang="ts">
	import { Box, Button, Stack, defaultTheme, icss } from '@zadmin/zui-svelte';

	let width = $state(320);
	let opacity = $state(0.85);
	const panelClass = $derived(
		icss(defaultTheme, (style) => {
			style.width.px(width);
			style.opacity(opacity);
			style.padding._large;
			style.borderRadius._large;
			style.backgroundColor._primary;
			style.color._canvas;
			style._hover((hover) => hover.backgroundColor._primaryHover);
		})
	);
</script>

<svelte:head>
	<title>ICSS · ZUI</title>
	<meta name="description" content="查看 ZUI ICSS 动态值如何保持 class 和 CSS rule 稳定。" />
</svelte:head>

<header>
	<p class="eyebrow">Interactive ICSS</p>
	<h1 class="page-title">值在变化，class 不需要变化。</h1>
	<p class="page-lead">
		下面两个 Svelte 状态直接写入 ICSS。编译器把它们提升为 inline CSS 变量，而运行时缓存结构规则。
	</p>
</header>

<section class="demo-grid">
	<div class="surface controls">
		<label>
			<span>宽度</span><output>{width}px</output>
			<input data-testid="width" type="range" min="220" max="640" step="1" bind:value={width} />
		</label>
		<label>
			<span>透明度</span><output>{opacity.toFixed(2)}</output>
			<input type="range" min="0.2" max="1" step="0.01" bind:value={opacity} />
		</label>
		<Stack direction="row" gap="small">
			<Button onclick={() => (width = 320)}>重置</Button>
			<Button variant="secondary" onclick={() => (width = Math.min(640, width + 32))}>+32</Button>
		</Stack>
	</div>

	<div class="preview surface">
		<Box data-testid="dynamic-panel" class={panelClass}>
			<strong>动态面板</strong>
			<span>拖动滑块并检查 DevTools</span>
		</Box>
	</div>
</section>

<section class="explanation">
	<div>
		<h2 class="section-title">源码只绑定 class</h2>
		<pre><code
				>{`const panelClass = $derived(
  icss(theme, s => {
    s.width.px(width)
    s.opacity(opacity)
  })
)

<Box class={panelClass} />`}</code
			></pre>
	</div>
	<div>
		<h2 class="section-title">浏览器只更新变量</h2>
		<pre><code
				>{`.c-a1b2c3 {
  width: calc(var(--width-a1b2c3-0) * 1px);
  opacity: var(--opacity-a1b2c3-1);
}

style="--width-a1b2c3-0:320;
       --opacity-a1b2c3-1:.85"`}</code
			></pre>
	</div>
</section>

<style>
	header {
		padding-bottom: 3rem;
	}

	.demo-grid,
	.explanation {
		display: grid;
		grid-template-columns: 0.7fr 1.3fr;
		gap: 1rem;
	}

	.controls {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	label {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 0.55rem;
		font-weight: 700;
	}

	output {
		color: #2563eb;
		font-family: 'Fira Mono', monospace;
	}

	input {
		grid-column: 1 / -1;
		width: 100%;
		accent-color: #2563eb;
	}

	.preview {
		min-height: 19rem;
		display: grid;
		place-items: center;
		overflow: auto;
	}

	.preview :global([data-testid='dynamic-panel']) {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		max-width: 100%;
		box-shadow: 0 18px 50px rgb(37 99 235 / 0.24);
		transition: background-color 120ms ease;
	}

	.preview span {
		opacity: 0.78;
	}

	.explanation {
		grid-template-columns: 1fr 1fr;
		padding-top: 5rem;
	}

	@media (max-width: 48rem) {
		.demo-grid,
		.explanation {
			grid-template-columns: 1fr;
		}
	}
</style>
