<script lang="ts">
	import {
		createFormModel,
		ZButton,
		ZCheckbox,
		ZCheckboxGroup,
		ZForm,
		ZFormField,
		ZInput,
		ZNativeSelect,
		ZPasswordInput,
		ZStack,
		ZText,
		ZTextarea,
		type ZFormController
	} from '@zadmin/zui';

	interface ProfileValues {
		bio: string;
		channel: string;
		name: string;
		password: string;
		reports: boolean;
		topics: readonly string[];
	}
	const defaults: ProfileValues = {
		bio: '负责每周发布',
		channel: 'stable',
		name: 'Alice',
		password: 'release-secret',
		reports: true,
		topics: ['quality']
	};
	const model = createFormModel<ProfileValues>({ defaultValues: defaults });
	let controller = $state<ZFormController<ProfileValues, ProfileValues> | null>(null);
	let nativeSnapshot = $state('尚未提交');
	const topicOptions = [
		{ label: '质量', value: 'quality' },
		{ label: '性能', value: 'performance' }
	] as const;
</script>

<ZForm
	bind:controller
	{model}
	onValidSubmit={({ formData }) => (nativeSnapshot = JSON.stringify(Object.fromEntries(formData)))}
>
	<ZStack gap="medium">
		<ZFormField name="name" label="负责人"><ZInput autocomplete="name" /></ZFormField>
		<ZFormField name="password" label="发布口令"
			><ZPasswordInput autocomplete="current-password" /></ZFormField
		>
		<ZFormField name="bio" label="职责说明" readonly><ZTextarea rows={2} /></ZFormField>
		<ZFormField name="channel" label="发布通道">
			<ZNativeSelect
				items={[
					{ label: '稳定版', value: 'stable' },
					{ label: '预览版', value: 'preview' }
				]}
			/>
		</ZFormField>
		<ZFormField name="reports" label="通知"
			><label><ZCheckbox value="weekly" /> 接收周报</label></ZFormField
		>
		<ZFormField name="topics" label="关注主题" disabled
			><ZCheckboxGroup options={topicOptions} orientation="horizontal" /></ZFormField
		>
		<ZStack direction="row" gap="small" wrap>
			<ZButton type="submit">比较提交值</ZButton>
			<ZButton
				type="button"
				variant="outline"
				onclick={() =>
					controller?.setValues((current) => ({
						...current,
						channel: 'preview',
						name: 'Release Owner'
					}))}>批量写入</ZButton
			>
			<ZButton type="reset" variant="outline">恢复默认值</ZButton>
		</ZStack>
		<ZText tone="muted">model dirty={model.dirty} · values={JSON.stringify(model.values)}</ZText>
		<ZText tone="muted">FormData={nativeSnapshot}</ZText>
		<ZText tone="muted"
			>readonly职责仍进入FormData；disabled主题不进入FormData，但两者都保留在model中。</ZText
		>
	</ZStack>
</ZForm>
