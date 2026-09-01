<script lang="ts">
	import { ZCarousel, ZText, type SelectionKey } from '@zadmin/zui';
	const items = [
		{ id: 'overview', label: '概览', copy: '生产服务全部健康。' },
		{ id: 'metrics', label: '指标', copy: 'P95延迟为82ms。' },
		{ id: 'events', label: '事件', copy: '最近24小时无严重事件。' }
	];
	let value = $state<SelectionKey>('overview');
</script>

<ZText tone="muted">value = {value}</ZText>
<ZCarousel
	aria-label="发布摘要轮播"
	{items}
	itemKey={(entry) => entry.id}
	itemLabel={(entry) => entry.label}
	bind:value
	autoplayInterval={60000}
	data-testid="docs-carousel"
>
	{#snippet item(entry)}<h4>{entry.label}</h4>
		<p>{entry.copy}</p>{/snippet}
</ZCarousel>
