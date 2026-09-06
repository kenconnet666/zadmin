<script lang="ts">
	import type { StandardSchemaV1 } from '@standard-schema/spec';
	import {
		createFormModel,
		ZButton,
		ZForm,
		ZFormField,
		ZInput,
		ZStack,
		ZText,
		type FormState,
		type ZFormController
	} from '@zadmin/zui';
	interface SignupInput {
		age: string;
		email: string;
	}
	interface SignupOutput {
		age: number;
		canonicalEmail: string;
	}
	const schema: StandardSchemaV1<SignupInput, SignupOutput> = {
		'~standard': {
			version: 1,
			vendor: 'zui-docs',
			validate(input) {
				const values = input as SignupInput;
				const age = Number(values.age);
				const issues: { message: string; path: readonly string[] }[] = [];
				if (!values.email.includes('@'))
					issues.push({ message: '请输入有效邮箱', path: ['email'] });
				if (!Number.isInteger(age) || age < 18)
					issues.push({ message: '年龄必须是至少18岁的整数', path: ['age'] });
				return issues.length
					? { issues }
					: { value: { age, canonicalEmail: values.email.trim().toLowerCase() } };
			}
		}
	};
	const model = createFormModel<SignupInput>({
		defaultValues: { age: '20', email: 'Alice@Example.com' }
	});
	let controller = $state<ZFormController<SignupOutput, SignupInput> | null>(null);
	let formState = $state<FormState>();
	let result = $state('尚未提交');
	let submitError = $state('无');
	let processingCount = $state(0);
	function delay(milliseconds: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, milliseconds));
	}
	$effect(() => {
		const current = controller;
		if (!current) return;
		formState = current.getState();
		return current.subscribeState((next) => (formState = next));
	});
</script>

<ZForm
	bind:controller
	{model}
	{schema}
	onSubmitError={(error) => (submitError = error instanceof Error ? error.message : String(error))}
	onValidSubmit={async ({ data, formData }) => {
		processingCount += 1;
		await delay(500);
		if (data.canonicalEmail.endsWith('@blocked.example')) throw new Error('服务端拒绝该域名');
		result = `typed age=${data.age} (${typeof data.age})；FormData age=${formData.get('age')} (${typeof formData.get('age')})`;
	}}
>
	<ZStack gap="medium">
		<ZFormField name="email" label="邮箱" required feedbackMinLines={1}
			><ZInput autocomplete="email" type="email" /></ZFormField
		>
		<ZFormField name="age" label="年龄" required feedbackMinLines={1}
			><ZInput inputmode="numeric" /></ZFormField
		>
		<ZStack direction="row" gap="small" wrap>
			<ZButton type="submit" aria-busy={formState?.submitting || undefined}
				>{formState?.submitting ? '提交中' : '异步提交'}</ZButton
			>
			<ZButton type="reset" variant="outline">重置</ZButton>
		</ZStack>
		<ZText tone="muted">{result}</ZText>
		<ZText tone="muted">onValidSubmit实际进入次数：{processingCount}</ZText>
		<ZText tone="muted">提交错误：{submitError}</ZText>
		<ZText tone="muted"
			>onValidSubmit等待期间submitting为true，重复语义提交会被拦截；Promise拒绝由onSubmitError接收。</ZText
		>
	</ZStack>
</ZForm>
