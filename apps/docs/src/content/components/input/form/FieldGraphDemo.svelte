<script lang="ts">
	import type { StandardSchemaV1 } from '@standard-schema/spec';
	import {
		ZButton,
		ZForm,
		ZFormField,
		ZInput,
		ZStack,
		ZText,
		type FormFieldState
	} from '@zadmin/zui';

	interface PasswordInput {
		account: { email: string };
		confirm: string;
		password: string;
	}

	interface PasswordOutput extends PasswordInput {
		canonicalEmail: string;
	}

	const schema: StandardSchemaV1<PasswordInput, PasswordOutput> = {
		'~standard': {
			version: 1,
			vendor: 'zui-docs-field-graph',
			validate(input) {
				const values = input as PasswordInput;
				const issues: { message: string; path: readonly (string | number)[] }[] = [];
				if (!String(values.account?.email ?? '').includes('@')) {
					issues.push({ message: '请输入有效邮箱', path: ['account', 'email'] });
				}
				if (String(values.confirm ?? '') !== String(values.password ?? '')) {
					issues.push({ message: '两次密码不一致', path: ['confirm'] });
				}
				return issues.length > 0
					? { issues }
					: {
							value: {
								...values,
								canonicalEmail: values.account.email.trim().toLowerCase()
							}
						};
			}
		}
	};
	let showConfirm = $state(true);
	let confirmState = $state<FormFieldState>();
	let result = $state('尚未提交');
</script>

<ZForm
	{schema}
	validateOn={['change', 'blur', 'submit']}
	validationDelay={80}
	onValidSubmit={(detail) => (result = detail.data.canonicalEmail)}
>
	<ZStack gap="medium">
		<ZFormField name={['account', 'email']} label="邮箱" required>
			<ZInput autocomplete="email" placeholder="alice@example.com" />
		</ZFormField>
		<ZFormField name="password" label="密码" required>
			<ZInput autocomplete="new-password" type="password" />
		</ZFormField>
		{#if showConfirm}
			<ZFormField
				name="confirm"
				dependencies={['password']}
				label="确认密码"
				onStateChange={(state) => (confirmState = state)}
				required
			>
				<ZInput autocomplete="new-password" type="password" />
			</ZFormField>
		{/if}
		<ZStack direction="row" gap="medium" wrap>
			<ZButton type="submit">验证并提交</ZButton>
			<ZButton type="button" variant="secondary" onclick={() => (showConfirm = !showConfirm)}>
				{showConfirm ? '卸载确认字段' : '挂载确认字段'}
			</ZButton>
		</ZStack>
		<ZText tone="muted">
			confirm dirty/validating/errors = {confirmState?.dirty ?? false}/{confirmState?.validating ??
				false}/{confirmState?.errors.length ?? 0} · output = {result}
		</ZText>
	</ZStack>
</ZForm>
