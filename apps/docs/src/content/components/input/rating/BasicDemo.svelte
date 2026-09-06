<script lang="ts">
	import { ZField, ZRating, ZText } from '@zadmin/zui';

	let value = $state(3);
</script>

<ZField
	label="服务评分"
	description="Field提供组名称，每个真实radio由itemLabel分别命名。"
	name="rating"
>
	<ZRating bind:value itemLabel={(current) => `${current}星`} />
</ZField>
<ZText tone="muted">当前评分：{value || '尚未评分'}</ZText>
