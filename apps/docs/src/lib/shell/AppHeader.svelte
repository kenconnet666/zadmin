<script lang="ts">
	import { ZIcon, ZInput } from '@zadmin/zui';

	let { query = $bindable('') }: { query?: string } = $props();
</script>

<header class="app-header">
	<a class="brand" href="#/" aria-label="ZUI组件展示站首页">
		<span class="brand-mark">Z</span>
		<span><strong>ZUI</strong><small>Components</small></span>
	</a>
	<label class="search">
		<ZIcon name="search" size={18} />
		<ZInput bind:value={query} aria-label="搜索组件" placeholder="搜索组件…" />
	</label>
	<a class="github" href="https://github.com/kenconnet666/zadmin">
		GitHub <span aria-hidden="true">↗</span>
	</a>
</header>
