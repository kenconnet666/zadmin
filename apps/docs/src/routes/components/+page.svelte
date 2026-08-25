<script lang="ts">
	import { Box, Button, Stack, Text } from '@zadmin/zui-svelte';
</script>

<svelte:head>
	<title>基础组件 · ZUI</title>
	<meta name="description" content="ZUI 第一批生产级 Svelte 基础组件。" />
</svelte:head>

<header>
	<p class="eyebrow">Foundations</p>
	<h1 class="page-title">少量组件，先把边界做对。</h1>
	<p class="page-lead">第一批组件用于验证主题、根元素转发、动态变量、SSR、键盘交互和可访问性。</p>
</header>

<section class="gallery">
	<article class="surface wide">
		<h2>Button</h2>
		<div class="examples">
			<Stack direction="row" gap="medium">
				<Button>Primary</Button>
				<Button variant="secondary">Secondary</Button>
				<Button variant="danger">Danger</Button>
				<Button variant="ghost">Ghost</Button>
				<Button loading>Loading</Button>
				<Button disabled>Disabled</Button>
			</Stack>
		</div>
	</article>

	<article class="surface">
		<h2>Stack</h2>
		<Stack gap="small">
			{#each ['A', 'B', 'C'] as value (value)}
				<Box class="stack-item">{value}</Box>
			{/each}
		</Stack>
	</article>

	<article class="surface">
		<h2>Text</h2>
		<Stack gap="small">
			<Text as="strong" size="large">Strong large text</Text>
			<Text color="primary" weight="semibold">Primary semantic text</Text>
			<Text color="textMuted" size="small">Muted supporting copy</Text>
		</Stack>
	</article>

	<article class="surface wide">
		<h2>Box 与 class 边界</h2>
		<p>
			Box 不添加 wrapper。编译器识别 ZUI 组件后，把隐藏变量传给真实根元素；未知第三方组件则退回完整
			class rule。
		</p>
		<Box class="boundary-box">真实根元素</Box>
	</article>
</section>

<style>
	header {
		padding-bottom: 3.5rem;
	}

	.gallery {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	.wide {
		grid-column: 1 / -1;
	}

	h2 {
		margin: 0 0 1.25rem;
	}

	.examples {
		overflow: hidden;
	}

	.examples > :global(div) {
		flex-wrap: wrap;
	}

	:global(.stack-item),
	:global(.boundary-box) {
		padding: 0.75rem 1rem;
		border: 1px solid #bfdbfe;
		border-radius: 0.65rem;
		background: #eff6ff;
		color: #1e40af;
	}

	article p {
		color: #64748b;
		line-height: 1.7;
	}

	@media (max-width: 42rem) {
		.gallery {
			grid-template-columns: 1fr;
		}

		.wide {
			grid-column: auto;
		}
	}
</style>
