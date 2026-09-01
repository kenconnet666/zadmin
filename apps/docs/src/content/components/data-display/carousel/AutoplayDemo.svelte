<script lang="ts">
	import { ZCarousel, ZHeading, ZText, type SelectionKey } from '@zadmin/zui';

	const items = [
		{ id: 'queued', label: '排队', copy: '等待可用执行器。' },
		{ id: 'running', label: '运行中', copy: '任务正在处理。' },
		{ id: 'complete', label: '已完成', copy: '产物已经发布。' }
	];
	let value = $state<SelectionKey>('queued');
</script>

<ZText tone="muted">value = {value} · hover或内部焦点会暂停自动轮播</ZText>
<ZCarousel
	aria-label="自动任务状态轮播"
	autoplayInterval={1200}
	bind:value
	data-testid="carousel-autoplay"
	{items}
	itemKey={(item) => item.id}
	itemLabel={(item) => item.label}
	pauseOnHover
>
	{#snippet item(item)}<ZHeading level={4} size="large">{item.label}</ZHeading>
		<p>{item.copy}</p>{/snippet}
</ZCarousel>
