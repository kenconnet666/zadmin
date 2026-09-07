<script lang="ts">
	import { CalendarDateTime } from '@internationalized/date';
	import {
		createFormModel,
		ZDateTimeRangePicker,
		ZForm,
		ZFormField,
		ZButton,
		ZStack,
		ZText
	} from '@zadmin/zui';
	type Range = { start: CalendarDateTime | null; end: CalendarDateTime | null };
	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;
	const initial = {
		start: new CalendarDateTime(2026, 9, 7, 9),
		end: new CalendarDateTime(2026, 9, 7, 17)
	};
	const model = createFormModel<{ window: Range | null }>({ defaultValues: { window: initial } });
	let submitted = $state('尚未提交');
</script>

<ZStack gap="medium">
	{#each sizes as size (size)}<ZDateTimeRangePicker
			aria-label={`${size} 日期时间范围`}
			{size}
			defaultValue={initial}
			hourCycle={24}
		/>{/each}
	<ZDateTimeRangePicker
		aria-label="只读日期时间范围"
		readonly
		defaultValue={initial}
		hourCycle={24}
	/>
	<ZDateTimeRangePicker
		aria-label="禁用日期时间范围"
		disabled
		defaultValue={initial}
		hourCycle={24}
	/>
	<ZForm
		{model}
		onValidSubmit={({ formData }) => {
			submitted = JSON.stringify(Object.fromEntries(formData));
		}}
	>
		<ZStack gap="small">
			<ZFormField name="window" label="维护窗口" required
				><ZDateTimeRangePicker hourCycle={24} /></ZFormField
			>
			<ZButton type="submit">提交维护窗口</ZButton>
			<ZButton type="reset" variant="outline">恢复维护窗口</ZButton>
			<ZText tone="muted">{submitted}</ZText>
		</ZStack>
	</ZForm>
</ZStack>
