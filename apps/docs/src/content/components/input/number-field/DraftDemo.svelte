<script lang="ts">
	import {
		createFormModel,
		ZNumberField,
		ZForm,
		ZFormField,
		ZButton,
		ZStack,
		ZText,
		type FormState,
		type ZFormController
	} from '@zadmin/zui';
	type Values = { amount: number | undefined };
	const model = createFormModel<Values>({ defaultValues: { amount: 12.5 } });
	let controller = $state<ZFormController<Values, Values> | null>(null);
	let formState = $state<FormState>();
	let submission = $state('尚未提交');
</script>

<ZForm
	{model}
	bind:controller
	onStateChange={(next) => {
		formState = next;
	}}
	onValidSubmit={({ formData }) => {
		submission = String(formData.get('amount'));
	}}
>
	<ZStack gap="small">
		<ZFormField name="amount" label="预算金额" required
			><ZNumberField locale="zh-CN" precision={1} /></ZFormField
		>
		<ZText tone="muted"
			>模型金额={model.values.amount ?? '空'} · 表单 dirty={formState?.dirty ?? false} · valid={formState?.valid ??
				true}</ZText
		>
		<ZText tone="muted"
			>输入单独的负号时，原始草稿尚未完成，模型保持上次有效金额；失焦恢复数字字段既有格式化行为。字段重置也会撤销草稿。</ZText
		>
		<ZButton type="submit">提交金额</ZButton>
		<ZButton variant="outline" onclick={() => controller?.resetField('amount')}
			>恢复金额字段</ZButton
		>
		<ZText tone="muted">提交金额={submission}</ZText>
	</ZStack>
</ZForm>
