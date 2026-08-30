<script lang="ts">
	import {
		ZButton,
		ZForm,
		ZFormField,
		ZInput,
		ZStack,
		ZText,
		type FormErrors,
		type FormSubmitDetail,
		type ZFormProps
	} from '@zadmin/zui';

	const schema: NonNullable<ZFormProps['schema']> = {
		'~standard': {
			version: 1,
			vendor: 'zui-docs',
			async validate(input) {
				await new Promise((resolve) => setTimeout(resolve, 60));
				const values = input as Record<string, FormDataEntryValue>;
				const issues: { message: string; path: string[] }[] = [];
				if (String(values.account ?? '').length < 3)
					issues.push({ message: '账号至少需要3个字符', path: ['account'] });
				if (!String(values.email ?? '').includes('@'))
					issues.push({ message: '请输入有效邮箱', path: ['email'] });
				return issues.length > 0 ? { issues } : { value: values };
			}
		}
	};
	let account = $state('');
	let email = $state('');
	let errors = $state<FormErrors>({});
	let validating = $state(false);
	let submitted = $state(false);
	let result = $state('none');
	function handleValid(detail: FormSubmitDetail) {
		result = String((detail.data as Record<string, string>).account);
	}
</script>

<ZForm
	bind:errors
	bind:submitted
	bind:validating
	onValidSubmit={handleValid}
	{schema}
	validateOn={['change', 'blur', 'submit']}
	validationDelay={80}
>
	<ZStack gap="medium">
		<ZFormField name="account" label="账号" description="提交失败会聚焦首个错误字段。" required>
			<ZInput autocomplete="username" bind:value={account} placeholder="alice" />
		</ZFormField>
		<ZFormField name="email" label="邮箱" required>
			<ZInput
				autocomplete="email"
				bind:value={email}
				type="email"
				placeholder="alice@example.com"
			/>
		</ZFormField>
		<ZStack direction="row" gap="medium">
			<ZButton type="submit" loading={validating}>保存</ZButton>
			<ZButton type="reset" variant="secondary">重置</ZButton>
		</ZStack>
		<ZText tone="muted"
			>submitted = {submitted} · errors = {Object.keys(errors).length} · result = {result}</ZText
		>
	</ZStack>
</ZForm>
