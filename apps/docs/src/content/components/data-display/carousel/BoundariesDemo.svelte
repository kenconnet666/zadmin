<script lang="ts">
	import { ZCarousel } from '@zadmin/zui';

	const items = [
		{ id: 'first', label: '第一步', copy: '准备发布参数。' },
		{ id: 'second', label: '第二步', copy: '确认并开始发布。' }
	];
</script>

<ZCarousel
	ariaLabel="不循环的发布步骤"
	{items}
	itemKey={(item) => item.id}
	itemLabel={(item) => item.label}
	loop={false}
>
	{#snippet item(item)}<h4>{item.label}</h4>
		<p>{item.copy}</p>{/snippet}
</ZCarousel>
