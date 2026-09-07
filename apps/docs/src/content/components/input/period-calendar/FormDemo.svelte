<script lang="ts">
	import {
		ZPeriodCalendar,
		ZForm,
		ZFormField,
		ZButton,
		ZStack,
		ZText,
		createFormModel,
		monthPeriod,
		type MonthPeriod
	} from '@zadmin/zui';
	const model = createFormModel<{ month: MonthPeriod | null }>({
		defaultValues: { month: monthPeriod(2026, 9) }
	});
	let result = $state('尚未提交');
</script>

<ZForm
	{model}
	onValidSubmit={({ formData }) => {
		result = String(formData.get('month'));
	}}
>
	<ZStack gap="small">
		<ZFormField name="month" label="必填报表月份" required
			><ZPeriodCalendar granularity="month" /></ZFormField
		>
		<ZButton type="submit">提交月份</ZButton><ZButton type="reset" variant="outline"
			>恢复默认月份</ZButton
		>
		<ZText tone="muted">FormData={result}。Delete 可清空，必填校验会阻止提交空选择。</ZText>
	</ZStack>
</ZForm>
