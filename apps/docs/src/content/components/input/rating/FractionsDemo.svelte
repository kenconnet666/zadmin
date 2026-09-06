<script lang="ts">
	import { ZField, ZRating, ZText } from '@zadmin/zui';

	let value = $state(2.5);
	let preview = $state(0);
</script>

<ZField label="半星精度" description="hover只预览视觉结果，离开后报告0且不改选中值。">
	<ZRating
		bind:value
		fractions={2}
		itemLabel={(current) => `${current}星`}
		onHoverChange={(current) => (preview = current)}
		tone="warning"
	/>
</ZField>
<ZText tone="muted">选中={value} · hover预览={preview || '无'}</ZText>
