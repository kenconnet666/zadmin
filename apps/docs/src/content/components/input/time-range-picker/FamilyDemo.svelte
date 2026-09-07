<script lang="ts">
	import { Time } from '@internationalized/date';
	import {
		createFormModel,
		ZTimeRangePicker,
		ZForm,
		ZFormField,
		ZButton,
		ZStack,
		ZText,
		type TimeRangeValue
	} from '@zadmin/zui';
	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;
	const model = createFormModel<{ hours: TimeRangeValue | null }>({
		defaultValues: { hours: { start: new Time(9), end: new Time(17) } }
	});
	let submitted = $state('尚未提交');
</script>

<ZStack gap="medium">
	{#each sizes as size (size)}<ZTimeRangePicker
			aria-label={`${size} 时间范围`}
			{size}
			hourCycle={24}
			defaultValue={{ start: new Time(9), end: new Time(17) }}
		/>{/each}
	<ZForm
		{model}
		onValidSubmit={({ formData }) => {
			submitted = JSON.stringify(Object.fromEntries(formData));
		}}
	>
		<ZStack gap="small">
			<ZFormField name="hours" label="营业时间" required
				><ZTimeRangePicker hourCycle={24} /></ZFormField
			>
			<ZButton type="submit">提交营业时间</ZButton>
			<ZButton type="reset" variant="outline">恢复默认范围</ZButton>
			<ZText tone="muted">{submitted}</ZText>
		</ZStack>
	</ZForm>
</ZStack>
