<script lang="ts">
	import { ZBox, ZButton, ZField, ZIcon, ZInput, ZStack, ZText } from '@zadmin/zui';

	let account = $state('');
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
		<h2>ZButton</h2>
		<div class="examples">
			<ZStack direction="row" gap="medium">
				<ZButton>Primary</ZButton>
				<ZButton variant="secondary">Secondary</ZButton>
				<ZButton variant="danger">Danger</ZButton>
				<ZButton variant="ghost">Ghost</ZButton>
				<ZButton loading>Loading</ZButton>
				<ZButton disabled>Disabled</ZButton>
			</ZStack>
		</div>
	</article>

	<article class="surface">
		<h2>ZStack</h2>
		<ZStack gap="small">
			{#each ['A', 'B', 'C'] as value (value)}
				<ZBox class="stack-item">{value}</ZBox>
			{/each}
		</ZStack>
	</article>

	<article class="surface">
		<h2>ZText</h2>
		<ZStack gap="small">
			<ZText as="strong" size="large">Strong large text</ZText>
			<ZText tone="primary" weight="semibold">Primary semantic text</ZText>
			<ZText tone="muted" size="small">Muted supporting copy</ZText>
		</ZStack>
	</article>

	<article class="surface">
		<h2>ZIcon</h2>
		<ZStack direction="row" gap="medium" align="center">
			<ZIcon name="search" label="Search" />
			<ZIcon name="check" />
			<ZIcon class="warning-icon" name="warning" />
		</ZStack>
	</article>

	<article class="surface wide">
		<h2>ZField 与 ZInput</h2>
		<ZField
			label="Account"
			description="ZField 自动建立 label、description 与 input 的可访问关系。"
			error={account.length > 0 && account.length < 3 ? '至少输入 3 个字符' : undefined}
			required
		>
			<ZInput bind:value={account} placeholder="alice" />
		</ZField>
	</article>

	<article class="surface wide">
		<h2>ZBox 与 class 边界</h2>
		<p>
			ZBox 不添加 wrapper。编译器识别 ZUI 组件后，把隐藏变量传给真实根元素；未知第三方组件则退回完整
			class rule。
		</p>
		<ZBox class="boundary-box">真实根元素</ZBox>
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

	:global(.warning-icon) {
		color: #dc2626;
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
