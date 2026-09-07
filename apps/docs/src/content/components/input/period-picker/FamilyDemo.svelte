<script lang="ts">
	import {
		ZPeriodPicker,
		ZStack,
		ZText,
		ZForm,
		ZFormField,
		ZButton,
		createFormModel,
		monthPeriod,
		type MonthPeriod
	} from '@zadmin/zui';
	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;
	const model = createFormModel<{ month: MonthPeriod | null }>({
		defaultValues: { month: monthPeriod(2026, 9) }
	});
	let result = $state('尚未提交');
</script>

<ZStack gap="medium">
	{#each sizes as size (size)}<ZPeriodPicker
			granularity="month"
			{size}
			defaultValue={monthPeriod(2026, 9)}
			pickerLabel={`${size} 月份`}
		/>{/each}
	<ZPeriodPicker
		granularity="month"
		readonly
		defaultValue={monthPeriod(2026, 9)}
		pickerLabel="只读月份"
	/>
	<ZPeriodPicker
		granularity="month"
		disabled
		defaultValue={monthPeriod(2026, 9)}
		pickerLabel="禁用月份"
	/>
	<ZForm
		{model}
		onValidSubmit={({ formData }) => {
			result = String(formData.get('month'));
		}}
	>
		<ZStack gap="small"
			><ZFormField name="month" label="报表月份" required
				><ZPeriodPicker granularity="month" /></ZFormField
			><ZButton type="submit">提交月份</ZButton><ZButton type="reset" variant="outline"
				>恢复月份</ZButton
			><ZText tone="muted">FormData={result}</ZText></ZStack
		>
	</ZForm>
</ZStack>
