<script lang="ts">
	import { Time } from '@internationalized/date';
	import { ZButton, ZField, ZStack, ZText, ZTimeField } from '@zadmin/zui';
	let value = $state(new Time(9, 30, 15));
</script>

<form>
	<ZStack gap="medium"
		><ZField label="执行时间" required
			><ZTimeField
				bind:value
				defaultValue={new Time(9, 30, 15)}
				granularity="second"
				name="time"
			/></ZField
		><ZButton type="reset" variant="secondary">重置</ZButton><ZText tone="muted"
			>value = {value.toString()}</ZText
		></ZStack
	>
</form>
