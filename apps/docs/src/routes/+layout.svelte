<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { ZuiProvider } from '@zadmin/zui';
	import './layout.css';

	let { children } = $props();
	const navigation = [
		{ href: '/', label: '概览' },
		{ href: '/icss', label: 'ICSS' },
		{ href: '/components', label: '组件' },
		{ href: '/runtime', label: '运行时' },
		{ href: '/architecture', label: '架构' }
	] as const;
</script>

<ZuiProvider>
	<div class="docs-shell">
		<header class="topbar">
			<a class="brand" href={resolve('/')} aria-label="ZUI 首页">
				<span class="brand-mark">Z</span>
				<span>ZUI</span>
			</a>
			<nav aria-label="主导航">
				{#each navigation as item (item.href)}
					<a
						href={resolve(item.href)}
						aria-current={page.url.pathname === item.href ? 'page' : undefined}
					>
						{item.label}
					</a>
				{/each}
			</nav>
			<a class="repository" href="https://github.com/kenconnet666/zadmin">GitHub</a>
		</header>

		<main>{@render children()}</main>

		<footer>
			<span>ZUI · Svelte 5 · TypeScript</span>
			<span>运行时 CSS，编译期优化，单一 class API</span>
		</footer>
	</div>
</ZuiProvider>
