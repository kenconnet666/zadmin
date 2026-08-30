<script lang="ts">
	import { CalendarDate } from '@internationalized/date';
	import { ZButton, ZDateField, ZField, ZStack, ZText } from '@zadmin/zui';
	let value = $state(new CalendarDate(2026, 8, 18));
</script>

<form>
	<ZStack gap="medium"
		><ZField label="上线日期" description="segment顺序由locale决定。" required
			><ZDateField
				bind:value
				defaultValue={new CalendarDate(2026, 8, 18)}
				locale="zh-CN"
				name="date"
			/></ZField
		><ZButton type="reset" variant="secondary">重置</ZButton><ZText tone="muted"
			>value = {value.toString()}</ZText
		></ZStack
	>
</form>
