<script lang="ts">
	import { Time } from '@internationalized/date';
	import { ZButton, ZField, ZStack, ZText, ZTimeField } from '@zadmin/zui';
	let value = $state<Time | null>(new Time(9, 30, 15));
</script>

<form data-testid="time-field-form">
	<ZStack gap="medium"
		><ZField label="执行时间" required
			><ZTimeField
				bind:value
				defaultValue={new Time(9, 30, 15)}
				data-testid="time-field-enabled"
				granularity="second"
				name="time"
			/></ZField
		><ZField label="只读时间"
			><ZTimeField defaultValue={new Time(10, 0)} name="readonly-time" readonly /></ZField
		><ZField label="禁用时间"
			><ZTimeField defaultValue={new Time(11, 0)} disabled name="disabled-time" /></ZField
		><ZButton type="reset" variant="outline">重置</ZButton><ZText tone="muted"
			>value = {value?.toString() ?? 'null'}</ZText
		></ZStack
	>
</form>
