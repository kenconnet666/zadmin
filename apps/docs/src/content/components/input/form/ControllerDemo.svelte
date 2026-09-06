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
	interface ReleaseValues {
		channel: string;
		release: string;
	}
	const schema: StandardSchemaV1<ReleaseValues, ReleaseValues> = {
		'~standard': {
			version: 1,
			vendor: 'zui-docs-controller',
			validate(input) {
				const values = input as ReleaseValues;
				return /^\d+\.\d+\.\d+$/.test(values.release)
					? { value: values }
					: { issues: [{ message: 'Schema：请输入x.y.z版本号', path: ['release'] }] };
			}
		}
	};
	const model = createFormModel<ReleaseValues>({
		defaultValues: { channel: 'stable', release: '1.0.0' }
	});
	let controller = $state<ZFormController<ReleaseValues, ReleaseValues> | null>(null);
	let formState = $state<FormState>();
	let validationResult = $state('尚未重新校验');
	$effect(() => {
		const current = controller;
		if (!current) return;
		formState = current.getState();
		return current.subscribeState((next) => (formState = next));
	});
</script>

<ZStack gap="medium">
	<ZForm bind:controller {model} {schema}>
		<ZStack gap="medium">
			<ZFormField name="release" label="发布版本"><ZInput /></ZFormField>
			<ZFormField name="channel" label="发布通道"><ZInput /></ZFormField>
		</ZStack>
	</ZForm>
	<ZStack direction="row" gap="small" wrap>
		<ZButton
			type="button"
			onclick={() =>
				controller?.setValues((current) => ({
					...current,
					channel: 'preview',
					release: '2.0.0'
				}))}>批量编辑</ZButton
		>
		<ZButton
			type="button"
			variant="outline"
			onclick={() =>
				controller?.initialize({ channel: 'stable', release: '2.1.0' }, { keepDirtyValues: true })}
			>合并服务端初始值</ZButton
		>
		<ZButton type="button" variant="outline" onclick={() => controller?.resetField('release')}
			>重置版本字段</ZButton
		>
		<ZButton
			type="button"
			variant="outline"
			onclick={async () => {
				const result = await controller?.validate();
				validationResult = result?.valid ? '整体有效' : '整体仍有错误（包括server/manual）';
			}}>只重新校验Schema</ZButton
		>
		<ZButton
			type="button"
			variant="outline"
			onclick={() => controller?.setErrors({ release: ['服务端：版本已存在'] })}
			>设置服务端错误</ZButton
		>
		<ZButton
			type="button"
			variant="outline"
			onclick={() => controller?.setFieldFeedback('channel', { errors: ['手工：需要审批'] })}
			>设置手工错误</ZButton
		>
		<ZButton type="button" variant="ghost" onclick={() => controller?.clearErrors()}
			>清空全部错误</ZButton
		>
	</ZStack>
	<ZText tone="muted"
		>dirty={formState?.dirty ?? false} · touched={formState?.touched ?? false} · errors={Object.keys(
			formState?.errors ?? {}
		).length} · values={JSON.stringify(controller?.getValues())}</ZText
	>
	<ZText tone="muted">{validationResult}</ZText>
	<ZText tone="muted"
		>initialize会更新reset基线；keepDirtyValues保留用户已修改字段。重新校验只更新schema层，已有server/manual错误不会被覆盖。</ZText
	>
</ZStack>
