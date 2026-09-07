<script lang="ts">
	import { CalendarDateTime } from '@internationalized/date';
	import {
		createFormModel,
		ZDateTimeField,
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
	{#each sizes as size (size)}
		<ZDateTimeField
			aria-label={`${size} 日期时间`}
			{size}
			defaultValue={new CalendarDateTime(2026, 9, 7, 10, 30)}
			hourCycle={24}
		/>
	{/each}
	<ZForm
		{model}
		onValidSubmit={({ formData }) => {
			submitted = String(formData.get('at'));
		}}
	>
		<ZStack gap="small">
			<ZFormField name="at" label="表单计划时间" required
				><ZDateTimeField hourCycle={24} /></ZFormField
			>
			<ZButton type="submit">提交计划</ZButton>
			<ZButton type="reset" variant="outline">恢复默认时间</ZButton>
			<ZText tone="muted">FormData at={submitted}</ZText>
		</ZStack>
	</ZForm>
</ZStack>
