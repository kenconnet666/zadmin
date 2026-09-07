<script lang="ts">
	import { CalendarDateTime } from '@internationalized/date';
	import {
		createFormModel,
		ZDateTimePicker,
		ZForm,
		ZFormField,
		ZButton,
		ZStack,
		ZText
	} from '@zadmin/zui';
	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;
	const model = createFormModel<{ at: CalendarDateTime | null }>({
		defaultValues: { at: new CalendarDateTime(2026, 9, 7, 10, 30) }
	});
	let submitted = $state('尚未提交');
</script>

<ZStack gap="medium">
	{#each sizes as size (size)}<ZDateTimePicker
			aria-label={`${size} 日期时间选择器`}
			{size}
			defaultValue={new CalendarDateTime(2026, 9, 7, 10, 30)}
			hourCycle={24}
		/>{/each}
	<ZDateTimePicker
		aria-label="只读日期时间"
		readonly
		defaultValue={new CalendarDateTime(2026, 9, 7, 10, 30)}
		hourCycle={24}
	/>
	<ZDateTimePicker
		aria-label="禁用日期时间"
		disabled
		defaultValue={new CalendarDateTime(2026, 9, 7, 10, 30)}
		hourCycle={24}
	/>
	<ZForm
		{model}
		onValidSubmit={({ formData }) => {
			submitted = String(formData.get('at'));
		}}
	>
		<ZStack gap="small">
			<ZFormField name="at" label="计划时刻" required><ZDateTimePicker hourCycle={24} /></ZFormField
			>
			<ZButton type="submit">提交计划</ZButton>
			<ZButton type="reset" variant="outline">恢复计划</ZButton>
			<ZText tone="muted">FormData at={submitted}</ZText>
		</ZStack>
	</ZForm>
</ZStack>
